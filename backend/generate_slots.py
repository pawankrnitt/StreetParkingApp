import os
from config.database import SessionLocal, engine, Base
from model.parkingModel import ParkingLot, ParkingSlot

def generate_slots():
    db = SessionLocal()
    lots = db.query(ParkingLot).all()
    
    slots_created = 0
    for lot in lots:
        # Check if slots already exist for this lot
        existing_slots_count = db.query(ParkingSlot).filter(ParkingSlot.parkingLotId == lot.id).count()
        if existing_slots_count == 0:
            # Create online slots
            new_slots = []
            for i in range(1, lot.onlineSlots + 1):
                new_slots.append(ParkingSlot(
                    parkingLotId=lot.id,
                    slotNumber=f"S-{i:03d}",
                    status="AVAILABLE",
                    vehicleType="CAR"
                ))
            db.add_all(new_slots)
            slots_created += len(new_slots)
            
    if slots_created > 0:
        db.commit()
        print(f"Successfully generated {slots_created} slots for existing parking lots.")
    else:
        print("All parking lots already have slots.")
        
    db.close()

if __name__ == "__main__":
    generate_slots()
