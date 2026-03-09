import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from Order.Domain.order import Order, OrderStatus
from Order.Domain.order_item import OrderItem
from Order.Adapters.order_repository import OrderRepository
from Product.Domain.stock_service import StockService

class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = OrderRepository(db)
        self.stock_svc = StockService(db)

    def create_order(self, data: dict, user_id: str) -> Order:
        order = Order(
            id=str(uuid.uuid4()),
            customer_id=data['customer_id'],
            created_by_id=user_id,
            status=OrderStatus.PENDING.value,
            shipping_address=data.get('shipping_address'),
            notes=data.get('notes')
        )
        order.set_audit_create(user_id)
        self.repo.create_order(order)
        
        for item_data in data.get('items', []):
            item = OrderItem(
                id=str(uuid.uuid4()),
                order_id=order.id,
                product_id=item_data['product_id'],
                quantity_requested=item_data['quantity'],
                unit_price=item_data['unit_price']
            )
            item.set_audit_create(user_id)
            self.repo.create_item(item)
            
        return order

    def get_orders(self, **kwargs):
        return self.repo.get_orders(**kwargs)

    def get_order(self, order_id: str):
        order = self.repo.get_order_by_id(order_id)
        if not order:
            raise ValueError("Order not found")
        return order

    def update_status(self, order_id: str, new_status: str, user_id: str):
        order = self.get_order(order_id)
        
        # Validate status transitions (very basic check)
        valid_statuses = [e.value for e in OrderStatus]
        if new_status not in valid_statuses:
            raise ValueError("Invalid status")
            
        order.status = new_status
        order.set_audit_update(user_id)
        
        # When moving to EN_ROUTE, compute dispatch exits
        if new_status == OrderStatus.EN_ROUTE.value:
            self.stock_svc.dispatch_order(order)
            
        # When moving to DELIVERED, set delivered_at
        if new_status == OrderStatus.DELIVERED.value:
            order.delivered_at = datetime.now(timezone.utc)
            
        return self.repo.update_order(order)

    def assign_picker(self, order_id: str, picker_id: str, user_id: str):
        order = self.get_order(order_id)
        order.assigned_picker_id = picker_id
        order.set_audit_update(user_id)
        return self.repo.update_order(order)
        
    def assign_driver(self, order_id: str, driver_id: str, user_id: str):
        order = self.get_order(order_id)
        order.assigned_driver_id = driver_id
        order.set_audit_update(user_id)
        return self.repo.update_order(order)

    def pick_item(self, item_id: str, batch_id: str, quantity: int, user_id: str):
        item = self.repo.get_item_by_id(item_id)
        if not item:
            raise ValueError("Item not found")
            
        # Reserve stock specifically from this batch. The stock service will throw HTTP error if empty.
        # Pass product_id so it can auto-assign a batch if batch_id is 'DUMMY_BATCH_PARA_UI'.
        batch = self.stock_svc.reserve_batch_for_picking(batch_id, quantity, product_id=item.product_id)
        
        item.batch_id = batch.id
        item.quantity_picked += quantity
        item.set_audit_update(user_id)
        return self.repo.update_item(item)
