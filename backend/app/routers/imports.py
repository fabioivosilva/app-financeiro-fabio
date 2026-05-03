from fastapi import APIRouter

router = APIRouter(prefix="/imports", tags=["imports"])


@router.post("/upload")
def upload_file():
    # Placeholder — implementado em T1.1 (Parser Engine)
    return {"message": "Parser engine não implementado ainda (T1.1)"}
