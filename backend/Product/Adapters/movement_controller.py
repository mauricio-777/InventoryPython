import uuid
from flask import Blueprint, request, jsonify
from Database.config import get_db
from Product.Domain.stock_service import StockService
from Product.Adapters.movement_repository import MovementRepository
from datetime import datetime

router = Blueprint('movements', __name__, url_prefix='/api/v1/movements')

@router.route('/sale', methods=['POST'])
def register_sale():
    data = request.get_json()
    if not data or not data.get('product_id') or not data.get('quantity'):
        return jsonify({"error": "Missing required fields"}), 400

    db = next(get_db())
    stock_svc = StockService(db)
    
    try:
        unit_price = data.get('unit_price')
        if unit_price is not None:
            unit_price = float(unit_price)

        mov, cost = stock_svc.register_exit(
            product_id=data.get('product_id'),
            quantity=int(data.get('quantity')),
            unit_price=unit_price,
            notes=data.get('notes', 'Sale')
        )
        
        return jsonify({
            "movement_id": mov.id,
            "product_id": mov.product_id,
            "quantity": mov.quantity,
            "unit_price": mov.unit_price,
            "total_price": mov.total_price,
            "total_cost": cost
        }), 200
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route('/product/<product_id>', methods=['GET'])
def get_movements_by_product(product_id):
    db = next(get_db())
    repo = MovementRepository(db)
    
    movements = repo.get_movements_by_product(product_id)
    result = []
    for m in movements:
        result.append({
            "id": m.id,
            "product_id": m.product_id,
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
    return jsonify(result), 200
