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
]

DEFAULT_ADMIN = {
    "username": "admin",
    "email": "admin@inventoryapp.com",
    "password": "Admin1234!",
}


class UserService:
    def __init__(self, user_repo: UserRepository, role_repo: RoleRepository):
        self.user_repo = user_repo
        self.role_repo = role_repo

    # ── CRUD ──────────────────────────────────────────────────────────────────

    def list_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        return self.user_repo.get_all(skip=skip, limit=limit)

    def get_user(self, user_id: str) -> Optional[User]:
        return self.user_repo.get_by_id(user_id)

    def create_user(self, username: str, email: str, password: str, role_id: int) -> User:
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
        return self.user_repo.create(user)

    def update_user(self, user_id: str, data: dict) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("Usuario no encontrado.")

        if "username" in data and data["username"] != user.username:
            if self.user_repo.get_by_username(data["username"]):
                raise ValueError(f"El nombre de usuario '{data['username']}' ya está en uso.")
            user.username = data["username"]

        if "email" in data and data["email"] != user.email:
            if self.user_repo.get_by_email(data["email"]):
                raise ValueError(f"El email '{data['email']}' ya está registrado.")
            user.email = data["email"]

        if "role_id" in data:
            role = self.role_repo.get_by_id(data["role_id"])
            if not role:
                raise ValueError(f"El rol con id {data['role_id']} no existe.")
            user.role_id = data["role_id"]

        if "password" in data and data["password"]:
            user.password_hash = generate_password_hash(data["password"])

        if "active" in data:
            user.active = bool(data["active"])

        return self.user_repo.update(user)

    def deactivate_user(self, user_id: str) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("Usuario no encontrado.")
        user.active = False
        return self.user_repo.update(user)

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
