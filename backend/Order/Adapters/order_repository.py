from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from Order.Domain.order import Order
from Order.Domain.order_item import OrderItem

class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_order(self, order: Order) -> Order:
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order
        
    def create_item(self, item: OrderItem) -> OrderItem:
        self.db.add(item)
        self.db.commit()
        return item

    def get_order_by_id(self, order_id: str) -> Optional[Order]:
        return self.db.query(Order).filter(Order.id == order_id).first()

    def get_orders(self, status: Optional[str] = None, assigned_picker_id: Optional[str] = None, assigned_driver_id: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Order]:
        query = self.db.query(Order)
        if status:
            query = query.filter(Order.status == status)
        if assigned_picker_id:
            query = query.filter(Order.assigned_picker_id == assigned_picker_id)
        if assigned_driver_id:
            query = query.filter(Order.assigned_driver_id == assigned_driver_id)
            
        return query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    def update_order(self, order: Order) -> Order:
        self.db.commit()
        self.db.refresh(order)
        return order
        
    def get_item_by_id(self, item_id: str) -> Optional[OrderItem]:
        return self.db.query(OrderItem).filter(OrderItem.id == item_id).first()
        
    def update_item(self, item: OrderItem) -> OrderItem:
        self.db.commit()
        self.db.refresh(item)
        return item
