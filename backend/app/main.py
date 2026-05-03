from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import categories, persons, cards, transactions, rules, goals, dashboard, imports

app = FastAPI(title="App Financeiro API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em dev, permite tudo para evitar bloqueio de porta/hostname
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(persons.router)
app.include_router(cards.router)
app.include_router(transactions.router)
app.include_router(rules.router)
app.include_router(goals.router)
app.include_router(dashboard.router)
app.include_router(imports.router)


@app.on_event("startup")
def startup():
    init_db()
    from app.parsers import setup_registry
    setup_registry()


@app.get("/")
def root():
    return {"status": "ok", "version": "0.1.0"}
