import uuid
from typing import List, Optional
from werkzeug.security import generate_password_hash
from User.Domain.user import User
from User.Domain.role import Role
from User.Adapters.user_repository import UserRepository, RoleRepository
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)

# Roles predefinidos del sistema
PREDEFINED_ROLES = [
    {"name": "admin", "description": "Acceso total: gestión de usuarios, auditoría y todas las funcionalidades."},
    {"name": "gestor", "description": "Gestiona productos, lotes, entradas, salidas y reportes. Sin administración de usuarios."},
    {"name": "consultor", "description": "Solo lectura en todas las secciones del sistema."},
    {"name": "almacenero", "description": "Gestiona movimientos de inventario, recepciones y despachos desde el almacén."},
    {"name": "repartidor", "description": "Realiza entregas y registra confirmaciones de envíos."},
]

DEFAULT_ADMIN = {
    "username": "admin",
    "email": "admin@inventoryapp.com",
    "password": "Admin1234!",
}


class UserService:
    def __init__(self, user_repo: UserRepository, role_repo: RoleRepository, audit_service=None):
        self.user_repo = user_repo
        self.role_repo = role_repo
        self.audit_service = audit_service

    def list_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        return self.user_repo.get_all(skip=skip, limit=limit)

    def get_user(self, user_id: str) -> Optional[User]:
        return self.user_repo.get_by_id(user_id)

    def create_user(
        self,
        username: str,
        email: str,
        password: str,
        role_id: int,
        audit_user_id: Optional[str] = None,
        audit_user_name: Optional[str] = None,
        audit_ip_address: Optional[str] = None,
    ) -> User:
        # Verificar duplicados
        if self.user_repo.get_by_username(username):
            raise ValueError(f"El nombre de usuario '{username}' ya está en uso.")
        if self.user_repo.get_by_email(email):
            raise ValueError(f"El email '{email}' ya está registrado.")

        # Verificar que el rol exista
        role = self.role_repo.get_by_id(role_id)
        if not role:
            raise ValueError(f"El rol con id {role_id} no existe.")

        user = User(
            id=str(uuid.uuid4()),
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            active=True,
            role_id=role_id,
        )
        created_user = self.user_repo.create(user)
        
        # Registrar en auditoría
        if self.audit_service and audit_user_id:
            try:
                self.audit_service.record_create(
                    user_id=audit_user_id,
                    user_name=audit_user_name or "Unknown",
                    table_name="users",
                    record_id=created_user.id,
                    new_values={
                        "id": created_user.id,
                        "username": created_user.username,
                        "email": created_user.email,
                        "role_id": created_user.role_id,
                        "active": created_user.active,
                    },
                    description=f"Usuario '{username}' creado con rol {role.name}",
                    ip_address=audit_ip_address,
                )
            except Exception as e:
                logger.error("Error registrando auditoría de creación de usuario: %s", e)
        
        return created_user

    def update_user(
        self,
        user_id: str,
        data: dict,
        audit_user_id: Optional[str] = None,
        audit_user_name: Optional[str] = None,
        audit_ip_address: Optional[str] = None,
    ) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("Usuario no encontrado.")

        # Guardar valores anteriores para auditoría
        old_values = {
            "username": user.username,
            "email": user.email,
            "role_id": user.role_id,
            "active": user.active,
        }
        new_values = old_values.copy()

        if "username" in data and data["username"] != user.username:
            if self.user_repo.get_by_username(data["username"]):
                raise ValueError(f"El nombre de usuario '{data['username']}' ya está en uso.")
            user.username = data["username"]
            new_values["username"] = data["username"]

        if "email" in data and data["email"] != user.email:
            if self.user_repo.get_by_email(data["email"]):
                raise ValueError(f"El email '{data['email']}' ya está registrado.")
            user.email = data["email"]
            new_values["email"] = data["email"]

        if "role_id" in data:
            role = self.role_repo.get_by_id(data["role_id"])
            if not role:
                raise ValueError(f"El rol con id {data['role_id']} no existe.")
            user.role_id = data["role_id"]
            new_values["role_id"] = data["role_id"]

        if "password" in data and data["password"]:
            user.password_hash = generate_password_hash(data["password"])
            new_values["password"] = "[PROTECTED]"
            old_values["password"] = "[PROTECTED]"

        if "active" in data:
            user.active = bool(data["active"])
            new_values["active"] = bool(data["active"])

        updated_user = self.user_repo.update(user)
        
        # Registrar en auditoría solo si hay cambios
        if self.audit_service and audit_user_id and old_values != new_values:
            try:
                self.audit_service.record_update(
                    user_id=audit_user_id,
                    user_name=audit_user_name or "Unknown",
                    table_name="users",
                    record_id=user_id,
                    old_values=old_values,
                    new_values=new_values,
                    description=f"Usuario '{user.username}' actualizado",
                    ip_address=audit_ip_address,
                )
            except Exception as e:
                logger.error("Error registrando auditoría de actualización de usuario: %s", e)
        
        return updated_user

    def deactivate_user(
        self,
        user_id: str,
        audit_user_id: Optional[str] = None,
        audit_user_name: Optional[str] = None,
        audit_ip_address: Optional[str] = None,
    ) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("Usuario no encontrado.")
        user.active = False
        deactivated_user = self.user_repo.update(user)
        
        # Registrar en auditoría
        if self.audit_service and audit_user_id:
            try:
                self.audit_service.record_action(
                    user_id=audit_user_id,
                    user_name=audit_user_name or "Unknown",
                    action="DEACTIVATE",
                    table_name="users",
                    record_id=user_id,
                    description=f"Usuario '{user.username}' desactivado",
                    old_values={"active": True},
                    new_values={"active": False},
                    ip_address=audit_ip_address,
                )
            except Exception as e:
                logger.error("Error registrando auditoría de desactivación de usuario: %s", e)
        
        return deactivated_user

    def unlock_user(
        self,
        user_id: str,
        audit_user_id: Optional[str] = None,
        audit_user_name: Optional[str] = None,
        audit_ip_address: Optional[str] = None,
    ) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("Usuario no encontrado.")
        user.is_locked = False
        user.failed_attempts = 0
        unlocked_user = self.user_repo.update(user)
        
        # Registrar en auditoría
        if self.audit_service and audit_user_id:
            try:
                self.audit_service.record_action(
                    user_id=audit_user_id,
                    user_name=audit_user_name or "Unknown",
                    action="UNLOCK",
                    table_name="users",
                    record_id=user_id,
                    description=f"Usuario '{user.username}' desbloqueado",
                    old_values={"is_locked": True, "failed_attempts": user.failed_attempts},
                    new_values={"is_locked": False, "failed_attempts": 0},
                    ip_address=audit_ip_address,
                )
            except Exception as e:
                logger.error("Error registrando auditoría de desbloqueo de usuario: %s", e)
        
        return unlocked_user

    def get_roles(self) -> List[Role]:
        return self.role_repo.get_all()

    # ── Seed ──────────────────────────────────────────────────────────────────

    @staticmethod
    def seed_roles_and_admin(db) -> None:
        """
        Precarga los roles predefinidos y crea el usuario admin inicial si no existen.
        Debe llamarse después de create_all() en main.py.
        """
        role_repo = RoleRepository(db)
        user_repo = UserRepository(db)

        # Crear roles si no existen
        for role_data in PREDEFINED_ROLES:
            existing = role_repo.get_by_name(role_data["name"])
            if not existing:
                role = Role(name=role_data["name"], description=role_data["description"])
                role_repo.create(role)
                logger.info("Rol '%s' creado.", role_data["name"])

        # Crear usuario admin inicial si no existe
        admin_user = user_repo.get_by_username(DEFAULT_ADMIN["username"])
        if not admin_user:
            admin_role = role_repo.get_by_name("admin")
            if admin_role:
                admin = User(
                    id=str(uuid.uuid4()),
                    username=DEFAULT_ADMIN["username"],
                    email=DEFAULT_ADMIN["email"],
                    password_hash=generate_password_hash(DEFAULT_ADMIN["password"]),
                    active=True,
                    role_id=admin_role.id,
                )
                user_repo.create(admin)
                logger.info(
                    "Usuario admin inicial creado: %s / %s",
                    DEFAULT_ADMIN["username"],
                    DEFAULT_ADMIN["password"],
                )
