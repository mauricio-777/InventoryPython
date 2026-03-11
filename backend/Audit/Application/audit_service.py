import uuid
import json
from typing import Any, Optional, Dict
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from Audit.Domain.audit_log import AuditLog
from Audit.Adapters.audit_repository import AuditRepository
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)


class AuditService:
    """
    Servicio centralizado para registrar eventos de auditoría.
    Captura cambios en CREATE, UPDATE, DELETE operations.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = AuditRepository(db)

    def record_create(
        self,
        user_id: str,
        user_name: str,
        table_name: str,
        record_id: str,
        new_values: Dict[str, Any],
        description: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        """
        Registra la creación de un nuevo registro.
        
        Args:
            user_id: ID del usuario que realiza la acción
            user_name: Nombre del usuario
            table_name: Nombre de la tabla afectada (ej: 'users', 'products')
            record_id: ID del registro creado
            new_values: Diccionario con los valores del nuevo registro
            description: Descripción adicional del cambio
            ip_address: Dirección IP del cliente (opcional)
        
        Returns:
            AuditLog creado
        """
        try:
            audit_log = AuditLog(
                id=str(uuid.uuid4()),
                user_id=user_id,
                user_name=user_name,
                action="CREATE",
                table_name=table_name,
                record_id=record_id,
                old_values=None,
                new_values=json.dumps(new_values, default=str),
                description=description or f"Nuevo {table_name} creado: {record_id}",
                ip_address=ip_address,
                timestamp=datetime.now(timezone.utc),
            )
            return self.repo.create(audit_log)
        except Exception as e:
            logger.error(
                "Error registrando CREATE en auditoría: %s - %s",
                table_name,
                str(e),
                exc_info=True,
            )
            raise

    def record_update(
        self,
        user_id: str,
        user_name: str,
        table_name: str,
        record_id: str,
        old_values: Dict[str, Any],
        new_values: Dict[str, Any],
        description: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        """
        Registra la actualización de un registro.
        
        Args:
            user_id: ID del usuario que realiza la acción
            user_name: Nombre del usuario
            table_name: Nombre de la tabla afectada
            record_id: ID del registro actualizado
            old_values: Diccionario con valores anteriores
            new_values: Diccionario con valores nuevos
            description: Descripción adicional del cambio
            ip_address: Dirección IP del cliente (opcional)
        
        Returns:
            AuditLog creado
        """
        try:
            audit_log = AuditLog(
                id=str(uuid.uuid4()),
                user_id=user_id,
                user_name=user_name,
                action="UPDATE",
                table_name=table_name,
                record_id=record_id,
                old_values=json.dumps(old_values, default=str),
                new_values=json.dumps(new_values, default=str),
                description=description or f"{table_name} actualizado: {record_id}",
                ip_address=ip_address,
                timestamp=datetime.now(timezone.utc),
            )
            return self.repo.create(audit_log)
        except Exception as e:
            logger.error(
                "Error registrando UPDATE en auditoría: %s - %s",
                table_name,
                str(e),
                exc_info=True,
            )
            raise

    def record_delete(
        self,
        user_id: str,
        user_name: str,
        table_name: str,
        record_id: str,
        old_values: Optional[Dict[str, Any]] = None,
        description: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        """
        Registra la eliminación de un registro.
        
        Args:
            user_id: ID del usuario que realiza la acción
            user_name: Nombre del usuario
            table_name: Nombre de la tabla afectada
            record_id: ID del registro eliminado
            old_values: Diccionario con valores del registro eliminado (para referencia)
            description: Descripción adicional del cambio
            ip_address: Dirección IP del cliente (opcional)
        
        Returns:
            AuditLog creado
        """
        try:
            audit_log = AuditLog(
                id=str(uuid.uuid4()),
                user_id=user_id,
                user_name=user_name,
                action="DELETE",
                table_name=table_name,
                record_id=record_id,
                old_values=json.dumps(old_values, default=str) if old_values else None,
                new_values=None,
                description=description or f"{table_name} eliminado: {record_id}",
                ip_address=ip_address,
                timestamp=datetime.now(timezone.utc),
            )
            return self.repo.create(audit_log)
        except Exception as e:
            logger.error(
                "Error registrando DELETE en auditoría: %s - %s",
                table_name,
                str(e),
                exc_info=True,
            )
            raise

    def record_action(
        self,
        user_id: str,
        user_name: str,
        action: str,
        table_name: str,
        record_id: str,
        description: str,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        """
        Registra una acción personalizada en auditoría.
        Útil para acciones que no son CREATE/UPDATE/DELETE.
        
        Args:
            user_id: ID del usuario
            user_name: Nombre del usuario
            action: Tipo de acción (ej: 'DEACTIVATE', 'UNLOCK', 'APPROVE')
            table_name: Nombre de la tabla/módulo afectado
            record_id: ID del registro
            description: Descripción de la acción
            old_values: Valores anteriores (opcional)
            new_values: Valores nuevos (opcional)
            ip_address: Dirección IP del cliente (opcional)
        
        Returns:
            AuditLog creado
        """
        try:
            audit_log = AuditLog(
                id=str(uuid.uuid4()),
                user_id=user_id,
                user_name=user_name,
                action=action,
                table_name=table_name,
                record_id=record_id,
                old_values=json.dumps(old_values, default=str) if old_values else None,
                new_values=json.dumps(new_values, default=str) if new_values else None,
                description=description,
                ip_address=ip_address,
                timestamp=datetime.now(timezone.utc),
            )
            return self.repo.create(audit_log)
        except Exception as e:
            logger.error(
                "Error registrando acción personalizada en auditoría: %s - %s",
                action,
                str(e),
                exc_info=True,
            )
            raise
