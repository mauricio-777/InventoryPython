import uuid
from flask import Blueprint, request, jsonify
from Database.config import get_db
from Product.Domain.movement import Movement, MovementType
from Product.Domain.batch import Batch
from Product.Adapters.movement_repository import MovementRepository
from Product.Adapters.product_repository import ProductRepository
from Product.Domain.stock_service import StockService
from datetime import datetime, timezone

router = Blueprint('batches', __name__, url_prefix='/api/v1/batches')

@router.route('/receive', methods=['POST'])
def receive_purchase():
    data = request.get_json()
    if not data or not data.get('product_id') or not data.get('quantity') or not data.get('unit_cost'):
        return jsonify({"error": "Missing required fields"}), 400

    db = next(get_db())
    stock_svc = StockService(db)
    
    try:
        expiration_date = None
        if data.get('expiration_date'):
            expiration_date = datetime.fromisoformat(data['expiration_date'].replace('Z', '+00:00'))

        batch, mov = stock_svc.register_entry(
            product_id=data.get('product_id'),
            quantity=int(data.get('quantity')),
            unit_cost=float(data.get('unit_cost')),
            supplier_id=data.get('supplier_id'),
            expiration_date=expiration_date
        )
        
        return jsonify({
            "id": batch.id,
            "product_id": batch.product_id,
            "initial_quantity": batch.initial_quantity,
            "available_quantity": batch.available_quantity,
            "unit_cost": batch.unit_cost,
            "purchase_date": batch.purchase_date.isoformat(),
            "expiration_date": batch.expiration_date.isoformat() if batch.expiration_date else None,
            "supplier_id": batch.supplier_id,
            "entry_transaction_ref": batch.entry_transaction_ref
        }), 201
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

@router.route('/product/<product_id>', methods=['GET'])
def get_batches_by_product(product_id):
    db = next(get_db())
    repo = MovementRepository(db)
    active_only = request.args.get('active_only', 'true').lower() == 'true'
    
    batches = repo.get_batches_by_product(product_id, active_only)
    result = []
    for b in batches:
        result.append({
            "id": b.id,
            "product_id": b.product_id,
            "initial_quantity": b.initial_quantity,
            "available_quantity": b.available_quantity,
            "unit_cost": b.unit_cost,
            "purchase_date": b.purchase_date.isoformat(),
            "expiration_date": b.expiration_date.isoformat() if b.expiration_date else None,
            "supplier_id": b.supplier_id,
            "entry_transaction_ref": b.entry_transaction_ref
        })
    return jsonify(result), 200
