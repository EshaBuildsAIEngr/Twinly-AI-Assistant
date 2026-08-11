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


def _cosine_similarity(a: list, b: list) -> float:
    a, b = np.array(a), np.array(b)
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def search_knowledge(db: Session, user_id: str, query: str, top_k: int = 3) -> list[dict]:
    """Returns the top_k most relevant FAQ/policy entries for a customer query.
    This is what grounds the Support Agent's replies instead of letting it hallucinate.
    """
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
