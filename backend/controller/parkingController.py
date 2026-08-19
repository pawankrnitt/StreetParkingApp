from sqlalchemy.orm import Session
from fastapi import HTTPException
from schema.parkingSchema import ParkingLotCreateRequest, ParkingLotStatusUpdateRequest
from repo.parkingRepo import get_parking_lots, get_parking_lot_by_id, create_parking_lot, update_parking_lot_status, delete_parking_lot
from repo.bookingRepo import get_active_bookings_for_lot
from datetime import datetime

from typing import Optional

def fetch_parking_lots(db: Session, user_role: str, start: Optional[datetime] = None, end: Optional[datetime] = None):
    # citizens only see active lots
    only_active = user_role != "ADMIN"
    lots = get_parking_lots(db, only_active)
    
    if not start or not end:
        start = datetime.now()
        end = datetime.now()
        
    for lot in lots:
        bookings = get_active_bookings_for_lot(db, lot.id, start, end)
        booked_slots_set = {b.parkingSlotId for b in bookings}
        lot.availableSlots = max(0, lot.totalSlots - len(booked_slots_set))
            
    return lots

def fetch_parking_lot(db: Session, lot_id: int):
    lot = get_parking_lot_by_id(db, lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Parking lot not found")
    return lot

def add_parking_lot(db: Session, request: ParkingLotCreateRequest):
    return create_parking_lot(db, request)

def change_parking_lot_status(db: Session, lot_id: int, request: ParkingLotStatusUpdateRequest):
    lot = update_parking_lot_status(db, lot_id, request.status)
    if not lot:
        raise HTTPException(status_code=404, detail="Parking lot not found")
    return lot

def fetch_parking_lot_price(db: Session, lot_id: int, hour: int):
    # hour is 0-23
    # For MVP, we just get the latest price from PricingHistory
    from model.parkingModel import PricingHistory
    latest_price = db.query(PricingHistory).filter(PricingHistory.parkingLotId == lot_id).order_by(PricingHistory.id.desc()).first()
    
    if not latest_price:
        return {"lotId": lot_id, "hour": hour, "price": 50.0} # default fallback
        
    return {"lotId": lot_id, "hour": hour, "price": latest_price.hourlyRate}

def remove_parking_lot(db: Session, lot_id: int):
    lot = delete_parking_lot(db, lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Parking lot not found")
    return {"message": "Parking lot deleted successfully"}

def fetch_booked_slot_ids(db: Session, lot_id: int, start_time: datetime, end_time: datetime):
    bookings = get_active_bookings_for_lot(db, lot_id, start_time, end_time)
    booked_slot_ids = [b.parkingSlotId for b in bookings]
    return {"bookedSlotIds": booked_slot_ids}
