from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from Audit.Domain.audit_log import AuditLog
from Audit.Ports.audit_repository import AuditRepositoryPort


class AuditRepository(AuditRepositoryPort):
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, audit_log: AuditLog) -> AuditLog:
        """Crea un nuevo registro de auditoría"""
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        return audit_log
    
    def get_by_id(self, log_id: str) -> Optional[AuditLog]:
        """Obtiene un registro de auditoría por ID"""
        return self.db.query(AuditLog).filter(AuditLog.id == log_id).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[AuditLog]:
        """Obtiene todos los registros de auditoría"""
        return self.db.query(AuditLog).order_by(
            AuditLog.timestamp.desc()
        ).offset(skip).limit(limit).all()
    
    def get_by_user(self, user_id: str, skip: int = 0, limit: int = 100) -> List[AuditLog]:
        """Obtiene registros de auditoría por usuario"""
        return self.db.query(AuditLog).filter(
            AuditLog.user_id == user_id
        ).order_by(
            AuditLog.timestamp.desc()
        ).offset(skip).limit(limit).all()
    
    def get_by_table(self, table_name: str, skip: int = 0, limit: int = 100) -> List[AuditLog]:
        """Obtiene registros de auditoría por tabla"""
        return self.db.query(AuditLog).filter(
            AuditLog.table_name == table_name
        ).order_by(
            AuditLog.timestamp.desc()
        ).offset(skip).limit(limit).all()
    
    def get_by_date_range(self, 
                         start_date: datetime, 
                         end_date: datetime, 
                         skip: int = 0, 
                         limit: int = 100) -> List[AuditLog]:
        """Obtiene registros de auditoría por rango de fechas"""
        return self.db.query(AuditLog).filter(
            AuditLog.timestamp >= start_date,
            AuditLog.timestamp <= end_date
        ).order_by(
            AuditLog.timestamp.desc()
        ).offset(skip).limit(limit).all()
