import uuid

def generate_sku(category: str, name: str) -> str:
    cat_prefix = category[:3].upper() if category else "GEN"
    name_prefix = name[:3].upper() if name else "PRD"
    unique_suffix = str(uuid.uuid4())[:6].upper()
    return f"{cat_prefix}-{name_prefix}-{unique_suffix}"
