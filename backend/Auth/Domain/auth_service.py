from typing import Optional
from werkzeug.security import check_password_hash, generate_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from flask import current_app
from User.Domain.user import User
from User.Adapters.user_repository import UserRepository
from CommonLayer.domain.system_config import SystemConfig
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)

# Roles sujetos a bloqueo por intentos fallidos
LOCKABLE_ROLES = {"gestor", "consultor"}
DEFAULT_MAX_ATTEMPTS = 5


class AuthService:
    def __init__(self, user_repo: UserRepository, db=None):
        self.user_repo = user_repo
        self.db = db  # Sesión de DB para consultar SystemConfig

    def _get_max_attempts(self, role_name: str) -> int:
        """Obtiene el límite de intentos para un rol desde system_config."""
        if self.db is None:
            return DEFAULT_MAX_ATTEMPTS
        key = f"max_attempts_{role_name}"
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

            # Aplicar bloqueo solo a roles lockables (no al admin)
            role_name = user.role.name if user.role else ""
            if role_name in LOCKABLE_ROLES:
                user.failed_attempts = (user.failed_attempts or 0) + 1
                max_attempts = self._get_max_attempts(role_name)
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

    def _get_serializer(self):
        secret_key = current_app.config.get('SECRET_KEY', 'default-unsafe-key')
        return URLSafeTimedSerializer(secret_key)

    def generate_reset_token(self, username: str) -> str:
        """
        Genera un token de recuperacion para un usuario.
        """
        user = self.user_repo.get_by_username(username)
        if not user:
            logger.info("Solicitud de reset para usuario no existente: '%s'.", username)
            return None

        if not user.active:
            logger.warning("Solicitud de reset para usuario inactivo: '%s'.", username)
            raise ValueError("Esta cuenta ha sido desactivada. Contacte a un administrador.")

        serializer = self._get_serializer()
        token = serializer.dumps(username, salt='password-reset-salt')
        logger.info("Token de recuperacion generado para '%s'.", username)
        return token

    def reset_password_with_token(self, token: str, new_password: str, max_age: int = 3600):
        """
        Valida el token y actualiza la contrasena del usuario.
        max_age por defecto es 3600 segundos (1 hora).
        """
        serializer = self._get_serializer()
        try:
            username = serializer.loads(token, salt='password-reset-salt', max_age=max_age)
        except SignatureExpired:
            logger.warning("Token expirado.")
            raise ValueError("El enlace de recuperacion ha expirado. Por favor, solicite uno nuevo.")
        except BadSignature:
            logger.warning("Token invalido.")
            raise ValueError("Token de recuperacion invalido.")

        user = self.user_repo.get_by_username(username)
        if not user:
            raise ValueError("Usuario no encontrado.")

        if not user.active:
            raise ValueError("Esta cuenta ha sido desactivada.")

        user.password_hash = generate_password_hash(new_password)
        self.user_repo.update(user)
        logger.info("Contrasena restablecida exitosamente para el usuario '%s'.", username)
        return True