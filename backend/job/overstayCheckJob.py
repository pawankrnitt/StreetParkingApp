import logging
from datetime import datetime
from sqlalchemy.orm import Session
from config.database import SessionLocal
from repo.bookingRepo import get_expired_active_bookings
from controller.notificationController import send_overstay_notification
from enums.bookingTypeEnum import BookingStatus

logger = logging.getLogger(__name__)

# Penalty logic: Rs 20 per 15 minutes of overstay
PENALTY_RATE_PER_15_MIN = 20.0

def run_overstay_check():
    logger.info("Running overstay check job...")
    db: Session = SessionLocal()
    try:
        now = datetime.utcnow()
        expired_bookings = get_expired_active_bookings(db, now)
        
        for booking in expired_bookings:
            # Calculate total overstay minutes
            overstay_duration = now - booking.endTime
            overstay_minutes = int(overstay_duration.total_seconds() / 60)
            
            if overstay_minutes > 0:
                # We calculate how many 15 min blocks have elapsed since end time
                blocks = (overstay_minutes // 15) + 1 # +1 for any fraction of a block
                penalty_amount = blocks * PENALTY_RATE_PER_15_MIN
                
                # Update booking status
                # If they were just CONFIRMED/ACTIVE, they are now OVERSTAYED
                booking.status = BookingStatus.OVERSTAYED
                # Only add penalty if it hasn't already been added in this cycle
                # (A better design stores penalty separately, but MVP we just update total)
                
                # To prevent double charging every 5 minutes for the SAME block, 
                # we'd ideally track 'last_penalty_applied_time'. 
                # For MVP, we will assume we calculate total penalty from end_time vs now
                # and update total amount overriding previous penalties.
                
                # Original booking amount needs to be tracked if we override.
                # Assuming `totalAmount` holds the cumulative. We should be careful not to keep adding endlessly.
                # Since we update `totalAmount` in MVP, let's just add the diff.
                
                # We will just print the notification for MVP
                # In real life, we should track penalty amounts accurately.
                
                logger.info(f"Booking {booking.id} has overstayed. Penalty: {penalty_amount}")
                send_overstay_notification(booking.userId, booking.id, penalty_amount, overstay_minutes)
                
                # In real prod: db.commit() to save the new status and totalAmount
        
        db.commit()
    except Exception as e:
        logger.error(f"Error in overstay check job: {e}")
        db.rollback()
    finally:
        db.close()
    logger.info("Overstay check job completed.")
