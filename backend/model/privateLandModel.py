from sqlalchemy import Column, Integer, String, Float
from config.database import Base

class PrivateLandRequest(Base):
    __tablename__ = "private_land_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact = Column(String, nullable=False)
    location = Column(String, nullable=False)
    approxSize = Column(Float, nullable=False)
    status = Column(String, default="NEW") # NEW, REVIEWING, APPROVED, REJECTED
