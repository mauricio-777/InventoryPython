from sqlalchemy import Column, String, DateTime, Text
from datetime import datetime, timezone
from Database.config import Base
from CommonLayer.domain.autitable_entity import AuditableEntity


class AuditLog(Base, AuditableEntity):
    __tablename__ = "audit_logs"
    
    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), nullable=False, index=True)
    user_name = Column(String(200), nullable=True)
    action = Column(String(100), nullable=False)  # CREATE, UPDATE, DELETE, READ
    table_name = Column(String(100), nullable=False, index=True)
    record_id = Column(String(50), nullable=False, index=True)
    old_values = Column(Text, nullable=True)  # JSON string
    new_values = Column(Text, nullable=True)  # JSON string
    description = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
