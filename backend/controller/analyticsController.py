from sqlalchemy.orm import Session
from sqlalchemy import func
from model.bookingModel import Booking
from model.parkingModel import ParkingLot
from enums.bookingTypeEnum import BookingStatus

def get_analytics_overview(db: Session):
    total_revenue = db.query(func.sum(Booking.totalAmount)).filter(Booking.status == BookingStatus.COMPLETED).scalar() or 0.0
    total_active_bookings = db.query(Booking).filter(Booking.status.in_([BookingStatus.ACTIVE, BookingStatus.CONFIRMED])).count()
    
    total_slots = db.query(func.sum(ParkingLot.onlineSlots + ParkingLot.offlineSlots)).scalar() or 0
    # For MVP, occupancy rate based on active bookings vs total stated capacity
    occupancy_rate = 0.0
    if total_slots > 0:
        occupancy_rate = round((total_active_bookings / total_slots) * 100, 2)
        
    return {
        "totalRevenue": total_revenue,
        "totalActiveBookings": total_active_bookings,
        "cityOccupancyRate": occupancy_rate
    }
