from typing import List, Optional
from abc import ABC, abstractmethod
from Product.Domain.product import Product

class ProductRepositoryPort(ABC):
    @abstractmethod
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Product]:
        pass

    @abstractmethod
    def get_by_id(self, product_id: str) -> Optional[Product]:
        pass

    @abstractmethod
    def get_by_sku(self, sku: str) -> Optional[Product]:
        pass

    @abstractmethod
    def create(self, product: Product) -> Product:
        pass

    @abstractmethod
    def update(self, product: Product) -> Product:
        pass

    @abstractmethod
    def delete(self, product_id: str) -> bool:
        pass
