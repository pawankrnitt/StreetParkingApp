from sqlalchemy.orm import Session
from model.vehicleModel import Vehicle
from schema.vehicleSchema import VehicleCreateRequest

def get_vehicle_by_number_plate(db: Session, number_plate: str):
    return db.query(Vehicle).filter(Vehicle.numberPlate == number_plate).first()

def get_vehicles_by_user(db: Session, user_id: int):
    return db.query(Vehicle).filter(Vehicle.userId == user_id).all()

def create_vehicle(db: Session, request: VehicleCreateRequest, user_id: int):
    vehicle = Vehicle(
        userId=user_id,
        numberPlate=request.numberPlate,
        vehicleType=request.vehicleType
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

def delete_vehicle(db: Session, vehicle_id: int, user_id: int):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.userId == user_id).first()
    if vehicle:
        db.delete(vehicle)
        db.commit()
    return vehicle
