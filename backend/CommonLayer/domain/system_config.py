from sqlalchemy import Column, String
from Database.config import Base


class SystemConfig(Base):
    """
    Tabla de configuración del sistema clave-valor.
    Se usa para almacenar parámetros configurables como límites de intentos de login.
    """
    __tablename__ = "system_config"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(String(255), nullable=False)

    def to_dict(self):
        return {
            "key": self.key,
            "value": self.value,
        }
