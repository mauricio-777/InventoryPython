from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from Product.Domain.movement import Movement, MovementType
from Product.Domain.product import Product
from Report.Ports.report_repository import ReportRepositoryPort


class SqlReportRepository(ReportRepositoryPort):
    """Repositorio para queries SQL complejas de reportes"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[dict]:
        """Obtiene todos los movimientos (para historial unificado)"""
        movements = self.db.query(Movement).order_by(
            Movement.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        result = []
        for m in movements:
            product = self.db.query(Product).filter(Product.id == m.product_id).first()
            result.append({
                "id": m.id,
                "product_id": m.product_id,
                "product_name": product.name if product else "Unknown",
                "product_sku": product.sku if product else "Unknown",
                "type": str(m.type),
                "quantity": m.quantity,
                "unit_price": m.unit_price,
                "total_price": m.total_price,
                "total_cost": m.total_cost,
                "created_at": m.created_at.isoformat() if m.created_at else None,
                "created_by": m.created_by
            })
        
        return result
    
    def get_by_id(self, report_id: str) -> Optional[dict]:
        """Obtiene un movimiento por ID"""
        movement = self.db.query(Movement).filter(Movement.id == report_id).first()
        if not movement:
            return None
        
        product = self.db.query(Product).filter(Product.id == movement.product_id).first()
        return {
            "id": movement.id,
            "product_id": movement.product_id,
            "product_name": product.name if product else "Unknown",
            "product_sku": product.sku if product else "Unknown",
            "type": str(movement.type),
            "quantity": movement.quantity,
            "unit_price": movement.unit_price,
            "total_price": movement.total_price,
            "total_cost": movement.total_cost,
            "created_at": movement.created_at.isoformat() if movement.created_at else None,
            "created_by": movement.created_by
        }
    
    def create(self, report: dict) -> dict:
        """No usada en este contexto"""
        pass
    
    def search_movements(self,
                        start_date: Optional[datetime] = None,
                        end_date: Optional[datetime] = None,
                        product_id: Optional[str] = None,
                        movement_type: Optional[str] = None,
                        user_id: Optional[str] = None,
                        skip: int = 0,
                        limit: int = 100) -> List[dict]:
        """
        Búsqueda avanzada de movimientos con múltiples filtros
        """
        query = self.db.query(Movement)
        
        # Filtrar por fecha
        if start_date:
            query = query.filter(Movement.created_at >= start_date)
        if end_date:
            query = query.filter(Movement.created_at <= end_date)
        
        # Filtrar por producto
        if product_id:
            query = query.filter(Movement.product_id == product_id)
        
        # Filtrar por tipo de movimiento
        if movement_type:
            query = query.filter(Movement.type == movement_type)
        
        # Filtrar por usuario
        if user_id:
            query = query.filter(Movement.created_by == user_id)
        
        # Ordenar y paginar
        movements = query.order_by(Movement.created_at.desc()).offset(skip).limit(limit).all()
        
        result = []
        for m in movements:
            product = self.db.query(Product).filter(Product.id == m.product_id).first()
            result.append({
                "id": m.id,
                "product_id": m.product_id,
                "product_name": product.name if product else "Unknown",
                "product_sku": product.sku if product else "Unknown",
                "type": str(m.type),
                "quantity": m.quantity,
                "unit_price": m.unit_price,
                "total_price": m.total_price,
                "total_cost": m.total_cost,
                "reference_id": m.reference_id,
                "notes": m.notes,
                "created_at": m.created_at.isoformat() if m.created_at else None,
                "created_by": m.created_by
            })
        
        return result
