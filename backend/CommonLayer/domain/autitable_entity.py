from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String


class AuditableEntity:
    """
    Base mixin for all domain entities.

    Provides:
    - id          : Integer primary key (auto-increment)
    - created_at  : UTC timestamp set on INSERT
    - created_by  : Username or identifier of the creator
    - updated_at  : UTC timestamp updated on every UPDATE
    - updated_by  : Username or identifier of the last updater
    - to_audit_dict(): Serialise audit fields for audit log entries
    """

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    created_by = Column(String(50), nullable=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_by = Column(String(50), nullable=True)

    def set_audit_create(self, username: str):
        self.created_by = username
        self.updated_by = username

    def set_audit_update(self, username: str):
        self.updated_by = username

    def to_audit_dict(self) -> dict:
        """
        Return a dictionary with the audit metadata of this entity.
        Useful for building AuditLog entries without circular imports.
        """
        return {
            "entity_id": self.id,
            "entity_type": self.__class__.__name__,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "created_by": self.created_by,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "updated_by": self.updated_by,
        }
