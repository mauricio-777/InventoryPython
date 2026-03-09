from sqlalchemy.orm import Session
from typing import List, Optional
from Warehouse.Domain.location import Location

class LocationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, location: Location) -> Location:
        self.db.add(location)
        self.db.commit()
        self.db.refresh(location)
        return location

    def get_by_id(self, location_id: str) -> Optional[Location]:
        return self.db.query(Location).filter(Location.id == location_id).first()

    def get_by_composite(self, zone: str, aisle: str, rack: str, level: str) -> Optional[Location]:
        return self.db.query(Location).filter(
            Location.zone == zone,
            Location.aisle == aisle,
            Location.rack == rack,
            Location.level == level
        ).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Location]:
        return self.db.query(Location).order_by(Location.zone, Location.aisle, Location.rack, Location.level).offset(skip).limit(limit).all()

    def update(self, location: Location) -> Location:
        self.db.commit()
        self.db.refresh(location)
        return location

    def delete(self, location: Location):
        self.db.delete(location)
        self.db.commit()
