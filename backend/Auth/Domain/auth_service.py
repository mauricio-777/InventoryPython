from typing import Optional
from werkzeug.security import check_password_hash, generate_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from flask import current_app
from User.Domain.user import User
from User.Adapters.user_repository import UserRepository
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def login(self, username: str, password: str) -> Optional[User]:
        """
        Autentica a un usuario verificando sus credenciales.
        Retorna el usuario si la autenticación es exitosa y el usuario está activo.
        Lanza un ValueError en caso de credenciales inválidas o cuenta inactiva.
        """
        user = self.user_repo.get_by_username(username)
        
        if not user:
            logger.warning("Intento de login fallido: usuario '%s' no encontrado.", username)
            raise ValueError("Usuario o contraseña incorrectos.")
            
        if not check_password_hash(user.password_hash, password):
            logger.warning("Intento de login fallido: contraseña incorrecta para '%s'.", username)
            raise ValueError("Usuario o contraseña incorrectos.")
            
        if not user.active:
            logger.warning("Intento de login fallido: usuario '%s' está inactivo.", username)
            raise ValueError("Esta cuenta ha sido desactivada. Contacte a un administrador.")
            
        logger.info("Login exitoso para el usuario '%s'.", username)
        return user

    def _get_serializer(self):
        secret_key = current_app.config.get('SECRET_KEY', 'default-unsafe-key')
        return URLSafeTimedSerializer(secret_key)

    def generate_reset_token(self, username: str) -> str:
        """
        Genera un token de recuperación para un usuario.
        """
        user = self.user_repo.get_by_username(username)
        if not user:
            # Para evitar enumeración de usuarios, igual no decimos si existe o no.
            logger.info("Solicitud de reset para usuario no existente: '%s'.", username)
            return None
        
        if not user.active:
            logger.warning("Solicitud de reset para usuario inactivo: '%s'.", username)
            raise ValueError("Esta cuenta ha sido desactivada. Contacte a un administrador.")

        serializer = self._get_serializer()
        token = serializer.dumps(username, salt='password-reset-salt')
        logger.info("Token de recuperación generado para '%s'.", username)
        return token

    def reset_password_with_token(self, token: str, new_password: str, max_age: int = 3600):
        """
        Valida el token y actualiza la contraseña del usuario.
        max_age por defecto es 3600 segundos (1 hora).
        """
        serializer = self._get_serializer()
        try:
            username = serializer.loads(token, salt='password-reset-salt', max_age=max_age)
        except SignatureExpired:
            logger.warning("Token expirado.")
            raise ValueError("El enlace de recuperación ha expirado. Por favor, solicite uno nuevo.")
        except BadSignature:
            logger.warning("Token inválido.")
            raise ValueError("Token de recuperación inválido.")
            
        user = self.user_repo.get_by_username(username)
        if not user:
            raise ValueError("Usuario no encontrado.")
            
        if not user.active:
            raise ValueError("Esta cuenta ha sido desactivada.")

        user.password_hash = generate_password_hash(new_password)
        self.user_repo.update(user)
        logger.info("Contraseña restablecida exitosamente para el usuario '%s'.", username)
        return True