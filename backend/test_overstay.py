import sys
import datetime
from sqlalchemy.orm import Session
from config.database import SessionLocal
from model.bookingModel import Booking
from enums.bookingTypeEnum import BookingType, BookingStatus

db = SessionLocal()
now = datetime.datetime.utcnow()
b = Booking(
    parkingSlotId=1,
    startTime=now - datetime.timedelta(hours=3),
    endTime=now - datetime.timedelta(hours=2),
    status=BookingStatus.OVERSTAYED,
    bookingType=BookingType.ONLINE,
    totalAmount=50.0
)
db.add(b)
db.commit()
db.refresh(b)
print(b.id)
