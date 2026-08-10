from fastapi import WebSocket
from typing import List
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # Handle dropped connections gracefully
                pass

    async def broadcast_lot_update(self, lot_id: int, online_slots: int, offline_slots: int, status: str):
        payload = {
            "type": "LOT_UPDATE",
            "data": {
                "id": lot_id,
                "onlineSlots": online_slots,
                "offlineSlots": offline_slots,
                "status": status
            }
        }
        await self.broadcast(json.dumps(payload))

manager = ConnectionManager()
