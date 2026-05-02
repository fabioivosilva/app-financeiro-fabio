"""
FastAPI application — App Financeiro Fabio.
Local personal finance management.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
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
)

# Create tables
Base.metadata.create_all(bind=engine)

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

# Routers
app.include_router(dashboard.router)
app.include_router(imports.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(rules.router)
app.include_router(goals.router)
app.include_router(cards.router)
app.include_router(persons.router)


@app.get("/", tags=["status"])
def root():
    return {"status": "ok", "app": "App Financeiro Fabio", "version": "0.1.0"}
