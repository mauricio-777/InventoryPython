from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from Stakeholder.Domain.supplier import Supplier
from Stakeholder.Ports.repository import SupplierRepositoryPort


class SupplierRepository(SupplierRepositoryPort):
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Supplier]:
        return self.db.query(Supplier).offset(skip).limit(limit).all()

    def get_by_id(self, supplier_id: str) -> Optional[Supplier]:
        return self.db.query(Supplier).filter(Supplier.id == supplier_id).first()

    def get_by_document(self, numero_documento: str) -> Optional[Supplier]:
        return self.db.query(Supplier).filter(Supplier.numero_documento == numero_documento).first()

    def get_by_email(self, email: str) -> Optional[Supplier]:
        return self.db.query(Supplier).filter(Supplier.email == email).first()

    def search(self, query: str, skip: int = 0, limit: int = 20) -> List[Supplier]:
        pattern = f"%{query}%"
        return (
            self.db.query(Supplier)
            .filter(
                or_(
                    Supplier.nombre.ilike(pattern),
                    Supplier.numero_documento.ilike(pattern),
                    Supplier.email.ilike(pattern),
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, supplier: Supplier) -> Supplier:
        self.db.add(supplier)
        self.db.commit()
        self.db.refresh(supplier)
        return supplier

    def update(self, supplier: Supplier) -> Supplier:
        self.db.commit()
        self.db.refresh(supplier)
        return supplier

    def delete(self, supplier_id: str) -> bool:
        supplier = self.get_by_id(supplier_id)
        if supplier:
            self.db.delete(supplier)
            self.db.commit()
            return True
        return False
