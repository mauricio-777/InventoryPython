import uuid
from typing import Tuple, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
from Product.Domain.batch import Batch
from Product.Domain.movement import Movement, MovementType
from Product.Adapters.movement_repository import MovementRepository
from Product.Adapters.product_repository import ProductRepository


class StockService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = MovementRepository(db)
        self.product_repo = ProductRepository(db)

    def register_entry(self, product_id: str, quantity: int, unit_cost: float, 
                       supplier_id: Optional[str] = None, expiration_date: Optional[datetime] = None) -> Tuple[Batch, Movement]:
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")
        
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Create Batch
        batch_id = str(uuid.uuid4())
        new_batch = Batch(
            id=batch_id,
            product_id=product_id,
            initial_quantity=quantity,
            available_quantity=quantity,
            unit_cost=unit_cost,
            purchase_date=datetime.now(timezone.utc),
            expiration_date=expiration_date,
            supplier_id=supplier_id
        )
        self.repo.create_batch(new_batch)

        # Create Entry Movement
        mov_id = str(uuid.uuid4())
        new_movement = Movement(
            id=mov_id,
            product_id=product_id,
            type=MovementType.ENTRY,
            quantity=quantity,
            unit_price=unit_cost,
            total_price=unit_cost * quantity,
            reference_id=batch_id,
            notes="Purchase Entry"
        )
        self.repo.create_movement(new_movement)
        
        return new_batch, new_movement

    def register_exit(self, product_id: str, quantity: int, unit_price: Optional[float] = None, notes: str = "") -> Tuple[Movement, float]:
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        applied_unit_price = unit_price if unit_price is not None else product.suggested_price

        # Get active batches sorted by expiration date (if applicable) then purchase date
        batches = self.repo.get_batches_by_product(product_id, active_only=True)
        # Sort manually: First by expiration (if exists), then by purchase_date
        max_date = datetime.max.replace(tzinfo=timezone.utc)
        batches.sort(key=lambda b: (b.expiration_date.replace(tzinfo=timezone.utc) if b.expiration_date else max_date, 
                                    b.purchase_date.replace(tzinfo=timezone.utc) if b.purchase_date else max_date))

        total_available = sum(b.available_quantity for b in batches)
        if total_available < quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")

        remaining_to_deduct = quantity
        total_cost = 0.0
        affected_batches = []

        for batch in batches:
            if remaining_to_deduct <= 0:
                break
            
            deduct_amount = min(batch.available_quantity, remaining_to_deduct)
            batch.available_quantity -= deduct_amount
            remaining_to_deduct -= deduct_amount
            total_cost += deduct_amount * batch.unit_cost
            affected_batches.append(batch.id)

        # Create Exit Movement
        mov_id = str(uuid.uuid4())
        new_movement = Movement(
            id=mov_id,
            product_id=product_id,
            type=MovementType.EXIT,
            quantity=quantity,
            unit_price=applied_unit_price,
            total_price=applied_unit_price * quantity,
            total_cost=total_cost,
            reference_id=",".join(affected_batches),
            notes=notes
        )
        self.db.add(new_movement)
        self.db.commit() # Save batch updates and movement
        self.db.refresh(new_movement)

        return new_movement, total_cost
