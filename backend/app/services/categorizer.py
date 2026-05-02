"""
Automatic categorization service.
Matches transaction descriptions against active rules.
"""
import unicodedata
import re
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from ..models import Rule


def normalize_text(text: str) -> str:
    """Uppercase, remove accents, collapse whitespace."""
    text = text.upper().strip()
    # Remove accents
    nfkd = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in nfkd if not unicodedata.combining(c))
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text)
    return text


def build_learning_keyword(description: str) -> str:
    """Build a conservative rule keyword from a reviewed transaction."""
    return normalize_text(description)


def categorize(
    db: Session,
    description: str,
    source: Optional[str] = None,
    person_id: Optional[int] = None,
) -> Tuple[Optional[int], Optional[int], bool]:
    """
    Try to categorize a transaction based on active rules.

    Returns:
        (category_id, person_id, is_reviewed)
        - If a rule matches: (rule.category_id, rule.person_id or given, True)
        - If no match: (None, person_id, False)
    """
    normalized = normalize_text(description)

    # Get active rules ordered by priority desc
    rules = (
        db.query(Rule)
        .filter(Rule.is_active == True)
        .order_by(Rule.priority.desc())
        .all()
    )

    for rule in rules:
        # Filter by source if rule specifies one
        if rule.source and source and rule.source != source:
            continue

        keyword = normalize_text(rule.keyword)
        if keyword in normalized:
            matched_person = rule.person_id if rule.person_id else person_id
            return (rule.category_id, matched_person, True)

    # No rule matched — mark as pending review
    return (None, person_id, False)
