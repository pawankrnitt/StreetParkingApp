from sqlalchemy.orm import Session
from fastapi import HTTPException
from schema.vehicleSchema import VehicleCreateRequest
from repo.vehicleRepo import get_vehicle_by_number_plate, get_vehicles_by_user, create_vehicle, delete_vehicle

def register_vehicle(db: Session, request: VehicleCreateRequest, user_id: int):
    if get_vehicle_by_number_plate(db, request.numberPlate):
        raise HTTPException(status_code=400, detail="Vehicle with this number plate already exists")
    
    return create_vehicle(db, request, user_id)

def list_user_vehicles(db: Session, user_id: int):
    return get_vehicles_by_user(db, user_id)

def remove_vehicle(db: Session, vehicle_id: int, user_id: int):
    vehicle = delete_vehicle(db, vehicle_id, user_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found or you don't have permission")
    return {"message": "Vehicle removed successfully"}
