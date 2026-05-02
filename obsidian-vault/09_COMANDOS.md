# 09_COMANDOS

O repo foi zerado. Estes comandos passam a valer depois que `R0 - Scaffolding minimo` for concluido.

## Inicio

```powershell
git checkout develop
git pull origin develop
```

## Frontend futuro

```powershell
cd frontend
npm install
npm run build
```

## Backend futuro

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m py_compile app\main.py
```

## Desktop futuro

```powershell
.\build_desktop.bat
```

## Agora

Antes do R0, nao ha codigo para buildar. Use apenas o vault para planejar.
