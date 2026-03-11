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
                       supplier_id: Optional[str] = None, expiration_date: Optional[datetime] = None,
                       location_id: Optional[str] = None, user_id: str = 'system') -> Tuple[Batch, Movement]:
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
            supplier_id=supplier_id,
            location_id=location_id
        )
        new_batch.set_audit_create(user_id)
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
            notes="Recepción de compra"
        )
        new_movement.set_audit_create(user_id)
        self.repo.create_movement(new_movement)
        
        return new_batch, new_movement

    def register_exit(self, product_id: str, quantity: int, unit_price: Optional[float] = None, notes: str = "", user_id: str = "system") -> Tuple[Movement, float]:
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
        new_movement.set_audit_create(user_id)
        self.db.add(new_movement)
        self.db.commit()
        self.db.refresh(new_movement)

        return new_movement, total_cost

    def reserve_batch_for_picking(self, batch_id: str, quantity: int, product_id: str = None) -> Batch:
        """Called during the PICKING phase. Reserves stock from a specific physical batch or auto-assigns."""
        if batch_id == 'DUMMY_BATCH_PARA_UI' and product_id:
            # MVP: Auto-assign oldest batch with enough stock
            batches = self.repo.get_batches_by_product(product_id, active_only=True)
            batches.sort(key=lambda b: (b.expiration_date.replace(tzinfo=timezone.utc) if b.expiration_date else datetime.max.replace(tzinfo=timezone.utc), 
                                        b.purchase_date.replace(tzinfo=timezone.utc) if b.purchase_date else datetime.max.replace(tzinfo=timezone.utc)))
            
            # Find the first batch with sufficient quantity
            batch = next((b for b in batches if b.available_quantity >= quantity), None)
            if not batch:
                raise HTTPException(status_code=400, detail="No single physical batch has enough stock to fulfill this item. (Advanced batch splitting is pending).")
        else:
            batch = self.db.query(Batch).filter(Batch.id == batch_id).first()
            if not batch:
                raise HTTPException(status_code=404, detail="Batch not found")
        
        if batch.available_quantity < quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock in batch {batch_id}")
            
        batch.available_quantity -= quantity
        self.db.commit()
        self.db.refresh(batch)
        return batch

    def dispatch_order(self, order) -> List[Movement]:
        """Called when order moves to EN_ROUTE/DELIVERED. Generates the final EXIT movements."""
        movements = []
        for item in order.items:
            # We only generate movements for items that were actually picked and assigned a batch
            if item.quantity_picked > 0 and item.batch_id:
                batch = self.db.query(Batch).filter(Batch.id == item.batch_id).first()
                if not batch:
                    continue
                
                mov_id = str(uuid.uuid4())
                new_movement = Movement(
                    id=mov_id,
                    product_id=item.product_id,
                    customer_id=order.customer_id,
                    type=MovementType.EXIT,
                    quantity=item.quantity_picked,
                    unit_price=item.unit_price,
                    total_price=item.unit_price * item.quantity_picked,
                    total_cost=batch.unit_cost * item.quantity_picked,
                    reference_id=order.id, # Link movement directly to the Order
                    notes=f"Order {order.id} Dispatch (Picked from Location {batch.location_id})"
                )
                self.db.add(new_movement)
                movements.append(new_movement)
        
        self.db.commit()
        return movements

