from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from Database.config import Base
from CommonLayer.domain.autitable_entity import AuditableEntity

class MovementType(str, enum.Enum):
    ENTRY = "ENTRY"
    EXIT = "EXIT"
    ADJUSTMENT = "ADJUSTMENT"

class Movement(Base, AuditableEntity):
    __tablename__ = "movements"

    id = Column(String(50), primary_key=True, index=True)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=False)
    type = Column(String(50), nullable=False) # Use MovementType values
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=True) # Price applied to this transaction
    total_price = Column(Float, nullable=True) # quantity * unit_price
    total_cost = Column(Float, nullable=True) # FIFO calculated cost for EXIT
    reference_id = Column(String(50), nullable=True) # E.g., Order ID or Batch ID
    notes = Column(String(500), nullable=True)

    product = relationship("Product", back_populates="movements")
