from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from config.database import get_db
from schema.vehicleSchema import VehicleCreateRequest, VehicleResponse
from controller.vehicleController import register_vehicle, list_user_vehicles, remove_vehicle
from middleware.auth import get_current_user
from model.userModel import User

router = APIRouter(prefix="/api/v1/vehicle", tags=["Vehicle"])

@router.post("", response_model=VehicleResponse)
def create_vehicle(request: VehicleCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return register_vehicle(db, request, current_user.id)

@router.get("", response_model=List[VehicleResponse])
def get_vehicles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return list_user_vehicles(db, current_user.id)

@router.delete("/{vehicleId}")
def delete_vehicle(vehicleId: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return remove_vehicle(db, vehicleId, current_user.id)
