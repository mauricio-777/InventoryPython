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

@router.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Endpoint para solicitar el restablecimiento de contraseña."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "Body requerido."}), 400

        username = data.get('username')
        if not username:
            return jsonify({"status": "error", "message": "El nombre de usuario es requerido."}), 400

        db = next(get_db())
        service = _get_service(db)
        
        token = service.generate_reset_token(username)
        
        if token:
            reset_link = f"http://localhost:5173/reset-password?token={token}"
            logger.info("==========================================================")
            logger.info("SIMULANDO ENVÍO DE CORREO A: %s", username)
            logger.info("Enlace de restablecimiento: %s", reset_link)
            logger.info("==========================================================")

        # Siempre devolvems un 200 genérico para evitar filtración de usuarios
        return jsonify({
            "status": "success",
            "message": "Si el usuario existe, se enviará un enlace de recuperación."
        }), 200

    except ValueError as ve:
        return jsonify({"status": "error", "message": str(ve)}), 400
    except Exception as e:
        logger.error("Error inesperado en forgot_password: %s", e)
        return jsonify({"status": "error", "message": "Error interno del servidor"}), 500

@router.route('/reset-password', methods=['POST'])
def reset_password():
    """Endpoint para enviar la nueva contraseña con el token."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "Body requerido."}), 400

        token = data.get('token')
        new_password = data.get('new_password')

        if not token or not new_password:
            return jsonify({"status": "error", "message": "Token y nueva contraseña son requeridos."}), 400

        db = next(get_db())
        service = _get_service(db)
        
        service.reset_password_with_token(token, new_password)
        
        return jsonify({
            "status": "success",
            "message": "Contraseña restablecida exitosamente."
        }), 200

    except ValueError as ve:
        return jsonify({"status": "error", "message": str(ve)}), 400
    except Exception as e:
        logger.error("Error inesperado en reset_password: %s", e)
        return jsonify({"status": "error", "message": "Error interno del servidor"}), 500
