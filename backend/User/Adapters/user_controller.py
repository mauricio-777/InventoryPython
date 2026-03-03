import uuid
from flask import Blueprint, request, jsonify
from Database.config import get_db
from User.Domain.user_service import UserService
from User.Adapters.user_repository import UserRepository, RoleRepository
from Auth.Adapters.mock_email_provider import MockEmailProvider
from CommonLayer.middleware.auth_middleware import require_role
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)

router = Blueprint('users', __name__, url_prefix='/api/v1/users')

email_provider = MockEmailProvider()


def _get_service(db):
    return UserService(UserRepository(db), RoleRepository(db))


# ── GET /api/v1/users/ ────────────────────────────────────────────────────────
@router.route('/', methods=['GET'])
@require_role('admin')
def list_users():
    """Lista todos los usuarios. Solo admin."""
    try:
        db = next(get_db())
        service = _get_service(db)
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        users = service.list_users(skip=skip, limit=limit)
        return jsonify({
            "status": "success",
            "count": len(users),
            "users": [u.to_dict() for u in users]
        }), 200
    except Exception as e:
        logger.error("Error listando usuarios: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 500


# ── GET /api/v1/users/roles ────────────────────────────────────────────────────
@router.route('/roles', methods=['GET'])
@require_role('admin')
def list_roles():
    """Lista los roles disponibles. Solo admin."""
    try:
        db = next(get_db())
        service = _get_service(db)
        roles = service.get_roles()
        return jsonify({
            "status": "success",
            "roles": [r.to_dict() for r in roles]
        }), 200
    except Exception as e:
        logger.error("Error listando roles: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 500


# ── POST /api/v1/users/ ───────────────────────────────────────────────────────
@router.route('/', methods=['POST'])
@require_role('admin')
def create_user():
    """Crea un nuevo usuario. Solo admin. Envía email de bienvenida (mock)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "Body requerido."}), 400

        required = ['username', 'email', 'password', 'role_id']
        missing = [f for f in required if not data.get(f)]
        if missing:
            return jsonify({"status": "error", "message": f"Campos requeridos: {', '.join(missing)}"}), 400

        db = next(get_db())
        service = _get_service(db)

        user = service.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role_id=int(data['role_id']),
        )

        # Enviar email de bienvenida (mock)
        email_provider.send_welcome(email=user.email, username=user.username)

        return jsonify({
            "status": "success",
            "message": f"Usuario '{user.username}' creado exitosamente.",
            "user": user.to_dict()
        }), 201

    except ValueError as ve:
        return jsonify({"status": "error", "message": str(ve)}), 400
    except Exception as e:
        logger.error("Error creando usuario: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 500


# ── GET /api/v1/users/<user_id> ───────────────────────────────────────────────
@router.route('/<user_id>', methods=['GET'])
@require_role('admin')
def get_user(user_id):
    """Obtiene un usuario por ID. Solo admin."""
    try:
        db = next(get_db())
        service = _get_service(db)
        user = service.get_user(user_id)
        if not user:
            return jsonify({"status": "error", "message": "Usuario no encontrado."}), 404
        return jsonify({"status": "success", "user": user.to_dict()}), 200
    except Exception as e:
        logger.error("Error obteniendo usuario %s: %s", user_id, e)
        return jsonify({"status": "error", "message": str(e)}), 500


# ── PUT /api/v1/users/<user_id> ───────────────────────────────────────────────
@router.route('/<user_id>', methods=['PUT'])
@require_role('admin')
def update_user(user_id):
    """Edita un usuario existente. Solo admin."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "Body requerido."}), 400

        # Convertir role_id a int si viene en los datos
        if 'role_id' in data:
            data['role_id'] = int(data['role_id'])

        db = next(get_db())
        service = _get_service(db)
        user = service.update_user(user_id, data)

        return jsonify({
            "status": "success",
            "message": "Usuario actualizado correctamente.",
            "user": user.to_dict()
        }), 200

    except ValueError as ve:
        return jsonify({"status": "error", "message": str(ve)}), 400
    except Exception as e:
        logger.error("Error actualizando usuario %s: %s", user_id, e)
        return jsonify({"status": "error", "message": str(e)}), 500


# ── PATCH /api/v1/users/<user_id>/deactivate ─────────────────────────────────
@router.route('/<user_id>/deactivate', methods=['PATCH'])
@require_role('admin')
def deactivate_user(user_id):
    """Desactiva un usuario. Solo admin."""
    try:
        db = next(get_db())
        service = _get_service(db)
        user = service.deactivate_user(user_id)
        return jsonify({
            "status": "success",
            "message": f"Usuario '{user.username}' desactivado.",
            "user": user.to_dict()
        }), 200
    except ValueError as ve:
        return jsonify({"status": "error", "message": str(ve)}), 400
    except Exception as e:
        logger.error("Error desactivando usuario %s: %s", user_id, e)
        return jsonify({"status": "error", "message": str(e)}), 500
