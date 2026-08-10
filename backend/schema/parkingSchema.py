from pydantic import BaseModel
from typing import Optional, List
from enums.parkingStatusEnum import ParkingStatus

class ParkingSlotResponse(BaseModel):
    id: int
    slotNumber: str
    status: str
    vehicleType: str

    class Config:
        from_attributes = True

class ParkingLotCreateRequest(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    totalSlots: int

class ParkingLotStatusUpdateRequest(BaseModel):
    status: ParkingStatus

class ParkingLotResponse(BaseModel):
    id: int
    name: str
    address: str
    latitude: float
    longitude: float
    totalSlots: int
    onlineSlots: int
    offlineSlots: int
    status: str
    slots: List[ParkingSlotResponse] = []

    class Config:
        from_attributes = True
