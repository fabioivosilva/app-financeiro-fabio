import json
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/perfil", tags=["perfil"])

_BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_PATH = os.path.join(_BASE, "..", "data", "perfil.json")


class PerfilIn(BaseModel):
    nome: str
    ciclo_inicio: int = 27
    bancos: list[str] = []


class PerfilOut(PerfilIn):
    pass


@router.get("/", response_model=Optional[PerfilOut])
def get_perfil():
    path = os.path.abspath(_PATH)
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@router.post("/", response_model=PerfilOut)
def save_perfil(perfil: PerfilIn):
    path = os.path.abspath(_PATH)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(perfil.model_dump(), f, ensure_ascii=False, indent=2)
    return perfil
