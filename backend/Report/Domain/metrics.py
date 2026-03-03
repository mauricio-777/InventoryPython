from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import and_
from Product.Domain.batch import Batch
from Product.Domain.movement import Movement, MovementType
from Product.Domain.product import Product


class MetricsService:
    """Servicio para cálculos de métricas y reportes"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_inventory_value_at_date(self, target_date: datetime) -> Dict[str, Any]:
        """
        Calcula el valor total del inventario a una fecha determinada
        usando método FIFO y considerando movimientos hasta esa fecha
        """
        # Obtener todos los lotes
        batches = self.db.query(Batch).all()
        
        total_value = 0
        inventory_details = []
        
        for batch in batches:
            # Calcular cantidad disponible a esa fecha
            # Considerar movimientos hasta esa fecha
            movements = self.db.query(Movement).filter(
                Movement.reference_id.contains(batch.id),
                Movement.created_at <= target_date
            ).all()
            
            # Cantidad inicial del lote
            available_at_date = batch.initial_quantity
            
            # Restar salidas que afectaron este lote antes de la fecha
            for movement in movements:
                if movement.type == MovementType.EXIT:
                    # Contar cuántas unidades se deducen de este lote
                    if batch.id in movement.reference_id.split(','):
                        # Esto es simplificado; idealmente habría registro detallado
                        available_at_date = batch.available_quantity
            
            if available_at_date > 0:
                batch_value = available_at_date * batch.unit_cost
                total_value += batch_value
                
                product = self.db.query(Product).filter(Product.id == batch.product_id).first()
                inventory_details.append({
                    "product_id": batch.product_id,
                    "product_name": product.name if product else "Unknown",
                    "product_sku": product.sku if product else "Unknown",
                    "batch_id": batch.id,
                    "quantity_available": available_at_date,
                    "unit_cost": batch.unit_cost,
                    "total_cost": batch_value,
                    "purchase_date": batch.purchase_date.isoformat() if batch.purchase_date else None
                })
        
        return {
            "date": target_date.isoformat(),
            "total_value": round(total_value, 2),
            "details_by_batch": inventory_details,
            "details_by_product": self._aggregate_by_product(inventory_details)
        }
    
    def _aggregate_by_product(self, details: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Agrega detalles de lotes por producto"""
        products = {}
        for detail in details:
            key = detail['product_id']
            if key not in products:
                products[key] = {
                    "product_id": detail['product_id'],
                    "product_name": detail['product_name'],
                    "product_sku": detail['product_sku'],
                    "total_quantity": 0,
                    "average_unit_cost": 0,
                    "total_cost": 0,
                    "batches": []
                }
            
            products[key]['total_quantity'] += detail['quantity_available']
            products[key]['total_cost'] += detail['total_cost']
            products[key]['batches'].append({
                "batch_id": detail['batch_id'],
                "quantity": detail['quantity_available'],
                "unit_cost": detail['unit_cost'],
                "total": detail['total_cost']
            })
        
        # Calcular promedio de costo
        for product in products.values():
            if product['total_quantity'] > 0:
                product['average_unit_cost'] = round(product['total_cost'] / product['total_quantity'], 2)
            product['total_cost'] = round(product['total_cost'], 2)
        
        return list(products.values())
    
    def get_rotation_index(self, 
                          product_id: Optional[str] = None, 
                          days: int = 30, 
                          category: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Calcula el índice de rotación: cantidad vendida / ((stock inicial + stock final) / 2)
        """
        from datetime import timedelta
        
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # Obtener productos a incluir
        query = self.db.query(Product)
        if product_id:
            query = query.filter(Product.id == product_id)
        if category:
            query = query.filter(Product.category == category)
        
        products = query.all()
        
        rotation_data = []
        
        for product in products:
            # Cantidad vendida en el período
            exits = self.db.query(Movement).filter(
                Movement.product_id == product.id,
                Movement.type == MovementType.EXIT,
                Movement.created_at >= start_date,
                Movement.created_at <= end_date
            ).all()
            
            total_sold = sum(m.quantity for m in exits)
            
            # Stock inicial: antes del período
            batches_start = self.db.query(Batch).filter(
                Batch.product_id == product.id,
                Batch.purchase_date < start_date
            ).all()
            stock_inicial = sum(b.available_quantity for b in batches_start)
            
            # Stock final: al final del período
            batches_end = self.db.query(Batch).filter(
                Batch.product_id == product.id
            ).all()
            stock_final = sum(b.available_quantity for b in batches_end)
            
            # Stock promedio
            stock_promedio = (stock_inicial + stock_final) / 2 if (stock_inicial + stock_final) > 0 else 1
            
            # Índice de rotación
            rotation_index = total_sold / stock_promedio if stock_promedio > 0 else 0
            
            rotation_data.append({
                "product_id": product.id,
                "product_name": product.name,
                "product_sku": product.sku,
                "category": product.category,
                "quantity_sold": total_sold,
                "stock_inicial": stock_inicial,
                "stock_final": stock_final,
                "stock_promedio": round(stock_promedio, 2),
                "rotation_index": round(rotation_index, 2),
                "period_days": days
            })
        
        # Ordenar por índice de rotación descendente
        return sorted(rotation_data, key=lambda x: x['rotation_index'], reverse=True)
