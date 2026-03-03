from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from Product.Domain.batch import Batch
from Product.Domain.movement import Movement, MovementType
from Product.Domain.product import Product


class DashboardService:
    """Servicio para agregar datos del dashboard"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_total_inventory_value(self) -> float:
        """Calcula el valor total del inventario (cantidad disponible * costo unitario)"""
        batches = self.db.query(Batch).filter(Batch.available_quantity > 0).all()
        total_value = sum(batch.available_quantity * batch.unit_cost for batch in batches)
        return round(total_value, 2)
    
    def get_low_stock_products(self, threshold: int = 10) -> List[Dict[str, Any]]:
        """Obtiene productos con stock bajo (por debajo del umbral)"""
        low_stock = []
        
        # Obtener todos los productos
        products = self.db.query(Product).all()
        
        for product in products:
            # Calcular stock total disponible para este producto
            batches = self.db.query(Batch).filter(
                Batch.product_id == product.id
            ).filter(
                Batch.available_quantity > 0
            ).all()
            
            total_available = sum(batch.available_quantity for batch in batches)
            
            if total_available < threshold and total_available >= 0:
                low_stock.append({
                    "product_id": product.id,
                    "name": product.name,
                    "sku": product.sku,
                    "current_stock": total_available,
                    "threshold": threshold,
                    "unit_measure": product.unit_measure
                })
        
        return sorted(low_stock, key=lambda x: x['current_stock'])
    
    def get_recent_movements(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Obtiene los últimos movimientos con detalles"""
        movements = self.db.query(Movement).order_by(
            Movement.created_at.desc()
        ).limit(limit).all()
        
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
    
    def get_rotation_summary(self, days: int = 30) -> Dict[str, Any]:
        """
        Obtiene resumen de rotación de inventario (entradas vs salidas por mes)
        """
        # Fechas del período
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # Movimientos en el período
        movements = self.db.query(Movement).filter(
            Movement.created_at >= start_date,
            Movement.created_at <= end_date
        ).all()
        
        # Agrupar por tipo
        entries = [m for m in movements if m.type == MovementType.ENTRY]
        exits = [m for m in movements if m.type == MovementType.EXIT]
        
        # Compilar datos (agrupar por día o semana)
        rotation_data = {}
        
        for movement in movements:
            date_key = movement.created_at.strftime('%Y-%m-%d') if movement.created_at else 'Unknown'
            if date_key not in rotation_data:
                rotation_data[date_key] = {'entries': 0, 'exits': 0}
            
            if movement.type == MovementType.ENTRY:
                rotation_data[date_key]['entries'] += movement.quantity
            else:
                rotation_data[date_key]['exits'] += movement.quantity
        
        return {
            "period_days": days,
            "total_entries": len(entries),
            "total_exits": len(exits),
            "total_entry_quantity": sum(m.quantity for m in entries),
            "total_exit_quantity": sum(m.quantity for m in exits),
            "daily_data": [
                {
                    "date": date,
                    "entries": data['entries'],
                    "exits": data['exits']
                }
                for date, data in sorted(rotation_data.items())
            ]
        }
    
    def get_dashboard_summary(self, low_stock_threshold: int = 10) -> Dict[str, Any]:
        """Obtiene el resumen completo del dashboard"""
        return {
            "total_inventory_value": self.get_total_inventory_value(),
            "low_stock_products": self.get_low_stock_products(low_stock_threshold),
            "recent_movements": self.get_recent_movements(),
            "rotation_summary": self.get_rotation_summary(30)
        }
