from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from config.database import SessionLocal
from model.parkingModel import ParkingLot, PricingHistory
from repo.bookingRepo import count_active_bookings_for_lot
from enums.bookingTypeEnum import BookingType
import logging

logger = logging.getLogger(__name__)

# Very basic dynamic pricing multiplier
def calculate_dynamic_price(lot_id: int, current_rate: float, db: Session) -> float:
    # MVP Logic: Just slightly modify rate based on arbitrary demand factor
    # A real system would pull from historical hourly data
    online_bookings = count_active_bookings_for_lot(db, lot_id, BookingType.ONLINE)
    lot = db.query(ParkingLot).filter(ParkingLot.id == lot_id).first()
    
    if not lot or lot.onlineSlots == 0:
        return current_rate
        
    occupancy_rate = online_bookings / lot.onlineSlots
    
    # Increase price by 10% if occupancy is > 80%
    if occupancy_rate > 0.8:
        return round(current_rate * 1.10, 2)
    # Decrease price by 5% if occupancy is < 30%
    elif occupancy_rate < 0.3:
        return round(current_rate * 0.95, 2)
    return current_rate

def run_dynamic_pricing():
    logger.info("Running dynamic pricing job...")
    db: Session = SessionLocal()
    try:
        lots = db.query(ParkingLot).filter(ParkingLot.status == "ACTIVE").all()
        for lot in lots:
            # Get latest pricing or default to base 50.0
            latest_price = db.query(PricingHistory).filter(PricingHistory.parkingLotId == lot.id).order_by(PricingHistory.id.desc()).first()
            current_rate = latest_price.hourlyRate if latest_price else 50.0
            
            new_rate = calculate_dynamic_price(lot.id, current_rate, db)
            
            if new_rate != current_rate or not latest_price:
                new_pricing = PricingHistory(
                    parkingLotId=lot.id,
                    timestamp=datetime.utcnow().isoformat(),
                    hourlyRate=new_rate
                )
                db.add(new_pricing)
        db.commit()
    except Exception as e:
        logger.error(f"Error in dynamic pricing job: {e}")
        db.rollback()
    finally:
        db.close()
    logger.info("Dynamic pricing job completed.")

from job.overstayCheckJob import run_overstay_check

def start_scheduler():
    scheduler = BackgroundScheduler()
    # For MVP we can run this every hour or a few minutes to see it work
    # In production: scheduler.add_job(run_dynamic_pricing, 'cron', hour=0, minute=0)
    scheduler.add_job(run_dynamic_pricing, 'interval', minutes=60)
    
    # Run overstay check every 5 minutes
    scheduler.add_job(run_overstay_check, 'interval', minutes=5)
    
    scheduler.start()
    return scheduler
