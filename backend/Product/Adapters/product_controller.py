import uuid
from flask import Blueprint, request, jsonify
from Database.config import get_db
from Product.Domain.product import Product
from Product.Domain.price_history import PriceHistory
from Product.Adapters.product_repository import ProductRepository
from Product.Adapters.price_history_repository import PriceHistoryRepository
from datetime import datetime

router = Blueprint('products', __name__, url_prefix='/api/v1/products')

@router.route('/', methods=['POST'])
def create_product():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('category') or not data.get('unit_measure') or not data.get('sku'):
        return jsonify({"error": "Missing required fields"}), 400

    db = next(get_db())
    repo = ProductRepository(db)
    
    new_product = Product(
        id=str(uuid.uuid4()),
        sku=data.get('sku'),
        name=data.get('name'),
        description=data.get('description'),
        category=data.get('category'),
        unit_measure=data.get('unit_measure'),
        unit_value=float(data.get('unit_value', 1.0)),
        is_perishable=data.get('is_perishable', False),
        expiration_date=data.get('expiration_date'),
        suggested_price=float(data.get('suggested_price', 0))
    )
    product = repo.create(new_product)
    
    return jsonify({
        "id": product.id,
        "sku": product.sku,
        "name": product.name,
        "category": product.category,
        "unit_measure": product.unit_measure,
        "unit_value": product.unit_value,
        "is_perishable": product.is_perishable,
        "expiration_date": product.expiration_date,
        "suggested_price": product.suggested_price
    }), 201

@router.route('/', methods=['GET'])
def get_products():
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 100))
    
    db = next(get_db())
    repo = ProductRepository(db)
    products = repo.get_all(skip=skip, limit=limit)
    
    result = []
    for p in products:
        result.append({
            "id": p.id,
            "sku": p.sku,
            "name": p.name,
            "category": p.category,
            "unit_measure": p.unit_measure,
            "unit_value": p.unit_value,
            "is_perishable": p.is_perishable,
            "expiration_date": p.expiration_date,
            "suggested_price": p.suggested_price
        })
    return jsonify(result), 200

@router.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    db = next(get_db())
    repo = ProductRepository(db)
    product = repo.get_by_id(product_id)
    if not product:
        return jsonify({"detail": "Product not found"}), 404
        
    return jsonify({
        "id": product.id,
        "sku": product.sku,
        "name": product.name,
        "category": product.category,
        "unit_measure": product.unit_measure,
        "unit_value": product.unit_value,
        "is_perishable": product.is_perishable,
        "expiration_date": product.expiration_date,
        "suggested_price": product.suggested_price
    }), 200

@router.route('/update-prices', methods=['POST'])
def update_prices():
    updates = request.get_json()
    if not isinstance(updates, list):
        return jsonify({"error": "Expected a list of updates"}), 400

    db = next(get_db())
    prod_repo = ProductRepository(db)
    hist_repo = PriceHistoryRepository(db)
    
    updated_count = 0
    for update in updates:
        product = prod_repo.get_by_id(update.get('product_id'))
        if product and product.suggested_price != update.get('new_price'):
            history = PriceHistory(
                id=str(uuid.uuid4()),
                product_id=product.id,
                old_price=product.suggested_price,
                new_price=update.get('new_price'),
                reason=update.get('reason', "Massive update")
            )
            product.suggested_price = update.get('new_price')
            prod_repo.update(product)
            hist_repo.create(history)
            updated_count += 1
            
    return jsonify({"message": f"Updated {updated_count} product prices successfully"}), 200

@router.route('/<product_id>/price-history', methods=['GET'])
def get_price_history(product_id):
    db = next(get_db())
    hist_repo = PriceHistoryRepository(db)
    history = hist_repo.get_by_product(product_id)
    
    result = []
    for h in history:
        result.append({
            "id": h.id,
            "product_id": h.product_id,
            "old_price": h.old_price,
            "new_price": h.new_price,
            "reason": h.reason,
            "created_at": h.created_at.isoformat() if h.created_at else None
        })
    return jsonify(result), 200
