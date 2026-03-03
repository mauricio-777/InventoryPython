from abc import ABC, abstractmethod
from typing import List, Optional, Any
from datetime import datetime


class AuditRepositoryPort(ABC):
    """Puerto para operaciones de repositorio de auditoría"""
    
    @abstractmethod
    def create(self, audit_log: Any) -> Any:
        """Crea un nuevo registro de auditoría"""
        pass
    
    @abstractmethod
    def get_by_id(self, log_id: str) -> Optional[Any]:
        """Obtiene un registro de auditoría por ID"""
        pass
    
    @abstractmethod
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Any]:
        """Obtiene todos los registros de auditoría"""
        pass
    
    @abstractmethod
    def get_by_user(self, user_id: str, skip: int = 0, limit: int = 100) -> List[Any]:
        """Obtiene registros de auditoría por usuario"""
        pass
    
    @abstractmethod
    def get_by_table(self, table_name: str, skip: int = 0, limit: int = 100) -> List[Any]:
        """Obtiene registros de auditoría por tabla"""
        pass
    
    @abstractmethod
    def get_by_date_range(self, 
                         start_date: datetime, 
                         end_date: datetime, 
                         skip: int = 0, 
                         limit: int = 100) -> List[Any]:
        """Obtiene registros de auditoría por rango de fechas"""
        pass
