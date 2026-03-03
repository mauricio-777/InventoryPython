from abc import ABC, abstractmethod
from typing import List, Optional
from User.Domain.user import User
from User.Domain.role import Role


class UserRepositoryPort(ABC):
    @abstractmethod
    def create(self, user: User) -> User: ...

    @abstractmethod
    def get_by_id(self, user_id: str) -> Optional[User]: ...

    @abstractmethod
    def get_by_username(self, username: str) -> Optional[User]: ...

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]: ...

    @abstractmethod
    def get_all(self, skip: int = 0, limit: int = 100) -> List[User]: ...

    @abstractmethod
    def update(self, user: User) -> User: ...


class RoleRepositoryPort(ABC):
    @abstractmethod
    def create(self, role: Role) -> Role: ...

    @abstractmethod
    def get_by_id(self, role_id: int) -> Optional[Role]: ...

    @abstractmethod
    def get_by_name(self, name: str) -> Optional[Role]: ...

    @abstractmethod
    def get_all(self) -> List[Role]: ...
