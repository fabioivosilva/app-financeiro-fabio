# App Financeiro

Controle financeiro pessoal 100% local. Sem nuvem, sem assinatura — seus dados ficam no seu computador.

Desenvolvido por **Fabio, Thiago e Lucas** com suporte de IA (Claude Code).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite + TypeScript + TailwindCSS |
| Backend | FastAPI + SQLAlchemy |
| Banco | SQLite local (`data/finance.db`) |
| Charts | Recharts |

---

## Como rodar

```bash
# Clone o repositório
git clone https://github.com/fabioivosilva/app-financeiro-fabio.git
cd app-financeiro-fabio

# Instale dependências do backend
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Instale dependências do frontend
cd ../frontend
npm install

# Suba tudo de uma vez
cd ..
rodar.bat
```

Acesse em `http://localhost:5173`  
API disponível em `http://127.0.0.1:8000/docs`

---

## Funcionalidades

- **Dashboard** — saldo do ciclo, top gastos, alertas de limite, metas em destaque
- **Importação** — OFX, Excel, PDF e CSV (Itaú, Nubank, C6, Inter); deduplicação automática por hash
- **Transações** — categorização inline, regras automáticas por keyword, fluxo inbox de pendentes
- **Regras** — motor de categorização automática; re-aplicação em massa
- **Metas & Cofrinhos** — progresso por categoria, aportes manuais, histórico de aportes
- **Provisões** — despesas/receitas recorrentes, parcelas futuras, timeline de 6 meses
- **Configurações** — pessoas, cartões, categorias com subcategorias, bancos ativos, ciclo financeiro
- **Onboarding** — wizard de primeiro acesso (nome, dia do ciclo, bancos)

---

## Ciclo financeiro

O app trabalha com ciclos do **dia 27 ao dia 26** do mês seguinte (configurável no onboarding).

---

## Estrutura

```
app-financeiro-fabio/
├── backend/
│   ├── app/
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # FastAPI endpoints
│   │   ├── parsers/       # Parsers OFX / Excel / PDF / CSV
│   │   └── services/      # auto_provision, etc.
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/         # Dashboard, Transacoes, Metas, Provisoes...
│       ├── components/    # UI primitives + layout
│       ├── hooks/         # useTransacoes, useMetas, useProvisoes...
│       └── api/           # client tipado
├── data/                  # finance.db (local, não versionar)
├── NORTE.md               # Roadmap e backlog vivo
└── rodar.bat              # Sobe backend + frontend
```

---

## Banco de dados

O arquivo `data/finance.db` é local e **não versionado**. Para popular com dados de exemplo:

```bash
cd backend
.venv\Scripts\python.exe app/seed.py
```

---

## Contribuindo

1. Trabalhe sempre na branch `develop`
2. Leia o `NORTE.md` antes de iniciar qualquer tarefa
3. Marque claim no item antes de começar
4. Ao fechar: remova do `NORTE.md`, registre no `CHANGELOG.md`, commit + push
