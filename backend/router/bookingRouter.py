from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from schema.bookingSchema import BookingCreateRequest, OfflineBookingCreateRequest, BookingResponse
from controller.bookingController import (
    process_online_booking,
    process_offline_booking,
    checkout_booking,
    fetch_booking
)
from middleware.auth import get_current_user, require_admin
from model.userModel import User

router = APIRouter(prefix="/api/v1/booking", tags=["Booking"])

@router.post("", response_model=BookingResponse)
def create_booking(request: BookingCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return process_online_booking(db, request, current_user.id)

@router.post("/offline", response_model=BookingResponse)
def create_offline(request: OfflineBookingCreateRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return process_offline_booking(db, request)

@router.post("/{bookingId}/checkout", response_model=BookingResponse)
def checkout(bookingId: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    # Assuming only admin/operator can officially checkout (mark vehicle removed)
    return checkout_booking(db, bookingId)

@router.get("/{bookingId}", response_model=BookingResponse)
def get_booking(bookingId: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return fetch_booking(db, bookingId)
