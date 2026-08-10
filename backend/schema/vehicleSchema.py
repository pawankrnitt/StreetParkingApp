from pydantic import BaseModel
from typing import Optional, List

class VehicleCreateRequest(BaseModel):
    numberPlate: str
    vehicleType: str

class VehicleResponse(BaseModel):
    id: int
    numberPlate: str
    vehicleType: str

    class Config:
        from_attributes = True
