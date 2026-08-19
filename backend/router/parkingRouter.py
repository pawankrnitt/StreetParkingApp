from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from config.database import get_db
from schema.parkingSchema import ParkingLotCreateRequest, ParkingLotStatusUpdateRequest, ParkingLotResponse
from controller.parkingController import fetch_parking_lots, fetch_parking_lot, add_parking_lot, change_parking_lot_status, remove_parking_lot, fetch_parking_lot_price, fetch_booked_slot_ids
from middleware.auth import get_current_user, require_admin, get_optional_current_user
from model.userModel import User
from datetime import datetime

router = APIRouter(prefix="/api/v1/parking-lot", tags=["Parking Lot"])

@router.post("", response_model=ParkingLotResponse)
def create_lot(request: ParkingLotCreateRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return add_parking_lot(db, request)

@router.get("", response_model=List[ParkingLotResponse])
def get_lots(start: Optional[datetime] = None, end: Optional[datetime] = None, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_current_user)):
    # if not logged in, assume CITIZEN role, else use actual role
    role = current_user.role if current_user else "CITIZEN"
    return fetch_parking_lots(db, role, start, end)

@router.get("/{lotId}", response_model=ParkingLotResponse)
def get_lot(lotId: int, db: Session = Depends(get_db)):
    return fetch_parking_lot(db, lotId)

@router.get("/{lotId}/availability")
def get_lot_availability(lotId: int, start: datetime, end: datetime, db: Session = Depends(get_db)):
    return fetch_booked_slot_ids(db, lotId, start, end)

@router.get("/{lotId}/price")
def get_lot_price(lotId: int, hour: int = 0, db: Session = Depends(get_db)):
    return fetch_parking_lot_price(db, lotId, hour)

@router.put("/{lotId}")
def update_lot(lotId: int, request: ParkingLotStatusUpdateRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return change_parking_lot_status(db, lotId, request)

@router.delete("/{lotId}")
def delete_lot(lotId: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return remove_parking_lot(db, lotId)
