from functools import wraps
from flask import request, jsonify
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)

# Mapeo de roles válidos del sistema
VALID_ROLES = {"admin", "gestor", "consultor"}


def require_role(*roles):
    """
    Decorador de autorización basado en rol.

    Verifica el header HTTP 'X-User-Role'. Si el rol del usuario está
    entre los permitidos, permite el acceso; de lo contrario retorna 401 o 403.

    Uso:
        @router.route('/users', methods=['GET'])
        @require_role('admin')
        def list_users():
            ...

    Nota: Este mecanismo es temporal hasta que se implemente JWT (Epic 3.2).
    Con JWT, el rol se extraerá del claim del token en lugar del header.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            user_role = request.headers.get("X-User-Role", "").lower().strip()

            if not user_role:
                logger.warning("Acceso denegado a '%s': header X-User-Role ausente.", request.path)
                return jsonify({
                    "status": "error",
                    "code": 401,
                    "error": "Unauthorized",
                    "message": "Se requiere autenticación. Proporcione el header X-User-Role."
                }), 401

            if user_role not in VALID_ROLES:
                logger.warning("Acceso denegado: rol inválido '%s'.", user_role)
                return jsonify({
                    "status": "error",
                    "code": 403,
                    "error": "Forbidden",
                    "message": f"Rol '{user_role}' no reconocido."
                }), 403

            allowed = [r.lower() for r in roles]
            if user_role not in allowed:
                logger.warning(
                    "Acceso denegado a '%s': rol '%s' no tiene permiso (requerido: %s).",
                    request.path, user_role, allowed
                )
                return jsonify({
                    "status": "error",
                    "code": 403,
                    "error": "Forbidden",
                    "message": f"El rol '{user_role}' no tiene permiso para acceder a este recurso."
                }), 403

            return func(*args, **kwargs)
        return wrapper
    return decorator
