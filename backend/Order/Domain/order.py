from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
import enum
from Database.config import Base
from CommonLayer.domain.autitable_entity import AuditableEntity
from datetime import datetime

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    PICKING = "PICKING"
    READY_TO_SHIP = "READY_TO_SHIP"
    EN_ROUTE = "EN_ROUTE"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Order(Base, AuditableEntity):
    __tablename__ = "orders"

    id = Column(String(50), primary_key=True, index=True)
    customer_id = Column(String(50), ForeignKey("customers.id"), nullable=False)
    
    # Tracking the user who created it, who picked it, who drove it
    created_by_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    assigned_picker_id = Column(String(50), ForeignKey("users.id"), nullable=True)
    assigned_driver_id = Column(String(50), ForeignKey("users.id"), nullable=True)

    status = Column(String(50), default=OrderStatus.PENDING.value, nullable=False)
    
    shipping_address = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)

    # Proof of Delivery
    delivered_at = Column(DateTime, nullable=True)
    proof_of_delivery_url = Column(String(500), nullable=True)

    # Relationships
    customer = relationship("Customer")
    creator = relationship("User", foreign_keys=[created_by_id])
    picker = relationship("User", foreign_keys=[assigned_picker_id])
    driver = relationship("User", foreign_keys=[assigned_driver_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
