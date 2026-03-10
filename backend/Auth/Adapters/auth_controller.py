from flask import Blueprint, request, jsonify
from Database.config import get_db
from Auth.Domain.auth_service import AuthService
from User.Adapters.user_repository import UserRepository
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)

router = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

def _get_service(db):
    return AuthService(UserRepository(db), db=db)

@router.route('/login', methods=['POST'])
def login():
    """Endpoint para iniciar sesión."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "Body requerido."}), 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"status": "error", "message": "Username y password son requeridos."}), 400

        db = next(get_db())
        service = _get_service(db)
        
        user = service.login(username, password)
        
        # En el futuro (Epic 3.2), aquí se generaría el JWT.
        # Por ahora enviamos los datos del usuario para el mecanismo basado en headers.
        return jsonify({
            "status": "success",
            "message": "Login exitoso",
            "user": user.to_dict()
        }), 200

    except ValueError as ve:
        # Errores de validación (contraseña incorrecta, usuario inactivo, etc)
        return jsonify({"status": "error", "message": str(ve)}), 401
    except Exception as e:
        logger.error("Error inesperado en login: %s", e)
        return jsonify({"status": "error", "message": "Error interno del servidor"}), 500


