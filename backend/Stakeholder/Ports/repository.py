from abc import ABC, abstractmethod
from typing import List, Optional


class CustomerRepositoryPort(ABC):
    @abstractmethod
    def get_all(self, skip: int = 0, limit: int = 100) -> List:
        pass

    @abstractmethod
    def get_by_id(self, customer_id: str) -> Optional[object]:
        pass

    @abstractmethod
    def get_by_document(self, numero_documento: str) -> Optional[object]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[object]:
        pass

    @abstractmethod
    def search(self, query: str, skip: int = 0, limit: int = 20) -> List:
        pass

    @abstractmethod
    def create(self, customer) -> object:
        pass

    @abstractmethod
    def update(self, customer) -> object:
        pass

    @abstractmethod
    def delete(self, customer_id: str) -> bool:
        pass


class SupplierRepositoryPort(ABC):
    @abstractmethod
    def get_all(self, skip: int = 0, limit: int = 100) -> List:
        pass

    @abstractmethod
    def get_by_id(self, supplier_id: str) -> Optional[object]:
        pass

    @abstractmethod
    def get_by_document(self, numero_documento: str) -> Optional[object]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[object]:
        pass

    @abstractmethod
    def search(self, query: str, skip: int = 0, limit: int = 20) -> List:
        pass

    @abstractmethod
    def create(self, supplier) -> object:
        pass

    @abstractmethod
    def update(self, supplier) -> object:
        pass

    @abstractmethod
    def delete(self, supplier_id: str) -> bool:
        pass
