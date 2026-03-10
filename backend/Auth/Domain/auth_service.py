from typing import Optional
from werkzeug.security import check_password_hash, generate_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from flask import current_app
from User.Domain.user import User
from User.Adapters.user_repository import UserRepository
from CommonLayer.domain.system_config import SystemConfig
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)

DEFAULT_MAX_ATTEMPTS = 5


class AuthService:
    def __init__(self, user_repo: UserRepository, db=None):
        self.user_repo = user_repo
        self.db = db  # Sesión de DB para consultar SystemConfig

    def _get_max_attempts(self) -> int:
        """Obtiene el límite de intentos para roles no-admin desde system_config."""
        if self.db is None:
            return DEFAULT_MAX_ATTEMPTS
        key = "max_attempts_non_admin"
        try:
            cfg = self.db.query(SystemConfig).filter(SystemConfig.key == key).first()
            if cfg:
                return int(cfg.value)
        except Exception:
            pass
        return DEFAULT_MAX_ATTEMPTS

    def login(self, username: str, password: str) -> Optional[User]:
        """
        Autentica a un usuario verificando sus credenciales.
        Para gestores y consultores, aplica bloqueo por intentos fallidos.
        Retorna el usuario si la autenticacion es exitosa y el usuario esta activo.
        Lanza un ValueError en caso de credenciales invalidas, cuenta bloqueada o inactiva.
        """
        user = self.user_repo.get_by_username(username)

        if not user:
            logger.warning("Intento de login fallido: usuario '%s' no encontrado.", username)
            raise ValueError("Usuario o contrasena incorrectos.")

        # Verificar si la cuenta esta bloqueada
        if user.is_locked:
            logger.warning("Intento de login fallido: usuario '%s' esta bloqueado.", username)
            raise ValueError("Tu cuenta esta bloqueada por demasiados intentos fallidos. Contacta al administrador.")

        if not check_password_hash(user.password_hash, password):
            logger.warning("Intento de login fallido: contrasena incorrecta para '%s'.", username)

            # Aplicar bloqueo a todos excepto admin
            role_name = user.role.name if user.role else ""
            if role_name != "admin":
                user.failed_attempts = (user.failed_attempts or 0) + 1
                max_attempts = self._get_max_attempts()
                remaining = max_attempts - user.failed_attempts

                if remaining <= 0:
                    user.is_locked = True
                    self.user_repo.update(user)
                    logger.warning("Usuario '%s' bloqueado tras %d intentos fallidos.", username, max_attempts)
                    raise ValueError(
                        "Has excedido el limite de intentos. Tu cuenta ha sido bloqueada. "
                        "Contacta al administrador."
                    )
                else:
                    self.user_repo.update(user)
                    raise ValueError(
                        f"Usuario o contrasena incorrectos. Te quedan {remaining} intento(s) antes de ser bloqueado."
                    )

            raise ValueError("Usuario o contrasena incorrectos.")

        if not user.active:
            logger.warning("Intento de login fallido: usuario '%s' esta inactivo.", username)
            raise ValueError("Esta cuenta ha sido desactivada. Contacte a un administrador.")

        # Login exitoso: resetear contadores
        if user.failed_attempts != 0:
            user.failed_attempts = 0
            self.user_repo.update(user)

        logger.info("Login exitoso para el usuario '%s'.", username)
        return user

