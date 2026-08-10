from enum import Enum

class ParkingStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION"
