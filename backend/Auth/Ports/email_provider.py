from abc import ABC, abstractmethod


class EmailProvider(ABC):
    """Puerto para el proveedor de correo electrónico."""

    @abstractmethod
    def send_welcome(self, email: str, username: str) -> None:
        """Envía un correo de bienvenida al usuario recién creado."""
        ...

    @abstractmethod
    def send_password_reset(self, email: str, reset_token: str) -> None:
        """Envía un correo con el enlace para restablecer la contraseña."""
        ...
