from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from config.database import Base
from datetime import datetime

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=True) # Could be null if offline walk-in
    vehicleId = Column(Integer, ForeignKey("vehicles.id"), nullable=True) # Could be null if offline walk-in
    parkingSlotId = Column(Integer, ForeignKey("parking_slots.id"), nullable=False)
    
    startTime = Column(DateTime, nullable=False, default=datetime.utcnow)
    endTime = Column(DateTime, nullable=False)
    status = Column(String, nullable=False) # PENDING, CONFIRMED, ACTIVE, COMPLETED, OVERSTAYED, CANCELLED
    bookingType = Column(String, nullable=False) # ONLINE, OFFLINE
    totalAmount = Column(Float, nullable=False, default=0.0)
    actualEndTime = Column(DateTime, nullable=True)
    overstayAmount = Column(Float, nullable=False, default=0.0)

    user = relationship("User", back_populates="bookings")
    vehicle = relationship("Vehicle", back_populates="bookings")
    slot = relationship("ParkingSlot", back_populates="bookings")
