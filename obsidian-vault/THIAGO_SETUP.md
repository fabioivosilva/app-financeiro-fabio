# Setup do Projeto — Thiago

> Guia completo para o Thiago configurar o ambiente e trabalhar em sincronia com Fabio.

---

## 1. Pré-requisitos

Instalar na máquina Windows:
- [Git](https://git-scm.com/download/win)
- [Python 3.12](https://www.python.org/downloads/) — marcar "Add to PATH"
- [Node.js 20+](https://nodejs.org/en)
- [VS Code](https://code.visualstudio.com/) (recomendado) com extensões: Python, ESLint, Tailwind CSS IntelliSense

---

## 2. Clonar o Repositório

```bash
# Escolher uma pasta (ex: C:\Users\thiago\Projects)
cd C:\Users\thiago\Projects
git clone https://github.com/fabioivosilva/app-financeiro-fabio.git
cd app-financeiro-fabio
git checkout develop
```

---

## 3. Configurar o Backend (Python)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

---

## 4. Configurar o Frontend (Node)

```bash
cd frontend
npm install
```

---

## 5. Rodar em Modo Desenvolvimento

**Terminal 1 — Backend:**
```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Abrir `http://localhost:5173` no navegador.

---

## 6. Gerar o Executável Windows

Após qualquer mudança que queira testar como app desktop:
```bash
# Na raiz do projeto
build_desktop.bat
```

Aguardar o build e abrir `ControleFinanceiro.exe` na raiz (não o de `backend\dist`).

---

## 7. Banco de Dados Local

O banco SQLite (`data\finance.db`) **não é sincronizado pelo Git** — cada desenvolvedor tem o seu.
Para ter os mesmos dados que o Fabio:
- Pedir ao Fabio para exportar/copiar o `data\finance.db`
- Ou importar seus próprios extratos OFX/PDF/Excel via app

As **regras de categorização** (o que importa para sincronismo) ficam em `backend/app/seed.py` e são versionadas.

---

## 8. Prompt Padrão para Claude.ai

Cole este prompt no início de CADA sessão de desenvolvimento com a IA:

```
Estou iniciando uma sessão de desenvolvimento no projeto App Financeiro Fabio
(Repo: https://github.com/fabioivosilva/app-financeiro-fabio.git)

Token de acesso: [PEDIR O TOKEN PARA O FABIO]

Este projeto é um app financeiro desktop (Windows) desenvolvido em dupla com Fabio.
Stack: FastAPI + SQLite (backend) · React/Vite/TailwindCSS (frontend) · PyWebView/PyInstaller (desktop)

Protocolo de início obrigatório:
1. Clone/atualize o repositório na branch `develop`
2. Leia `obsidian-vault/10_CHECKPOINT_ATUAL.md` (estado atual + próxima tarefa)
3. Leia `obsidian-vault/05_PENDENCIAS.md` (backlog)
4. Me apresente o estado atual e sugira a próxima tarefa

Protocolo de fechamento obrigatório (ao concluir qualquer item):
1. Marcar [x] em `obsidian-vault/05_PENDENCIAS.md`
2. Atualizar `obsidian-vault/10_CHECKPOINT_ATUAL.md`
3. Fazer commit descritivo na branch `develop`
4. Me pedir para rodar `build_desktop.bat`
5. Fazer push: `git push origin develop`

Regras:
- Sempre branch `develop`, nunca `main`
- Design System: dark mode, glassmorphism, cor principal `#820AD1`
- Regras de categorização ficam em `backend/app/seed.py`
- Após qualquer mudança visual/lógica, rebuildar o .exe

Agora faça o protocolo de início e me diga o estado do projeto.
```

---

## 9. Dinâmica de Trabalho em Dupla

### Sincronismo do Código
- Fabio e Thiago trabalham na mesma branch `develop`
- Antes de começar: `git pull origin develop`
- Após terminar: `git push origin develop`
- Comunicar via WhatsApp quando fizer push para o outro dar pull

### Sincronismo do Banco
- Cada um tem seu `data/finance.db` local (não sobe para o Git)
- As **regras** ficam em `seed.py` — versionado e sincronizado automaticamente
- Se quiser ter os mesmos dados, combinar para trocar o arquivo `.db`

### Divisão de Tarefas
- Ver `obsidian-vault/05_PENDENCIAS.md` para escolher um item do backlog
- Avisar ao Fabio qual item está pegando para não ter conflito
- Fechar o item seguindo o Protocolo de Fechamento (seção acima)

### Sincronismo do Vault (Obsidian)
- O vault está **dentro do repo** (`obsidian-vault/`)
- Qualquer atualização feita pela IA é commitada junto com o código
- Thiago verá as atualizações automaticamente ao dar `git pull`

---

## 10. Troubleshooting Comum

| Problema | Solução |
|---|---|
| `ControleFinanceiro.exe` não abre / trava | Fechar qualquer instância antiga e reabrir |
| Porta 8000 em uso ao rodar dev | Matar o processo: `taskkill /f /im python.exe` |
| `pip install` falha | Confirmar que `.venv` está ativado |
| Frontend não carrega | Conferir se backend está rodando na porta 8000 |
| Build falha com "arquivo em uso" | Fechar o `.exe` antes de rodar `build_desktop.bat` |
| Banco vazio após clone | Normal — importar extratos ou copiar `data\finance.db` do Fabio |

---

*Última atualização: 2026-05-02 — Claude (claude.ai)*
