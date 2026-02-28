from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from Database.config import Base
from CommonLayer.domain.autitable_entity import AuditableEntity

class Batch(Base, AuditableEntity):
    __tablename__ = "batches"

    id = Column(String(50), primary_key=True, index=True)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=False)
    initial_quantity = Column(Integer, nullable=False)
    available_quantity = Column(Integer, nullable=False)
    unit_cost = Column(Float, nullable=False)
    purchase_date = Column(DateTime, nullable=False)
    expiration_date = Column(DateTime, nullable=True)
    supplier_id = Column(String(50), nullable=True)
    entry_transaction_ref = Column(String(100), nullable=True)

    product = relationship("Product", back_populates="batches")
