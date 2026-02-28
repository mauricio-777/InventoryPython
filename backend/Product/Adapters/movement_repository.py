from typing import List, Optional
from sqlalchemy.orm import Session
from Product.Domain.batch import Batch
from Product.Domain.movement import Movement
from Product.Ports.movement_repository import MovementRepositoryPort

class MovementRepository(MovementRepositoryPort):
    def __init__(self, db: Session):
        self.db = db

    def create_batch(self, batch: Batch) -> Batch:
        self.db.add(batch)
        self.db.commit()
        self.db.refresh(batch)
        return batch

    def get_batches_by_product(self, product_id: str, active_only: bool = True) -> List[Batch]:
        query = self.db.query(Batch).filter(Batch.product_id == product_id)
        if active_only:
            query = query.filter(Batch.available_quantity > 0)
        return query.all()

    def create_movement(self, movement: Movement) -> Movement:
        self.db.add(movement)
        self.db.commit()
        self.db.refresh(movement)
        return movement

    def get_movements_by_product(self, product_id: str) -> List[Movement]:
        return self.db.query(Movement).filter(Movement.product_id == product_id).order_by(Movement.created_at.desc()).all()
