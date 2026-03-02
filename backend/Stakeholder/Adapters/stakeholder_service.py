from sqlalchemy.orm import Session
from Stakeholder.Adapters.customer_repository import CustomerRepository
from Stakeholder.Adapters.supplier_repository import SupplierRepository

class StakeholderService:
    def __init__(self, db: Session):
        self.customer_repo = CustomerRepository(db)
        self.supplier_repo = SupplierRepository(db)

    def search_all_stakeholders(self, query: str, limit: int = 10, stakeholder_type: str = 'all'):
        """
        Search customers and/or suppliers by query text.
        stakeholder_type can be 'all', 'customer', or 'supplier'
        """
        results = []
        
        if stakeholder_type in ('all', 'customer'):
            customers = self.customer_repo.search(query, limit=limit)
            for c in customers:
                results.append({
                    "id": c.id,
                    "nombre": c.nombre,
                    "numero_documento": c.numero_documento,
                    "tipo_documento": c.tipo_documento,
                    "type": "customer"
                })
                
        if stakeholder_type in ('all', 'supplier'):
            suppliers = self.supplier_repo.search(query, limit=limit)
            for s in suppliers:
                results.append({
                    "id": s.id,
                    "nombre": s.nombre,
                    "numero_documento": s.numero_documento,
                    "tipo_documento": s.tipo_documento,
                    "type": "supplier"
                })
                
        # Sort combined results alphabetically by name, optionally slice to limit if needed
        # (Though we limited each repository call, the combined could be up to 2*limit)
        results.sort(key=lambda x: x['nombre'].lower())
        
        return results[:limit] if stakeholder_type == 'all' else results
