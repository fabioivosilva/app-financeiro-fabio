# AI SESSION STATE — FINANCE APP FABIO

Este arquivo serve como o "cérebro" compartilhado entre diferentes instâncias de IA.
**Última Atualização:** 2026-05-02 (Sessão de Metas e Dashboard)

## 🎯 O Que Foi Implementado
1. **Multi-Metas & Cofrinho:**
   - Backend: Coluna `goal_id` em `categories`. CRUD de Goals agora soma `current_amount` + transações vinculadas.
   - Frontend: `GoalsPage.tsx` refatorada para cards. Modal de categoria com vínculo de meta.
2. **Dashboard de Performance:**
   - Comparativo mensal com badges de variação (+/- %) e setas.
   - Listagem de metas (stack) substituindo o card único de reserva.
3. **Navegação Temporal:**
   - Componente `MonthSelector` em todas as abas principais.
4. **Configurações de Sistema:**
   - Cadastro de "Pasta de Importação" persistido no banco.
   - Botão de "Reset de Sistema" (Danger Zone) para limpar transações.

## 📋 Backlog Prioritário (Próximos Passos)
- [ ] **Previsão de Gastos Futuros:** Implementar lógica no Dashboard para mostrar o total comprometido em meses futuros (parcelas).
- [ ] **Importação Assistida:** Usar a "Pasta de Importação" para listar arquivos novos e importar com 1 clique.
- [ ] **Segurança:** Avaliar criptografia do banco SQLite local.
- [ ] **Inteligência:** Aba de insights para sugerir onde economizar baseado em limites.

## 📂 Estrutura do Projeto
- `backend/`: FastAPI + SQLAlchemy (SQLite).
- `frontend/`: React + Vite + Tailwind/Shadcn (Estilo Stitch Premium).
- `ControleFinanceiro/`: Pasta do build executável (Windows).

## 💡 Instruções para a próxima IA
- Leia o arquivo `docs/AI_SESSION_STATE.md` e o `05_PENDENCIAS.md` (se disponível no Obsidian local).
- Sempre reconstrua o executável usando `build_desktop.bat` após mudanças visuais ou lógicas.
- Mantenha o estilo visual "Premium/Moderno" (dark mode, glassmorphism, micro-animações).
- **Trabalhando agora:** Implementando o **Fluxo de Aporte em Meta (Cofrinho)**. O objetivo é que transações do extrato categorizadas como "Reserva" alimentem automaticamente o saldo das metas vinculadas.
