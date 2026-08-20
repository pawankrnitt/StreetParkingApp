from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import Base, engine

# Create the database tables if they don't exist yet (though Alembic is preferred)
Base.metadata.create_all(bind=engine)

# Auto-migrate the database to add new columns if they don't exist (for SQLite)
from sqlalchemy import text
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE bookings ADD COLUMN actualEndTime DATETIME"))
    except Exception:
        pass
    try:
        conn.execute(text("ALTER TABLE bookings ADD COLUMN overstayAmount FLOAT DEFAULT 0.0"))
    except Exception:
        pass
    conn.commit()

app = FastAPI(title="Street Parking App", version="1.0.0")

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Street Parking API"}

from router import userRouter, adminRouter, vehicleRouter, parkingRouter, bookingRouter, paymentRouter, analyticsRouter
from job.dynamicPricingJob import start_scheduler
from fastapi import WebSocket, WebSocketDisconnect
from websocket import manager

app.include_router(userRouter.router)
app.include_router(adminRouter.router)
app.include_router(vehicleRouter.router)
app.include_router(parkingRouter.router)
app.include_router(bookingRouter.router)
app.include_router(paymentRouter.router)
app.include_router(analyticsRouter.router)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from client for MVP, just keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.on_event("startup")
def startup_event():
    start_scheduler()

