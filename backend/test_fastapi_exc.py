from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import traceback
import uvicorn
import threading
import time
import requests

app = FastAPI()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "traceback": traceback.format_exc()}
    )

@app.get("/")
def read_root():
    raise ValueError("Test error")

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="critical")

t = threading.Thread(target=run_server, daemon=True)
t.start()
time.sleep(1)

try:
    r = requests.get("http://127.0.0.1:8001/")
    print(r.status_code)
    print(r.text)
except Exception as e:
    print(e)
