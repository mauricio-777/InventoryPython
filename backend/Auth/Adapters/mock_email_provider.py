from Auth.Ports.email_provider import EmailProvider
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)


class MockEmailProvider(EmailProvider):
    """
    Implementación mock del proveedor de email.
    En lugar de enviar correos reales, escribe los mensajes en el log del servidor.
    Útil para desarrollo y pruebas.
    """

    def send_welcome(self, email: str, username: str) -> None:
        logger.info(
            "[MOCK EMAIL] Bienvenida enviada a %s (%s)\n"
            "  Asunto: Bienvenido a InventoryApp\n"
            "  Cuerpo: Hola %s, tu cuenta ha sido creada exitosamente.\n"
            "           Usuario: %s\n"
            "           Por favor cambia tu contraseña en tu primer inicio de sesión.",
            email, username, username, username
        )

    def send_password_reset(self, email: str, reset_token: str) -> None:
        logger.info(
            "[MOCK EMAIL] Restablecimiento de contraseña enviado a %s\n"
            "  Asunto: Restablecer contraseña - InventoryApp\n"
            "  Enlace: http://localhost:5173/reset-password?token=%s",
            email, reset_token
        )
