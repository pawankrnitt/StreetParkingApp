import logging

logger = logging.getLogger(__name__)

def send_overstay_notification(user_id: int, booking_id: int, extra_charge: float, overstay_minutes: int):
    """
    Stub for sending push/SMS notification to the user regarding an overstay.
    In production, integrate with a real service (e.g., Twilio, AWS SNS, MSG91).
    """
    if user_id:
        logger.warning(
            f"[NOTIFICATION STUB] Sending SMS to User {user_id}: "
            f"Your booking (ID: {booking_id}) has overstayed by {overstay_minutes} minutes. "
            f"An additional penalty of ₹{extra_charge} has been applied."
        )
    else:
        logger.warning(
            f"[NOTIFICATION STUB] Offline Booking {booking_id} overstayed by {overstay_minutes} minutes. "
            f"Operator needs to collect additional ₹{extra_charge} at exit."
        )
