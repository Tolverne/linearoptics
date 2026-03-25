from fastapi import APIRouter, HTTPException

from app.schemas import SimulationRequest, SimulationResponse
from app.services.validation import validate_simulation_request
from app.services.simulation_service import run_simulation

router = APIRouter()


@router.post("/simulate", response_model=SimulationResponse)
def simulate(request: SimulationRequest):
    messages = validate_simulation_request(request)

    if messages:
        raise HTTPException(
            status_code=400,
            detail={"isValid": False, "messages": messages},
        )

    return run_simulation(request)