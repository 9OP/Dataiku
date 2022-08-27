from fastapi import FastAPI, APIRouter, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from functools import lru_cache
import json
import os

from database import Database, SqliteDB
from models import MillenniumFalcon, Empire
from lib import give_me_the_odds, format_plan

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
    file_path = os.environ.get("MILLENNIUM_FALCON_PATH", "")
    if not os.path.isfile(file_path):
        raise ValueError(f"{file_path} not found!")

    with open(file_path, "r") as file:
        millennium_falcon_data = json.loads(file.read())

    routes_db_dir = os.path.split("/")[:-1]
    routes_db_path = os.path.join(
        *routes_db_dir, millennium_falcon_data.get("routes_db", "")
    )
    millennium_falcon_data["routes_db"] = routes_db_path
    millennium_falcon = MillenniumFalcon.parse_obj(millennium_falcon_data)

    return millennium_falcon


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
    return {"odd": odd, plan: formatted_plan}


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
# MIDDLEWARES
# ======================
def setup_middlewares(app: FastAPI) -> FastAPI:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:8080"],
        allow_credentials=False,
        allow_methods={},
        allow_headers={},
    )
    app.add_middleware(GZipMiddleware, minimum_size=1024)
    return app


# ======================
# UTILS
# ======================
def serve_react_app(app: FastAPI, build_dir: str = "../build"):
    build_path = os.path.join(os.path.dirname(__file__), build_dir)
    static_path = os.path.join(build_path, "static")

    app.mount(
        "/static",
        StaticFiles(directory=static_path),
        name="React App static files",
    )
    templates = Jinja2Templates(directory=build_path)

    @app.get("/{full_path:path}")
    def frontend_build(request: Request, full_path: str):
        return templates.TemplateResponse("index.html", {"request": request})


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

    app.include_router(api_router)
    serve_react_app(app)

    @app.on_event("startup")
    async def startup():
        routes_db = get_millennium_falcon().routes_db
        database.connect(routes_db)

    @app.on_event("shutdown")
    async def shutdown():
        database.disconnect()

    return app
