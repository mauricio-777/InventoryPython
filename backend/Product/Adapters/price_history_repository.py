from typing import List
from sqlalchemy.orm import Session
from Product.Domain.price_history import PriceHistory
from Product.Ports.price_history_repository import PriceHistoryRepositoryPort

class PriceHistoryRepository(PriceHistoryRepositoryPort):
    def __init__(self, db: Session):
        self.db = db

    def create(self, history: PriceHistory) -> PriceHistory:
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history

    def get_by_product(self, product_id: str) -> List[PriceHistory]:
        return self.db.query(PriceHistory).filter(PriceHistory.product_id == product_id).order_by(PriceHistory.created_at.desc()).all()
