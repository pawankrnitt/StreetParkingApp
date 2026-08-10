from enum import Enum

class BookingType(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"

class BookingStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    OVERSTAYED = "OVERSTAYED"
    CANCELLED = "CANCELLED"
