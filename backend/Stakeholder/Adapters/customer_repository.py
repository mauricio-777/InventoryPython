from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from Stakeholder.Domain.customer import Customer
from Stakeholder.Ports.repository import CustomerRepositoryPort


class CustomerRepository(CustomerRepositoryPort):
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Customer]:
        return self.db.query(Customer).offset(skip).limit(limit).all()

    def get_by_id(self, customer_id: str) -> Optional[Customer]:
        return self.db.query(Customer).filter(Customer.id == customer_id).first()

    def get_by_document(self, numero_documento: str) -> Optional[Customer]:
        return self.db.query(Customer).filter(Customer.numero_documento == numero_documento).first()

    def get_by_email(self, email: str) -> Optional[Customer]:
        return self.db.query(Customer).filter(Customer.email == email).first()

    def search(self, query: str, skip: int = 0, limit: int = 20) -> List[Customer]:
        pattern = f"%{query}%"
        return (
            self.db.query(Customer)
            .filter(
                or_(
                    Customer.nombre.ilike(pattern),
                    Customer.numero_documento.ilike(pattern),
                    Customer.email.ilike(pattern),
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, customer: Customer) -> Customer:
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def update(self, customer: Customer) -> Customer:
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def delete(self, customer_id: str) -> bool:
        customer = self.get_by_id(customer_id)
        if customer:
            self.db.delete(customer)
            self.db.commit()
            return True
        return False
