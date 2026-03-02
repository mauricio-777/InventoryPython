import uuid
from flask import Blueprint, request, jsonify
from Database.config import get_db
from Stakeholder.Domain.customer import Customer
from Stakeholder.Adapters.customer_repository import CustomerRepository
from sqlalchemy.exc import IntegrityError


router = Blueprint('customers', __name__, url_prefix='/api/v1/customers')

@router.route('/', methods=['POST'])
def create_customer():
    data = request.get_json()
    if not data or not data.get('nombre') or not data.get('numero_documento'):
        return jsonify({"error": "Missing required fields: nombre, numero_documento"}), 400

    db = next(get_db())
    repo = CustomerRepository(db)
    
    # Check if document already exists
    if repo.get_by_document(data.get('numero_documento')):
        return jsonify({"error": "A customer with this document number already exists"}), 409

    if data.get('email') and repo.get_by_email(data.get('email')):
        return jsonify({"error": "A customer with this email already exists"}), 409

    new_customer = Customer(
        id=str(uuid.uuid4()),
        nombre=data.get('nombre'),
        tipo_documento=data.get('tipo_documento', 'DNI'),
        numero_documento=data.get('numero_documento'),
        direccion=data.get('direccion'),
        telefono=data.get('telefono'),
        email=data.get('email'),
        condicion_pago=data.get('condicion_pago', 'CONTADO')
    )
    
    try:
        customer = repo.create(new_customer)
        return jsonify({
            "id": customer.id,
            "nombre": customer.nombre,
            "tipo_documento": customer.tipo_documento,
            "numero_documento": customer.numero_documento,
            "direccion": customer.direccion,
            "telefono": customer.telefono,
            "email": customer.email,
            "condicion_pago": customer.condicion_pago
        }), 201
    except IntegrityError:
        db.rollback()
        return jsonify({"error": "Database integrity error"}), 400

@router.route('/', methods=['GET'])
def get_customers():
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 100))
    search_query = request.args.get('q', '')
    
    db = next(get_db())
    repo = CustomerRepository(db)
    
    if search_query:
        customers = repo.search(search_query, skip=skip, limit=limit)
    else:
        customers = repo.get_all(skip=skip, limit=limit)
    
    result = [{
        "id": c.id,
        "nombre": c.nombre,
        "tipo_documento": c.tipo_documento,
        "numero_documento": c.numero_documento,
        "direccion": c.direccion,
        "telefono": c.telefono,
        "email": c.email,
        "condicion_pago": c.condicion_pago
    } for c in customers]
    
    return jsonify(result), 200

@router.route('/<customer_id>', methods=['GET'])
def get_customer(customer_id):
    db = next(get_db())
    repo = CustomerRepository(db)
    customer = repo.get_by_id(customer_id)
    if not customer:
        return jsonify({"detail": "Customer not found"}), 404
        
    return jsonify({
        "id": customer.id,
        "nombre": customer.nombre,
        "tipo_documento": customer.tipo_documento,
        "numero_documento": customer.numero_documento,
        "direccion": customer.direccion,
        "telefono": customer.telefono,
        "email": customer.email,
        "condicion_pago": customer.condicion_pago
    }), 200

@router.route('/<customer_id>', methods=['PUT', 'PATCH'])
def update_customer(customer_id):
    data = request.get_json()
    db = next(get_db())
    repo = CustomerRepository(db)
    
    customer = repo.get_by_id(customer_id)
    if not customer:
        return jsonify({"detail": "Customer not found"}), 404
        
    # Validation for unique constraints on update
    doc_check = repo.get_by_document(data.get('numero_documento', customer.numero_documento))
    if doc_check and doc_check.id != customer_id:
        return jsonify({"error": "Another customer with this document number already exists"}), 409
        
    email_check = repo.get_by_email(data.get('email', customer.email))
    if data.get('email') and email_check and email_check.id != customer_id:
        return jsonify({"error": "Another customer with this email already exists"}), 409

    if 'nombre' in data: customer.nombre = data['nombre']
    if 'tipo_documento' in data: customer.tipo_documento = data['tipo_documento']
    if 'numero_documento' in data: customer.numero_documento = data['numero_documento']
    if 'direccion' in data: customer.direccion = data['direccion']
    if 'telefono' in data: customer.telefono = data['telefono']
    if 'email' in data: customer.email = data['email']
    if 'condicion_pago' in data: customer.condicion_pago = data['condicion_pago']
    
    updated_customer = repo.update(customer)
    return jsonify({
        "id": updated_customer.id,
        "nombre": updated_customer.nombre,
        "tipo_documento": updated_customer.tipo_documento,
        "numero_documento": updated_customer.numero_documento,
        "direccion": updated_customer.direccion,
        "telefono": updated_customer.telefono,
        "email": updated_customer.email,
        "condicion_pago": updated_customer.condicion_pago
    }), 200

@router.route('/<customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    db = next(get_db())
    repo = CustomerRepository(db)
    
    try:
        success = repo.delete(customer_id)
        if not success:
            return jsonify({"detail": "Customer not found"}), 404
        return jsonify({"message": "Customer deleted successfully"}), 200
    except IntegrityError:
        db.rollback()
        return jsonify({"error": "Cannot delete customer because they have related transactions"}), 409
