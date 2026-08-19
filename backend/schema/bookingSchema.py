from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookingCreateRequest(BaseModel):
    parkingSlotId: int
    vehicleId: int
    startTime: datetime
    endTime: datetime

class OfflineBookingCreateRequest(BaseModel):
    parkingSlotId: int
    startTime: datetime
    endTime: datetime

class BookingResponse(BaseModel):
    id: int
    userId: Optional[int]
    vehicleId: Optional[int]
    parkingSlotId: int
    startTime: datetime
    endTime: datetime
    status: str
    bookingType: str
    totalAmount: float
    actualEndTime: Optional[datetime] = None
    overstayAmount: float = 0.0

    class Config:
        from_attributes = True
