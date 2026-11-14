import logging
from fastapi import APIRouter
from schemas.request import SolverRequest
from schemas.response import SolverResponse
from services.vrp_solver import solve_vrptw

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/solver", tags=["Solver"])


@router.post("/optimize", response_model=SolverResponse)
def optimize_routes(request: SolverRequest) -> SolverResponse:
    logger.info("Received optimization request for date=%s with %d orders and %d staff",
                request.date, len(request.orders), len(request.staff))
    response = solve_vrptw(request)
    logger.info("Finished optimization in %d ms: %d routes, %d unassigned orders",
                response.execution_time_ms, len(response.routes), len(response.unassigned_orders))
    return response


@router.get("/health")
def health_check():
    return {"status": "ok", "service": "python-solver"}
