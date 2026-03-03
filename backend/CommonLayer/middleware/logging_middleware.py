import time
from flask import Flask, request, g
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)


def register_logging_middleware(app: Flask) -> None:
    """
    Register before/after request hooks for structured HTTP request logging.

    Logs: METHOD /path | user=<identity> | status=<code> | <ms>ms | ip=<addr>

    Usage in main.py:
        from CommonLayer.middleware.logging_middleware import register_logging_middleware
        register_logging_middleware(app)
    """

    @app.before_request
    def _start_timer():
        g.start_time = time.perf_counter()

    @app.after_request
    def _log_request(response):
        elapsed_ms = (time.perf_counter() - g.get("start_time", time.perf_counter())) * 1000
        # Placeholder for authenticated user; will be replaced when Auth (Epic 3) is integrated
        user_info = "anonymous"
        logger.info(
            "%s %s | user=%s | status=%s | %.1fms | ip=%s",
            request.method,
            request.path,
            user_info,
            response.status_code,
            elapsed_ms,
            request.remote_addr,
        )
        return response
