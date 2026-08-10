from sqlalchemy.orm import Session
from fastapi import HTTPException
from repo.bookingRepo import get_booking_by_id, update_booking_status
from schema.paymentSchema import PaymentVerifyRequest
from enums.bookingTypeEnum import BookingStatus

def mock_process_payment(db: Session, booking_id: int):
    # Fetch booking
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Mark booking as confirmed
    booking = update_booking_status(db, booking_id, BookingStatus.CONFIRMED)
    
    return {
        "status": "success", 
        "message": "Payment verified and booking confirmed",
        "bookingId": booking.id,
        "amountPaid": booking.totalAmount
    }
