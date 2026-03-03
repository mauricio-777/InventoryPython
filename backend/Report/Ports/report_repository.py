from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any


class ReportRepositoryPort(ABC):
    """Puerto para operaciones de repositorio de reportes"""
    
    @abstractmethod
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Any]:
        """Obtiene todos los reportes"""
        pass
    
    @abstractmethod
    def get_by_id(self, report_id: str) -> Optional[Any]:
        """Obtiene un reporte por ID"""
        pass
    
    @abstractmethod
    def create(self, report: Any) -> Any:
        """Crea un nuevo reporte"""
        pass
