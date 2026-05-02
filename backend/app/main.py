from __future__ import annotations

import os
import sys

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .database import init_db
from .routers import dashboard, imports, transactions


init_db()

app = FastAPI(
    title="App Financeiro Fabio",
    description="API limpa do app financeiro, preservando o motor de parsers.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")


@api_router.get("/", tags=["status"])
def api_root():
    return {"status": "ok", "app": "App Financeiro Fabio", "version": "2.0.0"}


@api_router.get("/health", tags=["status"])
def health():
    return {"status": "ok"}


api_router.include_router(imports.router)
api_router.include_router(transactions.router)
api_router.include_router(dashboard.router)
app.include_router(api_router)


if hasattr(sys, "_MEIPASS"):
    frontend_dir = os.path.join(sys._MEIPASS, "frontend", "dist")
else:
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.isdir(frontend_dir):
    assets_dir = os.path.join(frontend_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            return {"detail": "Not Found"}
        file_path = os.path.join(frontend_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dir, "index.html"))
