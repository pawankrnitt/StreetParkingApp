from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from model.bookingModel import Booking
from schema.bookingSchema import BookingCreateRequest, OfflineBookingCreateRequest
from enums.bookingTypeEnum import BookingType, BookingStatus
import datetime

def get_booking_by_id(db: Session, booking_id: int):
    return db.query(Booking).filter(Booking.id == booking_id).first()

def get_active_bookings_for_slot(db: Session, slot_id: int, start_time: datetime.datetime, end_time: datetime.datetime):
    # Check for any overlapping bookings
    return db.query(Booking).filter(
        Booking.parkingSlotId == slot_id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.ACTIVE, BookingStatus.OVERSTAYED]),
        or_(
            and_(Booking.startTime <= start_time, Booking.endTime > start_time),
            and_(Booking.startTime < end_time, Booking.endTime >= end_time),
            and_(Booking.startTime >= start_time, Booking.endTime <= end_time)
        )
    ).all()

def count_active_bookings_for_lot(db: Session, lot_id: int, booking_type: BookingType):
    return db.query(Booking).filter(
        Booking.slot.has(parkingLotId=lot_id),
        Booking.bookingType == booking_type,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.ACTIVE, BookingStatus.OVERSTAYED])
    ).count()

def get_expired_active_bookings(db: Session, current_time: datetime.datetime):
    # Get all bookings where end_time < now, and status is still ACTIVE/CONFIRMED
    return db.query(Booking).filter(
        Booking.endTime < current_time,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.ACTIVE, BookingStatus.OVERSTAYED])
    ).all()

def create_online_booking(db: Session, request: BookingCreateRequest, user_id: int, total_amount: float):
    booking = Booking(
        userId=user_id,
        vehicleId=request.vehicleId,
        parkingSlotId=request.parkingSlotId,
        startTime=request.startTime,
        endTime=request.endTime,
        status=BookingStatus.CONFIRMED,
        bookingType=BookingType.ONLINE,
        totalAmount=total_amount
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

def create_offline_booking(db: Session, request: OfflineBookingCreateRequest, total_amount: float):
    booking = Booking(
        userId=None,
        vehicleId=None,
        parkingSlotId=request.parkingSlotId,
        startTime=request.startTime,
        endTime=request.endTime,
        status=BookingStatus.ACTIVE,
        bookingType=BookingType.OFFLINE,
        totalAmount=total_amount
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

def update_booking_status(db: Session, booking_id: int, status: BookingStatus):
    booking = get_booking_by_id(db, booking_id)
    if booking:
        booking.status = status
        db.commit()
        db.refresh(booking)
    return booking
