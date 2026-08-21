from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import Base, engine

# Create the database tables if they don't exist yet (though Alembic is preferred)
Base.metadata.create_all(bind=engine)

# Auto-migrate the database to add new columns if they don't exist
from sqlalchemy import text
try:
    with engine.begin() as conn:
        conn.execute(text('ALTER TABLE bookings ADD COLUMN "actualEndTime" TIMESTAMP'))
except Exception:
    pass

try:
    with engine.begin() as conn:
        conn.execute(text('ALTER TABLE bookings ADD COLUMN "overstayAmount" FLOAT DEFAULT 0.0'))
except Exception:
    pass

# Ensure slots are generated for any lots that are missing them
try:
    from generate_slots import generate_slots
    generate_slots()
except Exception as e:
    print("Error generating slots:", e)

app = FastAPI(title="Street Parking App", version="1.0.0")

from fastapi.responses import JSONResponse
from fastapi import Request
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "traceback": traceback.format_exc()}
    )

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=False,
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

