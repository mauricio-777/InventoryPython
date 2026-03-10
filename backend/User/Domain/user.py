from sqlalchemy import Column, String, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship
from Database.config import Base


class User(Base):
    """
    Entidad Usuario del sistema.
    Campos: username, email, password_hash, active, role_id, failed_attempts, is_locked.
    """
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    failed_attempts = Column(Integer, default=0, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)

    role = relationship("Role", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "active": self.active,
            "role_id": self.role_id,
            "role_name": self.role.name if self.role else None,
            "failed_attempts": self.failed_attempts,
            "is_locked": self.is_locked,
        }
