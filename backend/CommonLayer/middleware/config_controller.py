from flask import Blueprint, request, jsonify
from Database.config import get_db
from CommonLayer.domain.system_config import SystemConfig
from CommonLayer.middleware.auth_middleware import require_role
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)

router = Blueprint('config', __name__, url_prefix='/api/v1/config')

# Claves de configuración válidas para límites de intentos
LIMIT_KEYS = {
    'gestor': 'max_attempts_gestor',
    'consultor': 'max_attempts_consultor',
}

DEFAULT_LIMIT = 5


def _get_limit(db, role: str) -> int:
    """Obtiene el límite de intentos para un rol desde la BD."""
    key = LIMIT_KEYS.get(role)
    if not key:
        return DEFAULT_LIMIT
    cfg = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if cfg:
        try:
            return int(cfg.value)
        except (ValueError, TypeError):
            return DEFAULT_LIMIT
    return DEFAULT_LIMIT


# ── GET /api/v1/config/login-limits ──────────────────────────────────────────
@router.route('/login-limits', methods=['GET'])
@require_role('admin')
def get_login_limits():
    """Retorna los límites de intentos de login configurados. Solo admin."""
    try:
        db = next(get_db())
        return jsonify({
            "status": "success",
            "limits": {
                "gestor": _get_limit(db, 'gestor'),
                "consultor": _get_limit(db, 'consultor'),
            }
        }), 200
    except Exception as e:
        logger.error("Error obteniendo límites de login: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 500


# ── PUT /api/v1/config/login-limits ──────────────────────────────────────────
@router.route('/login-limits', methods=['PUT'])
@require_role('admin')
def update_login_limits():
    """Actualiza los límites de intentos de login. Solo admin."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "Body requerido."}), 400

        db = next(get_db())
        updated = {}

        for role, key in LIMIT_KEYS.items():
            if role in data:
                try:
                    val = int(data[role])
                    if val < 1:
                        return jsonify({"status": "error", "message": f"El límite para '{role}' debe ser al menos 1."}), 400
                except (ValueError, TypeError):
                    return jsonify({"status": "error", "message": f"Valor inválido para '{role}'."}), 400

                cfg = db.query(SystemConfig).filter(SystemConfig.key == key).first()
                if cfg:
                    cfg.value = str(val)
                else:
                    db.add(SystemConfig(key=key, value=str(val)))
                updated[role] = val

        db.commit()
        logger.info("Límites de login actualizados: %s", updated)
        return jsonify({
            "status": "success",
            "message": "Límites actualizados correctamente.",
            "limits": updated
        }), 200

    except Exception as e:
        logger.error("Error actualizando límites de login: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 500
