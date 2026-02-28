from typing import List
from abc import ABC, abstractmethod
from Product.Domain.price_history import PriceHistory

class PriceHistoryRepositoryPort(ABC):
    @abstractmethod
    def create(self, history: PriceHistory) -> PriceHistory:
        pass

    @abstractmethod
    def get_by_product(self, product_id: str) -> List[PriceHistory]:
        pass
