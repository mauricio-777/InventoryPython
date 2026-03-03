from typing import List, Optional
from sqlalchemy.orm import Session
from User.Domain.user import User
from User.Domain.role import Role
from User.Ports.repository import UserRepositoryPort, RoleRepositoryPort


class UserRepository(UserRepositoryPort):
    def __init__(self, db: Session):
        self.db = db

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        return self.db.query(User).offset(skip).limit(limit).all()

    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user


class RoleRepository(RoleRepositoryPort):
    def __init__(self, db: Session):
        self.db = db

    def create(self, role: Role) -> Role:
        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        return role

    def get_by_id(self, role_id: int) -> Optional[Role]:
        return self.db.query(Role).filter(Role.id == role_id).first()

    def get_by_name(self, name: str) -> Optional[Role]:
        return self.db.query(Role).filter(Role.name == name).first()

    def get_all(self) -> List[Role]:
        return self.db.query(Role).all()
