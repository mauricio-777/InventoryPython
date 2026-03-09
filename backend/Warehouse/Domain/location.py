from sqlalchemy import Column, String, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from Database.config import Base
from CommonLayer.domain.autitable_entity import AuditableEntity

class Location(Base, AuditableEntity):
    __tablename__ = "locations"

    id = Column(String(50), primary_key=True, index=True)
    zone = Column(String(50), nullable=False)   # e.g., A, B, Secos, Refrigerados
    aisle = Column(String(50), nullable=False)  # e.g., 01, 02
    rack = Column(String(50), nullable=False)   # e.g., A, B
    level = Column(String(50), nullable=False)  # e.g., 01, 02, 03

    # A physical location must be unique (Zone + Aisle + Rack + Level)
    __table_args__ = (
        UniqueConstraint('zone', 'aisle', 'rack', 'level', name='uq_location_physical_space'),
    )

    batches = relationship("Batch", back_populates="location")

    @property
    def composite_code(self):
        """Returns a human-readable location code like 'A-01-A-01'"""
        return f"{self.zone}-{self.aisle}-{self.rack}-{self.level}"
