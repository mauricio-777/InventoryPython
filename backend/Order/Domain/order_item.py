from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from Database.config import Base
from CommonLayer.domain.autitable_entity import AuditableEntity

class OrderItem(Base, AuditableEntity):
    __tablename__ = "order_items"

    id = Column(String(50), primary_key=True, index=True)
    order_id = Column(String(50), ForeignKey("orders.id"), nullable=False)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=False)
    
    # Specific batch assigned during the PICKING phase.
    # Nullable initially, populated by the picker to guarantee FIFO precision.
    batch_id = Column(String(50), ForeignKey("batches.id"), nullable=True)

    quantity_requested = Column(Integer, nullable=False)
    quantity_picked = Column(Integer, default=0, nullable=False)
    
    unit_price = Column(Float, nullable=False) # Sale price locked at order creation time

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
    batch = relationship("Batch")
