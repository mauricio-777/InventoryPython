from sqlalchemy import Column, Integer, String
from Database.config import Base


class Role(Base):
    """
    Entidad Rol del sistema.
    Roles iniciales: Admin, Gestor, Consultor.
    """
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
        }
