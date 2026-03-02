import uuid
from flask import Blueprint, request, jsonify
from Database.config import get_db
from Stakeholder.Domain.supplier import Supplier
from Stakeholder.Adapters.supplier_repository import SupplierRepository
from sqlalchemy.exc import IntegrityError


router = Blueprint('suppliers', __name__, url_prefix='/api/v1/suppliers')

@router.route('/', methods=['POST'])
def create_supplier():
    data = request.get_json()
    if not data or not data.get('nombre') or not data.get('numero_documento'):
        return jsonify({"error": "Missing required fields: nombre, numero_documento"}), 400

    db = next(get_db())
    repo = SupplierRepository(db)
    
    # Check if document already exists
    if repo.get_by_document(data.get('numero_documento')):
        return jsonify({"error": "A supplier with this document number already exists"}), 409

    if data.get('email') and repo.get_by_email(data.get('email')):
        return jsonify({"error": "A supplier with this email already exists"}), 409

    new_supplier = Supplier(
        id=str(uuid.uuid4()),
        nombre=data.get('nombre'),
        tipo_documento=data.get('tipo_documento', 'RUC'),
        numero_documento=data.get('numero_documento'),
        direccion=data.get('direccion'),
        telefono=data.get('telefono'),
        email=data.get('email'),
        plazo_entrega_dias=data.get('plazo_entrega_dias'),
        condiciones_compra=data.get('condiciones_compra')
    )
    
    try:
        supplier = repo.create(new_supplier)
        return jsonify({
            "id": supplier.id,
            "nombre": supplier.nombre,
            "tipo_documento": supplier.tipo_documento,
            "numero_documento": supplier.numero_documento,
            "direccion": supplier.direccion,
            "telefono": supplier.telefono,
            "email": supplier.email,
            "plazo_entrega_dias": supplier.plazo_entrega_dias,
            "condiciones_compra": supplier.condiciones_compra
        }), 201
    except IntegrityError:
        db.rollback()
        return jsonify({"error": "Database integrity error"}), 400

@router.route('/', methods=['GET'])
def get_suppliers():
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 100))
    search_query = request.args.get('q', '')
    
    db = next(get_db())
    repo = SupplierRepository(db)
    
    if search_query:
        suppliers = repo.search(search_query, skip=skip, limit=limit)
    else:
        suppliers = repo.get_all(skip=skip, limit=limit)
    
    result = [{
        "id": s.id,
        "nombre": s.nombre,
        "tipo_documento": s.tipo_documento,
        "numero_documento": s.numero_documento,
        "direccion": s.direccion,
        "telefono": s.telefono,
        "email": s.email,
        "plazo_entrega_dias": s.plazo_entrega_dias,
        "condiciones_compra": s.condiciones_compra
    } for s in suppliers]
    
    return jsonify(result), 200

@router.route('/<supplier_id>', methods=['GET'])
def get_supplier(supplier_id):
    db = next(get_db())
    repo = SupplierRepository(db)
    supplier = repo.get_by_id(supplier_id)
    if not supplier:
        return jsonify({"detail": "Supplier not found"}), 404
        
    return jsonify({
        "id": supplier.id,
        "nombre": supplier.nombre,
        "tipo_documento": supplier.tipo_documento,
        "numero_documento": supplier.numero_documento,
        "direccion": supplier.direccion,
        "telefono": supplier.telefono,
        "email": supplier.email,
        "plazo_entrega_dias": supplier.plazo_entrega_dias,
        "condiciones_compra": supplier.condiciones_compra
    }), 200

@router.route('/<supplier_id>', methods=['PUT', 'PATCH'])
def update_supplier(supplier_id):
    data = request.get_json()
    db = next(get_db())
    repo = SupplierRepository(db)
    
    supplier = repo.get_by_id(supplier_id)
    if not supplier:
        return jsonify({"detail": "Supplier not found"}), 404
        
    # Validation for unique constraints on update
    doc_check = repo.get_by_document(data.get('numero_documento', supplier.numero_documento))
    if doc_check and doc_check.id != supplier_id:
        return jsonify({"error": "Another supplier with this document number already exists"}), 409
        
    email_check = repo.get_by_email(data.get('email', supplier.email))
    if data.get('email') and email_check and email_check.id != supplier_id:
        return jsonify({"error": "Another supplier with this email already exists"}), 409

    if 'nombre' in data: supplier.nombre = data['nombre']
    if 'tipo_documento' in data: supplier.tipo_documento = data['tipo_documento']
    if 'numero_documento' in data: supplier.numero_documento = data['numero_documento']
    if 'direccion' in data: supplier.direccion = data['direccion']
    if 'telefono' in data: supplier.telefono = data['telefono']
    if 'email' in data: supplier.email = data['email']
    if 'plazo_entrega_dias' in data: supplier.plazo_entrega_dias = data['plazo_entrega_dias']
    if 'condiciones_compra' in data: supplier.condiciones_compra = data['condiciones_compra']
    
    updated_supplier = repo.update(supplier)
    return jsonify({
        "id": updated_supplier.id,
        "nombre": updated_supplier.nombre,
        "tipo_documento": updated_supplier.tipo_documento,
        "numero_documento": updated_supplier.numero_documento,
        "direccion": updated_supplier.direccion,
        "telefono": updated_supplier.telefono,
        "email": updated_supplier.email,
        "plazo_entrega_dias": updated_supplier.plazo_entrega_dias,
        "condiciones_compra": updated_supplier.condiciones_compra
    }), 200

@router.route('/<supplier_id>', methods=['DELETE'])
def delete_supplier(supplier_id):
    db = next(get_db())
    repo = SupplierRepository(db)
    
    try:
        success = repo.delete(supplier_id)
        if not success:
            return jsonify({"detail": "Supplier not found"}), 404
        return jsonify({"message": "Supplier deleted successfully"}), 200
    except IntegrityError:
        db.rollback()
        return jsonify({"error": "Cannot delete supplier because they have related transactions"}), 409
