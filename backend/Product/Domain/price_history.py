from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from Database.config import Base
from CommonLayer.domain.autitable_entity import AuditableEntity

class PriceHistory(Base, AuditableEntity):
    __tablename__ = "price_history"

    id = Column(String(50), primary_key=True, index=True)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=False)
    old_price = Column(Float, nullable=False)
    new_price = Column(Float, nullable=False)
    reason = Column(String(200), nullable=True)

    product = relationship("Product", back_populates="price_history")
