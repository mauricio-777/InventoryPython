import logging
import os
from logging.handlers import RotatingFileHandler

# Ensure logs directory exists (relative to backend root)
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "logs")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "app.log")

LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def _build_handlers() -> list[logging.Handler]:
    """Build file and console handlers (called once at module load)."""
    formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)

    # Rotating file: 5 MB per file, keep 5 backups
    file_handler = RotatingFileHandler(
        LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=5, encoding="utf-8"
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    # Console
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    return [file_handler, console_handler]


# Root configuration (applied once)
_root = logging.getLogger("inventory")
if not _root.handlers:
    _root.setLevel(logging.DEBUG)
    for h in _build_handlers():
        _root.addHandler(h)
    _root.propagate = False


def get_logger(name: str) -> logging.Logger:
    """
    Return a child logger under the 'inventory' namespace.

    Usage:
        from CommonLayer.logging.logger import get_logger
        logger = get_logger(__name__)
        logger.info("Hello from %s", __name__)
    """
    return logging.getLogger(f"inventory.{name}")
