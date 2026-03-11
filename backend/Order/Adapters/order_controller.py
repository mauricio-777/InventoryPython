from flask import Blueprint, request, jsonify
from Database.config import SessionLocal
from CommonLayer.middleware.auth_middleware import require_role
from Order.Application.order_service import OrderService
from Audit.Domain.audit_log import AuditLog
from Audit.Adapters.audit_repository import AuditRepository
import uuid

router = Blueprint("order_controller", __name__, url_prefix="/api/v1/orders")

def order_to_dict(order):
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "created_by_id": order.created_by_id,
        "assigned_picker_id": order.assigned_picker_id,
        "assigned_driver_id": order.assigned_driver_id,
        "status": order.status,
        "shipping_address": order.shipping_address,
        "notes": order.notes,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "delivered_at": order.delivered_at.isoformat() if order.delivered_at else None,
        "customer_name": order.customer.nombre if order.customer else "N/A",
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else "N/A",
                "batch_id": item.batch_id,
                "location_code": item.batch.location.composite_code if item.batch and item.batch.location else "N/A",
                "quantity_requested": item.quantity_requested,
                "quantity_picked": item.quantity_picked,
                "unit_price": item.unit_price
            } for item in order.items
        ]
    }

@router.route("/", methods=["POST"])
@require_role("admin", "gestor")
def create_order():
    user_id = request.headers.get("X-User-Id", "system")
    data = request.get_json()
    db = SessionLocal()
    try:
        service = OrderService(db)
        order = service.create_order(data, user_id)
        # Auto-auditoría de creación de pedido
        try:
            audit_repo = AuditRepository(db)
            audit_repo.create(AuditLog(
                id=str(uuid.uuid4()),
                user_id=user_id, user_name=user_id,
                action='CREATE', table_name='orders',
                record_id=order.id,
                description=f'Pedido creado para cliente {data.get("customer_id", "")} con {len(data.get("items", []))} item(s)',
                new_values='{}'
            ))
        except Exception:
            pass
        return jsonify(order_to_dict(order)), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    finally:
        db.close()

@router.route("/", methods=["GET"])
@require_role("admin", "gestor", "picker", "driver")
def get_orders():
    status = request.args.get("status")
    assigned_picker_id = request.args.get("assigned_picker_id")
    assigned_driver_id = request.args.get("assigned_driver_id")
    skip = request.args.get("skip", 0, type=int)
    limit = request.args.get("limit", 100, type=int)
    
    db = SessionLocal()
    try:
        service = OrderService(db)
        orders = service.get_orders(
            status=status,
            assigned_picker_id=assigned_picker_id,
            assigned_driver_id=assigned_driver_id,
            skip=skip,
            limit=limit
        )
        return jsonify([order_to_dict(o) for o in orders]), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    finally:
        db.close()

@router.route("/<order_id>/status", methods=["PUT"])
@require_role("admin", "gestor", "picker", "driver")
def update_order_status(order_id):
    user_id = request.headers.get("X-User-Id", "system")
    data = request.get_json()
    new_status = data.get("status")
    if not new_status:
        return jsonify({"message": "Status is required"}), 400
        
    db = SessionLocal()
    try:
        service = OrderService(db)
        order = service.update_status(order_id, new_status, user_id)
        # Auto-auditar cambios de estado
        try:
            audit_repo = AuditRepository(db)
            audit_repo.create(AuditLog(
                id=str(uuid.uuid4()),
                user_id=user_id, user_name=user_id,
                action='UPDATE', table_name='orders',
                record_id=order_id,
                description=f'Estado del pedido cambiado a {new_status}',
                new_values='{}'
            ))
        except Exception:
            pass
        return jsonify(order_to_dict(order)), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    finally:
        db.close()

@router.route("/<order_id>/assign", methods=["PUT"])
@require_role("admin", "gestor", "picker", "driver")
def assign_order(order_id):
    user_id = request.headers.get("X-User-Id", "system")
    data = request.get_json()
    picker_id = data.get("picker_id")
    driver_id = data.get("driver_id")
    
    db = SessionLocal()
    try:
        service = OrderService(db)
        if picker_id:
            order = service.assign_picker(order_id, picker_id, user_id)
        if driver_id:
            order = service.assign_driver(order_id, driver_id, user_id)
        return jsonify(order_to_dict(order)), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    finally:
        db.close()

@router.route("/items/<item_id>/pick", methods=["POST"])
@require_role("admin", "gestor", "picker")
def pick_item(item_id):
    user_id = request.headers.get("X-User-Id", "system")
    data = request.get_json()
    batch_id = data.get("batch_id")
    quantity = data.get("quantity")
    
    if not batch_id or not quantity:
        return jsonify({"message": "batch_id and quantity are required"}), 400
        
    db = SessionLocal()
    try:
        service = OrderService(db)
        item = service.pick_item(item_id, batch_id, quantity, user_id)
        return jsonify({"message": "Item picked successfully", "quantity_picked": item.quantity_picked}), 200
    except Exception as e:
        # HTTPException from stock_service is unhandled in direct string casting, handle properly
        if hasattr(e, "detail"):
            return jsonify({"message": e.detail}), e.status_code
        return jsonify({"message": str(e)}), 400
    finally:
        db.close()
