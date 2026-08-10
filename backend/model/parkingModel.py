from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from config.database import Base

class ParkingLot(Base):
    __tablename__ = "parking_lots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    totalSlots = Column(Integer, nullable=False)
    onlineSlots = Column(Integer, nullable=False)
    offlineSlots = Column(Integer, nullable=False)
    status = Column(String, nullable=False) # ACTIVE, INACTIVE, UNDER_CONSTRUCTION

    slots = relationship("ParkingSlot", back_populates="lot", cascade="all, delete-orphan")
    pricing_history = relationship("PricingHistory", back_populates="lot", cascade="all, delete-orphan")

class ParkingSlot(Base):
    __tablename__ = "parking_slots"

    id = Column(Integer, primary_key=True, index=True)
    parkingLotId = Column(Integer, ForeignKey("parking_lots.id"), nullable=False)
    slotNumber = Column(String, nullable=False)
    status = Column(String, nullable=False, default="AVAILABLE") # AVAILABLE, BOOKED, OCCUPIED
    vehicleType = Column(String, nullable=False) # CAR, BIKE

    lot = relationship("ParkingLot", back_populates="slots")
    bookings = relationship("Booking", back_populates="slot", cascade="all, delete-orphan")

class PricingHistory(Base):
    __tablename__ = "pricing_histories"

    id = Column(Integer, primary_key=True, index=True)
    parkingLotId = Column(Integer, ForeignKey("parking_lots.id"), nullable=False)
    timestamp = Column(String, nullable=False) # using string or datetime
    hourlyRate = Column(Float, nullable=False)

    lot = relationship("ParkingLot", back_populates="pricing_history")
