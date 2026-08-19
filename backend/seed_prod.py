import os
from config.database import SessionLocal, engine, Base
from model.parkingModel import ParkingLot
from model.userModel import User
from middleware.auth import get_password_hash

def seed():
    # Only create tables if they don't exist (Useful for rapid provisioning)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check and create default admin
    admin_email = "admin@streetpark.com"
    admin_user = db.query(User).filter(User.email == admin_email).first()
    if not admin_user:
        hashed_password = get_password_hash("admin123")
        admin_user = User(
            name="Super Admin",
            email=admin_email,
            phone="0000000000",
            passwordHash=hashed_password,
            role="ADMIN"
        )
        db.add(admin_user)
        db.commit()
        print(f"Created default admin: {admin_email} / admin123")
    
    # Check if data already exists
    if db.query(ParkingLot).first():
        print("Database is already seeded. Skipping.")
        db.close()
        return

    data = [
        ('Inorbit Mall Parking', 'Gorwa Road, Vadodara', 22.3155, 73.1643, 200, 100, 100, 'ACTIVE'),
        ('Eva The Mall Parking', 'Manjalpur, Vadodara', 22.2747, 73.1979, 150, 50, 100, 'ACTIVE'),
        ('Seven Seas Mall Parking', 'Fatehgunj, Vadodara', 22.3210, 73.1855, 120, 80, 40, 'ACTIVE'),
        ('Center Square Mall', 'Alkapuri, Vadodara', 22.3168, 73.1678, 100, 20, 80, 'ACTIVE'),
        ('Vadodara Railway Station', 'Station Road, Vadodara', 22.3115, 73.1818, 300, 50, 250, 'ACTIVE'),
        ('Central Bus Station (GSRTC)', 'Station Road, Vadodara', 22.3090, 73.1830, 250, 200, 50, 'ACTIVE'),
        ('Airport Circle Parking', 'Harni Road, Vadodara', 22.3330, 73.2160, 150, 140, 10, 'ACTIVE'),
        ('Nyay Mandir Parking', 'Old City, Vadodara', 22.2980, 73.2045, 50, 5, 45, 'ACTIVE'),
        ('Sursagar Lake Parking', 'Mandvi, Vadodara', 22.2995, 73.1970, 80, 10, 70, 'ACTIVE'),
        ('EME Temple Area', 'Fatehgunj, Vadodara', 22.3300, 73.1930, 60, 40, 20, 'ACTIVE'),
        ('Kirti Mandir Parking', 'Kothi Road, Vadodara', 22.3080, 73.1915, 70, 30, 40, 'ACTIVE'),
        ('Maharaja Fateh Singh Museum', 'Palace Road, Vadodara', 22.2905, 73.1925, 100, 80, 20, 'ACTIVE'),
        ('Baroda Museum & Picture Gallery', 'Sayaji Baug, Vadodara', 22.3135, 73.1870, 120, 100, 20, 'ACTIVE'),
        ('Makarpura GIDC Parking', 'Makarpura, Vadodara', 22.2600, 73.1950, 200, 150, 50, 'ACTIVE'),
        ('Manjalpur Naka', 'Manjalpur, Vadodara', 22.2750, 73.1920, 50, 15, 35, 'ACTIVE'),
        ('Akota Stadium Parking', 'Akota, Vadodara', 22.3025, 73.1700, 300, 100, 200, 'ACTIVE'),
        ('Genda Circle Parking', 'Alkapuri, Vadodara', 22.3205, 73.1665, 90, 45, 45, 'ACTIVE'),
        ('Gorwa BIDC', 'Gorwa, Vadodara', 22.3350, 73.1550, 150, 100, 50, 'ACTIVE'),
        ('Vasna Bhayli Road Hub', 'Bhayli, Vadodara', 22.2950, 73.1450, 100, 60, 40, 'ACTIVE'),
        ('Gotri Pond Parking', 'Gotri, Vadodara', 22.3200, 73.1420, 80, 30, 50, 'ACTIVE'),
        ('Sama Savli Road Complex', 'Sama, Vadodara', 22.3450, 73.1950, 120, 70, 50, 'ACTIVE'),
        ('Nizampura Main Road', 'Nizampura, Vadodara', 22.3300, 73.1800, 60, 20, 40, 'ACTIVE'),
        ('Karelibaug Water Tank', 'Karelibaug, Vadodara', 22.3250, 73.2000, 75, 25, 50, 'ACTIVE'),
        ('Waghodia Road Circle', 'Waghodia Road, Vadodara', 22.3000, 73.2300, 110, 80, 30, 'ACTIVE'),
        ('Ajwa Road Crossing', 'Ajwa Road, Vadodara', 22.3100, 73.2250, 90, 50, 40, 'ACTIVE'),
        ('Mandvi Gate Parking', 'Mandvi, Vadodara', 22.3000, 73.2080, 40, 5, 35, 'ACTIVE'),
        ('Raopura Tower Parking', 'Raopura, Vadodara', 22.3020, 73.2020, 60, 10, 50, 'ACTIVE'),
        ('Dandia Bazar', 'Dandia Bazar, Vadodara', 22.2950, 73.1980, 50, 20, 30, 'ACTIVE'),
        ('Kalali Phatak', 'Kalali, Vadodara', 22.2700, 73.1600, 80, 40, 40, 'ACTIVE'),
        ('Tarsali Ring Road', 'Tarsali, Vadodara', 22.2450, 73.1950, 100, 50, 50, 'ACTIVE'),
        ('Sayaji Baug Parking', 'Kala Ghoda Circle, Vadodara', 22.3121, 73.1873, 120, 80, 40, 'ACTIVE'),
        ('Laxmi Vilas Palace Parking', 'J.N.Marg, Vadodara', 22.2936, 73.1904, 200, 150, 50, 'ACTIVE'),
        ('Alkapuri Commercial Center', 'Alkapuri, Vadodara', 22.3109, 73.1678, 80, 20, 60, 'ACTIVE'),
        ('Fatehgunj Hub', 'Fatehgunj Main Road, Vadodara', 22.3218, 73.1843, 60, 55, 5, 'ACTIVE'),
        ('Khanderao Market Parking', 'Rajmahal Road, Vadodara', 22.2965, 73.2037, 150, 0, 150, 'ACTIVE')
    ]

    lots = []
    for row in data:
        lot = ParkingLot(
            name=row[0],
            address=row[1],
            latitude=row[2],
            longitude=row[3],
            totalSlots=row[4],
            onlineSlots=row[5],
            offlineSlots=row[6],
            status=row[7]
        )
        lots.append(lot)
    
    db.add_all(lots)
    db.commit()
    print(f"Successfully seeded {len(lots)} parking locations into the production database.")
    db.close()

if __name__ == "__main__":
    print(f"Connected to DB: {os.getenv('DATABASE_URL', 'sqlite:///./street_parking.db')}")
    seed()
