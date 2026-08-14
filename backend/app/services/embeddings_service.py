import numpy as np
from sqlalchemy.orm import Session
from app.models import KnowledgeItem
from app.services.openai_service import get_embedding


def add_knowledge_item(db: Session, user_id: str, question: str, answer: str) -> KnowledgeItem:
    embedding = get_embedding(f"{question} {answer}")
    item = KnowledgeItem(user_id=user_id, question=question, answer=answer, embedding=embedding)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def generate_faqs_from_catalog(db: Session, user_id: str, raw_text: str) -> list[KnowledgeItem]:
    """Takes a raw, messy product catalog/price list (however the owner naturally
    writes it) and uses the LLM to turn it into individual Q&A knowledge entries —
    one per product/variant/size/color — so the Support Agent can answer specific
    customer questions accurately instead of only general ones.
    """
    import json
    from app.services.openai_service import chat_completion

    prompt = f"""A small business owner pasted their product catalog / price list below,
written in whatever casual format they normally use (Roman Urdu or English, messy is fine).

Turn this into a JSON array of specific Q&A pairs a customer might ask, covering every
product, size, color, and price variant mentioned. Cover things like:
- "Is [product] available?"
- "[Product] ka price kya hai?"
- "Kya [size/color] available hai?"

Each answer should be short, natural, and grounded ONLY in the text given — don't invent
products, prices, or details not present in the source text.

Return ONLY a JSON array like:
[{{"question": "...", "answer": "..."}}, ...]

SOURCE TEXT:
{raw_text}
"""

    response = chat_completion([{"role": "user", "content": prompt}])
    raw = response.choices[0].message.content.strip()
    raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        pairs = json.loads(raw)
    except json.JSONDecodeError:
        return []

    created = []
    for pair in pairs:
        q, a = pair.get("question"), pair.get("answer")
        if q and a:
            created.append(add_knowledge_item(db, user_id, q, a))
    return created


def _cosine_similarity(a: list, b: list) -> float:
    a, b = np.array(a), np.array(b)
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def search_knowledge(db: Session, user_id: str, query: str, top_k: int = 3) -> list[dict]:
    items = db.query(KnowledgeItem).filter(KnowledgeItem.user_id == user_id).all()
    if not items:
        return []

    query_embedding = get_embedding(query)
    scored = [
        (item, _cosine_similarity(query_embedding, item.embedding))
        for item in items if item.embedding
    ]
    scored.sort(key=lambda x: x[1], reverse=True)
    top = scored[:top_k]
    return [{"question": i.question, "answer": i.answer, "score": round(s, 3)} for i, s in top]