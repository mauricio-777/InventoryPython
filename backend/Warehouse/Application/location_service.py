import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List
from Warehouse.Domain.location import Location
from Warehouse.Adapters.location_repository import LocationRepository

class LocationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = LocationRepository(db)

    def get_locations(self, skip: int = 0, limit: int = 100) -> List[Location]:
        return self.repo.get_all(skip=skip, limit=limit)

    def get_location(self, location_id: str) -> Location:
        location = self.repo.get_by_id(location_id)
        if not location:
            raise HTTPException(status_code=404, detail="Location not found")
        return location

    def create_location(self, data: dict, user_id: str) -> Location:
        # Check if identical location exists
        existing = self.repo.get_by_composite(
            zone=data['zone'], aisle=data['aisle'], rack=data['rack'], level=data['level']
        )
        if existing:
            raise HTTPException(status_code=400, detail="A location with this zone, aisle, rack and level already exists")

        new_loc = Location(
            id=str(uuid.uuid4()),
            zone=data['zone'],
            aisle=data['aisle'],
            rack=data['rack'],
            level=data['level']
        )
        new_loc.set_audit_create(user_id)
        return self.repo.create(new_loc)

    def update_location(self, location_id: str, data: dict, user_id: str) -> Location:
        location = self.get_location(location_id)
        
        # Check if new combination exists in another location
        existing = self.repo.get_by_composite(
            zone=data.get('zone', location.zone), 
            aisle=data.get('aisle', location.aisle), 
            rack=data.get('rack', location.rack), 
            level=data.get('level', location.level)
        )
        if existing and existing.id != location_id:
            raise HTTPException(status_code=400, detail="Another location with this definition already exists")

        location.zone = data.get('zone', location.zone)
        location.aisle = data.get('aisle', location.aisle)
        location.rack = data.get('rack', location.rack)
        location.level = data.get('level', location.level)
        
        location.set_audit_update(user_id)
        return self.repo.update(location)

    def delete_location(self, location_id: str):
        location = self.get_location(location_id)
        # Prevent deletion if there are batches linked to this location
        if location.batches and len(location.batches) > 0:
            raise HTTPException(status_code=400, detail="Cannot delete location because there are batches stored in it")
            
        self.repo.delete(location)
