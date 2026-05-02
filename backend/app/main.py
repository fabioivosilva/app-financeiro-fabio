"""
FastAPI application — App Financeiro Fabio.
Local personal finance management.
"""
import os
import sys
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import engine, Base, SessionLocal, ensure_database_schema
from .seed import seed_database
from .routers import (
    dashboard,
    imports,
    transactions,
    categories,
    rules,
    goals,
    cards,
    persons,
    settings,
)

# Create tables
Base.metadata.create_all(bind=engine)
ensure_database_schema()

# Seed initial data
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

# App
app = FastAPI(
    title="App Financeiro Fabio",
    description="Controle financeiro pessoal local",
    version="0.1.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router
api_router = APIRouter(prefix="/api")

api_router.include_router(dashboard.router)
api_router.include_router(imports.router)
api_router.include_router(transactions.router)
api_router.include_router(categories.router)
api_router.include_router(rules.router)
api_router.include_router(goals.router)
api_router.include_router(cards.router)
api_router.include_router(persons.router)
api_router.include_router(settings.router)

@api_router.get("/", tags=["status"])
def root():
    return {"status": "ok", "app": "App Financeiro Fabio", "version": "0.1.0"}

app.include_router(api_router)

# --- Serve Frontend Static Files ---
# Resolve the frontend dist path (works for local dev and PyInstaller bundle)
if hasattr(sys, '_MEIPASS'):
    # PyInstaller extracts to a temp folder _MEIPASS
    frontend_dir = os.path.join(sys._MEIPASS, 'frontend', 'dist')
else:
    # Running locally
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist'))

if os.path.isdir(frontend_dir):
    # Mount assets so standard HTML tags (<script src="/assets/...">) work
    assets_dir = os.path.join(frontend_dir, 'assets')
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Catch-all for SPA routing (React Router)
    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        # Prevent accessing paths that should be 404s in the API
        if full_path.startswith("api/"):
            return {"detail": "Not Found"}
            
        file_path = os.path.join(frontend_dir, full_path)
        # If the file exists and is a file, serve it directly (e.g. favicon.ico, images)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise, fall back to index.html for React Router
        return FileResponse(os.path.join(frontend_dir, 'index.html'))
else:
    print(f"Warning: Frontend dist directory not found at {frontend_dir}. Run 'npm run build' in frontend folder.")
