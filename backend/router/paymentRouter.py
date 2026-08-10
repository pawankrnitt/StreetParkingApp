from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from config.database import get_db
from pydantic import BaseModel
from controller.paymentController import mock_process_payment
from middleware.auth import get_current_user
from model.userModel import User

router = APIRouter(prefix="/api/v1/payment", tags=["Payment"])

class MockPaymentRequest(BaseModel):
    bookingId: int

@router.post("/mock-pay")
def process_mock_payment(request: MockPaymentRequest, db: Session = Depends(get_db)):
    # Bypassing current_user check just for this mock flow to make testing easy
    return mock_process_payment(db, request.bookingId)
