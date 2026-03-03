from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)


def _error_response(code: int, error: str, message: str):
    """Build a standardised JSON error payload."""
    return jsonify({"status": "error", "code": code, "error": error, "message": message}), code


def register_exception_handlers(app: Flask) -> None:
    """
    Register centralised exception handlers on the Flask app.

    Usage in main.py:
        from CommonLayer.middleware.exception_handler import register_exception_handlers
        register_exception_handlers(app)
    """

    @app.errorhandler(400)
    def bad_request(e):
        logger.warning("400 Bad Request: %s", str(e))
        return _error_response(400, "Bad Request", "La solicitud no es válida o contiene datos incorrectos.")

    @app.errorhandler(404)
    def not_found(e):
        logger.info("404 Not Found: %s", str(e))
        return _error_response(404, "Not Found", "El recurso solicitado no existe.")

    @app.errorhandler(405)
    def method_not_allowed(e):
        logger.info("405 Method Not Allowed: %s", str(e))
        return _error_response(405, "Method Not Allowed", "Método HTTP no permitido para esta ruta.")

    @app.errorhandler(422)
    def unprocessable(e):
        logger.warning("422 Unprocessable Entity: %s", str(e))
        return _error_response(422, "Unprocessable Entity", "No se pudo procesar la entidad enviada.")

    @app.errorhandler(500)
    def internal_error(e):
        logger.error("500 Internal Server Error: %s", str(e), exc_info=True)
        return _error_response(500, "Internal Server Error", "Ocurrió un error interno en el servidor.")

    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        logger.warning("HTTPException %s: %s", e.code, str(e))
        return _error_response(e.code, e.name, e.description)

    @app.errorhandler(Exception)
    def handle_generic_exception(e):
        logger.error("Unhandled exception: %s", str(e), exc_info=True)
        return _error_response(500, "Internal Server Error", "Ocurrió un error inesperado. Por favor intente más tarde.")
