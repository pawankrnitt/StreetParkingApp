from sqlalchemy.orm import Session
from model.parkingModel import ParkingLot, ParkingSlot
from schema.parkingSchema import ParkingLotCreateRequest
from constant.appConstant import OFFLINE_QUOTA_PERCENT

def get_parking_lots(db: Session, only_active: bool = False):
    query = db.query(ParkingLot)
    if only_active:
        query = query.filter(ParkingLot.status == "ACTIVE")
    return query.all()

def get_parking_lot_by_id(db: Session, lot_id: int):
    return db.query(ParkingLot).filter(ParkingLot.id == lot_id).first()

def create_parking_lot(db: Session, request: ParkingLotCreateRequest):
    offline_slots = int(request.totalSlots * (OFFLINE_QUOTA_PERCENT / 100))
    online_slots = request.totalSlots - offline_slots
    
    lot = ParkingLot(
        name=request.name,
        address=request.address,
        latitude=request.latitude,
        longitude=request.longitude,
        totalSlots=request.totalSlots,
        onlineSlots=online_slots,
        offlineSlots=offline_slots,
        status="UNDER_CONSTRUCTION" # Default when created
    )
    db.add(lot)
    db.commit()
    db.refresh(lot)
    return lot

def update_parking_lot_status(db: Session, lot_id: int, status: str):
    lot = db.query(ParkingLot).filter(ParkingLot.id == lot_id).first()
    if lot:
        lot.status = status
        db.commit()
        db.refresh(lot)
    return lot

def delete_parking_lot(db: Session, lot_id: int):
    lot = db.query(ParkingLot).filter(ParkingLot.id == lot_id).first()
    if lot:
        db.delete(lot)
        db.commit()
    return lot
