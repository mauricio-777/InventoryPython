from sqlalchemy import Column, String, Integer, Float, Boolean
from sqlalchemy.orm import relationship
from Database.config import Base
from CommonLayer.domain.autitable_entity import AuditableEntity

class Product(Base, AuditableEntity):
    __tablename__ = "products"

    id = Column(String(50), primary_key=True, index=True)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(200), index=True, nullable=False)
    description = Column(String(500), nullable=True)
    category = Column(String(100), index=True, nullable=False)
    unit_measure = Column(String(50), nullable=False)
    unit_value = Column(Float, default=1.0, nullable=False)
    is_perishable = Column(Boolean, default=False, nullable=False)
    expiration_date = Column(String(50), nullable=True)
    suggested_price = Column(Float, nullable=False)

    batches = relationship("Batch", back_populates="product", cascade="all, delete-orphan")
    movements = relationship("Movement", back_populates="product", cascade="all, delete-orphan")
    price_history = relationship("PriceHistory", back_populates="product", cascade="all, delete-orphan")
