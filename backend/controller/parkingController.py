from sqlalchemy.orm import Session
from fastapi import HTTPException
from schema.parkingSchema import ParkingLotCreateRequest, ParkingLotStatusUpdateRequest
from repo.parkingRepo import get_parking_lots, get_parking_lot_by_id, create_parking_lot, update_parking_lot_status, delete_parking_lot

def fetch_parking_lots(db: Session, user_role: str):
    # citizens only see active lots
    only_active = user_role != "ADMIN"
    return get_parking_lots(db, only_active)

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
