from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.simulate import router as simulate_router

app = FastAPI(title="Linear Optics Lab Bench API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://linear-optics-frontend.onrender.com",
        "https://main.ditna70yf6iy4.amplifyapp.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate_router)


@app.get("/health")
def health():
    return {"status": "ok"}

