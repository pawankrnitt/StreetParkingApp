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

    class Config:
        from_attributes = True
