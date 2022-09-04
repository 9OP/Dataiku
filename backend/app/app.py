from fastapi import FastAPI, APIRouter, Request, Depends, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.exceptions import HTTPException
from functools import lru_cache
from typing import Union
import os

from .database import Database, SqliteDB
from .models import MillenniumFalcon, Empire
from .lib import give_me_the_odds, format_plan, get_millenium_falcon_from_file

description = """Gives the odd to save the Galaxy"""
title = "Gives me the odd"
version = "0.1.0"

# ======================
# DEPENDENCIES
# ======================
database = SqliteDB()


def get_database() -> Database:
    return database


@lru_cache
def get_millennium_falcon() -> MillenniumFalcon:
    try:
        file_path = os.environ.get("MILLENNIUM_FALCON_PATH", "")
        return get_millenium_falcon_from_file(file_path)
    except:
        raise ServiceUnvailable(detail="Cannot read millenium falcon json file")


# ======================
# CONTROLLERS
# ======================
# GET list of routes
def endpoint_routes(req: Request, db: Database = Depends(get_database)):
    return db.get_routes()


# GET millenium falcon data
def endpoint_millennium_falcon(
    req: Request,
    millenium_falcon: MillenniumFalcon = Depends(get_millennium_falcon),
):
    return millenium_falcon


# POST empire data and get odds
def endpoint_odds(
    req: Request,
    empire: Empire,
    db: Database = Depends(get_database),
    millenium_falcon: MillenniumFalcon = Depends(get_millennium_falcon),
):
    routes = db.get_routes()

    odd, plan = give_me_the_odds(
        millennium_falcon=millenium_falcon,
        empire=empire,
        routes=routes,
    )

    formatted_plan = []
    if plan:
        formatted_plan = format_plan(plan, millenium_falcon.autonomy)

    return {"odd": odd, "plan": formatted_plan}


# ======================
# API
# ======================
api_router = APIRouter(prefix="/api")
api_router.add_api_route(
    methods=["GET"],
    path="/routes",
    endpoint=endpoint_routes,
)
api_router.add_api_route(
    methods=["GET"],
    path="/millennium_falcon",
    endpoint=endpoint_millennium_falcon,
)
api_router.add_api_route(
    methods=["POST"],
    path="/odds",
    endpoint=endpoint_odds,
)

# ======================
# API ERRORS
# ======================


class ServiceUnvailable(HTTPException):
    def __init__(self, name="Service unvailable", detail=None, **kwargs):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=detail,
            **kwargs,
        )
        self.name = name


def exception_handler(req: Request, exc: Union[HTTPException, Exception]):
    return JSONResponse(
        status_code=getattr(exc, "status_code", status.HTTP_500_INTERNAL_SERVER_ERROR),
        content={
            "name": getattr(exc, "name", None),
            "detail": getattr(exc, "detail", str(exc).replace("\n", " ")),
        },
    )


# ======================
# MIDDLEWARES
# ======================
def setup_middlewares(app: FastAPI) -> FastAPI:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods={"GET", "POST"},
        allow_headers={},
    )
    app.add_middleware(GZipMiddleware, minimum_size=1024)
    return app


def setup_exception_handlers(app):
    # Handles app, fastapi, starlette errors
    app.add_exception_handler(HTTPException, exception_handler)
    # Handles global errors
    app.add_exception_handler(Exception, exception_handler)


# ======================
# APP FACTORY
# ======================
def create_app() -> FastAPI:

    app = FastAPI(
        title=title,
        description=description,
        version=version,
    )
    setup_middlewares(app)
    setup_exception_handlers(app)

    app.include_router(api_router)

    @app.on_event("startup")
    async def startup():
        millennium_falcon = get_millennium_falcon()
        database.connect(millennium_falcon.routes_db)

    @app.on_event("shutdown")
    async def shutdown():
        database.disconnect()

    return app
