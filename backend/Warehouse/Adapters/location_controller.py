from flask import Blueprint, request, jsonify
from Database.config import SessionLocal
from CommonLayer.middleware.auth_middleware import require_role
from Warehouse.Application.location_service import LocationService

router = Blueprint("location_controller", __name__, url_prefix="/api/v1/locations")

@router.route("/", methods=["POST"])
@require_role("admin", "gestor")
def create_location():
    user_id = request.headers.get("X-User-Id", "system")
    data = request.get_json()
    if not data or 'zone' not in data or 'aisle' not in data or 'rack' not in data or 'level' not in data:
        return jsonify({"message": "Missing required fields (zone, aisle, rack, level)"}), 400

    db = SessionLocal()
    try:
        service = LocationService(db)
        location = service.create_location(data, user_id)
        return jsonify({
            "id": location.id,
            "zone": location.zone,
            "aisle": location.aisle,
            "rack": location.rack,
            "level": location.level,
            "composite_code": location.composite_code
        }), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    finally:
        db.close()

@router.route("/", methods=["GET"])
@require_role("admin", "gestor")
def get_locations():
    skip = request.args.get("skip", 0, type=int)
    limit = request.args.get("limit", 100, type=int)
    db = SessionLocal()
    try:
        service = LocationService(db)
        locations = service.get_locations(skip, limit)
        return jsonify([{
            "id": l.id,
            "zone": l.zone,
            "aisle": l.aisle,
            "rack": l.rack,
            "level": l.level,
            "composite_code": l.composite_code
        } for l in locations]), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    finally:
        db.close()

@router.route("/<location_id>", methods=["GET"])
@require_role("admin", "gestor")
def get_location(location_id):
    db = SessionLocal()
    try:
        service = LocationService(db)
        location = service.get_location(location_id)
        return jsonify({
            "id": location.id,
            "zone": location.zone,
            "aisle": location.aisle,
            "rack": location.rack,
            "level": location.level,
            "composite_code": location.composite_code
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 404
    finally:
        db.close()

@router.route("/<location_id>", methods=["PUT"])
@require_role("admin", "gestor")
def update_location(location_id):
    user_id = request.headers.get("X-User-Id", "system")
    data = request.get_json()
    db = SessionLocal()
    try:
        service = LocationService(db)
        location = service.update_location(location_id, data, user_id)
        return jsonify({
            "id": location.id,
            "zone": location.zone,
            "aisle": location.aisle,
            "rack": location.rack,
            "level": location.level,
            "composite_code": location.composite_code
        }), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    finally:
        db.close()

@router.route("/<location_id>", methods=["DELETE"])
@require_role("admin", "gestor")
def delete_location(location_id):

    db = SessionLocal()
    try:
        service = LocationService(db)
        service.delete_location(location_id)
        return jsonify({"message": "Location deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    finally:
        db.close()
