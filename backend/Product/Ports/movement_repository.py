from typing import List, Optional
from abc import ABC, abstractmethod
from Product.Domain.batch import Batch
from Product.Domain.movement import Movement

class MovementRepositoryPort(ABC):
    @abstractmethod
    def create_batch(self, batch: Batch) -> Batch:
        pass

    @abstractmethod
    def get_batches_by_product(self, product_id: str, active_only: bool = True) -> List[Batch]:
        pass

    @abstractmethod
    def create_movement(self, movement: Movement) -> Movement:
        pass

    @abstractmethod
    def get_movements_by_product(self, product_id: str) -> List[Movement]:
        pass
