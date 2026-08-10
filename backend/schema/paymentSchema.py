from pydantic import BaseModel

class PaymentOrderRequest(BaseModel):
    bookingId: int

class PaymentOrderResponse(BaseModel):
    orderId: str
    amount: float
    currency: str = "INR"

class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    bookingId: int
