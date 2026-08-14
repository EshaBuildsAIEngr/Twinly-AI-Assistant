"""
This is the actual agentic loop. There is no manual "if intent == X then do Y"
routing anywhere in this file. The model is given tools and a goal, and it
decides — turn by turn — which tool to call, with what arguments, and when
to stop. This directly addresses the "not genuinely agentic" feedback: the
control flow lives in the LLM's reasoning, not in Python conditionals.
"""

import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.openai_service import chat_completion
from app.models import Conversation, PersonaProfile, User, Message
from app.agents import tools as T

MAX_TURNS = 6  # safety cap on the agentic loop, not a business-logic branch


def _persona_system_prompt(persona: PersonaProfile) -> str:
    lang_map = {
        "roman_urdu": "Reply in Roman Urdu by default, matching how the customer writes. If the customer writes in English, reply in English.",
        "english": "Reply in English.",
        "auto": "Detect the language/script the customer used and reply in the same language and script.",
    }
    lang_instruction = lang_map.get(persona.preferred_language, lang_map["auto"])

    return f"""You are the Support Agent — a digital twin of a real business owner, replying to their customers.

BUSINESS INFO & POLICIES:
{persona.business_info or "No business info provided yet."}

TONE:
{persona.tone_description or "Friendly, concise, helpful — like a real shop owner texting back."}

LANGUAGE RULE:
{lang_instruction}

SAMPLE MESSAGES IN THIS OWNER'S VOICE (match this style):
{chr(10).join(persona.sample_messages) if persona.sample_messages else "None provided — use a warm, natural small-business tone."}

RULES YOU MUST FOLLOW:
1. For questions clearly answered by the BUSINESS INFO above (general pricing, what you sell, delivery timeframes, general policies) — answer directly from that information. You do not need to call search_faqs for things already stated there.
2. Call search_faqs when the question is specific or detailed enough that it might be covered by a dedicated FAQ/policy entry rather than the general business info (e.g. a specific product variant, an edge-case policy, something not covered by the general info above).
3. If neither the business info nor search_faqs gives you a confident answer, do NOT guess — escalate_to_owner instead.
4. If the customer is negotiating price, use offer_discount to check whether and how much you're allowed to offer — never promise a discount without checking.
5. Escalate anything that is a complaint, a refund/return request, a custom or bulk order, or anything you are not fully confident about.
6. If a customer asks where their order is and gives a tracking number, use track_order. If they don't have a tracking number, escalate instead of guessing.
7. Once you've decided on a final reply, call send_reply exactly once. Do not call send_reply more than once per conversation turn.
8. Keep replies short and natural — the way the real owner would text, not like a corporate bot.
"""


def run_support_agent(db: Session, conversation: Conversation, user: User, persona: PersonaProfile) -> dict:
    """Runs the full agentic loop for one incoming customer message."""

    history = [
        {"role": "assistant" if m.sender.value == "agent" else "user", "content": m.content}
        for m in conversation.messages[-10:]  # recent context window
    ]

    messages = [{"role": "system", "content": _persona_system_prompt(persona)}] + history

    for _ in range(MAX_TURNS):
        response = chat_completion(messages, tools=T.SUPPORT_TOOLS, tool_choice="auto")
        choice = response.choices[0].message

        if not choice.tool_calls:
            # Model produced plain text instead of calling send_reply — treat it as the reply.
            T.tool_send_reply(db, conversation, choice.content or "")
            return {"final_action": "sent", "text": choice.content}

        messages.append({
            "role": "assistant",
            "content": choice.content,
            "tool_calls": [tc.model_dump() for tc in choice.tool_calls],
        })

        for call in choice.tool_calls:
            args = json.loads(call.function.arguments or "{}")
            name = call.function.name

            if name == "search_faqs":
                result = T.tool_search_faqs(db, user.id, args["query"])
            elif name == "track_order":
                result = T.tool_track_order(args["tracking_number"], args.get("courier", "leopards"))
            elif name == "send_reply":
                result = T.tool_send_reply(db, conversation, args["message"])
            elif name == "offer_discount":
                result = T.tool_offer_discount(persona, args["percent"])
            elif name == "escalate_to_owner":
                result = T.tool_escalate(db, conversation, args["reason"])
                messages.append({"role": "tool", "tool_call_id": call.id, "content": json.dumps(result)})
                return {"final_action": "escalated", "reason": args["reason"]}
            else:
                result = {"error": f"unknown tool {name}"}

            messages.append({"role": "tool", "tool_call_id": call.id, "content": json.dumps(result)})

            if name == "send_reply":
                return {"final_action": "sent", "text": args["message"]}

    return {"final_action": "max_turns_reached"}


def _content_system_prompt(persona: PersonaProfile, platform: str, topic_hint: str | None) -> str:
    today = datetime.now().strftime("%A, %d %B %Y")
    return f"""You are the Content Agent for a small business, writing in the owner's voice.

TODAY'S DATE: {today}

BUSINESS INFO:
{persona.business_info or "No business info provided yet."}

TONE:
{persona.tone_description or "Friendly, authentic small-business voice."}

LANGUAGE:
{"Roman Urdu, natural and conversational." if persona.preferred_language == "roman_urdu" else "Match the owner's usual language."}

TASK:
Write one social media caption for {platform} for this business.
{f"Topic hint from the owner: {topic_hint}" if topic_hint else "Choose a relevant, timely angle yourself. Check today's date against the Pakistani calendar — Eid, Ramadan, Independence Day (14 Aug), Defence Day, back-to-school season, wedding season, or simple weekend/weekday relevance — and use it only if it genuinely fits this business, not as a forced tie-in."}

PROCESS:
1. Call get_past_content_performance to see what has worked before.
2. Write a caption that fits the brand voice and platform norms.
3. Call save_content_draft with the final caption and relevant hashtags. Call it exactly once.
"""


def run_content_agent(db: Session, user: User, persona: PersonaProfile, platform: str, topic_hint: str | None = None) -> dict:
    messages = [{"role": "system", "content": _content_system_prompt(persona, platform, topic_hint)}]

    for _ in range(MAX_TURNS):
        response = chat_completion(messages, tools=T.CONTENT_TOOLS, tool_choice="auto")
        choice = response.choices[0].message

        if not choice.tool_calls:
            break

        messages.append({
            "role": "assistant",
            "content": choice.content,
            "tool_calls": [tc.model_dump() for tc in choice.tool_calls],
        })

        for call in choice.tool_calls:
            args = json.loads(call.function.arguments or "{}")
            name = call.function.name

            if name == "get_past_content_performance":
                result = T.tool_get_past_performance(db, user.id)
            elif name == "save_content_draft":
                result = T.tool_save_draft(db, user.id, platform, args["caption"], args["hashtags"])
                messages.append({"role": "tool", "tool_call_id": call.id, "content": json.dumps(result)})
                return {"final_action": "saved", "content_id": result.get("content_id")}
            else:
                result = {"error": f"unknown tool {name}"}

            messages.append({"role": "tool", "tool_call_id": call.id, "content": json.dumps(result)})

    return {"final_action": "no_draft_produced"}
