---
name: app-financeiro-ui-reference
description: Follow the downloaded App Financeiro frontend reference exactly. Use before changing any frontend screen, component, layout, CSS, navigation, cards, modals, dashboard, imports, transactions, provisions, goals/metas, rules, settings, or visual behavior in this repo.
---

# App Financeiro UI Reference

## Source Of Truth

Use `C:\Users\fabio\Downloads\App-financeiro` as the visual and interaction source of truth for frontend work.

Primary files:

- `components/*.jsx`: screen structure, component hierarchy, labels, modal behavior, and state patterns.
- `styles.css`: exact classes, spacing, glass style, card layouts, hover states, modal layouts, and page-specific CSS.
- `data.jsx`: representative mock data, labels, icons, colors, helper names, and expected empty/data states.
- `App Financeiro.html`: route-to-screen mapping and script load order.

## Workflow

1. Before editing a frontend file, search the reference folder for the target screen or CSS classes.
2. Read only the relevant reference component and CSS block.
3. Port the reference structure into the repo's React/TypeScript components.
4. Connect to the real API and repo hooks without changing the intended UI shape.
5. Keep labels and page titles consistent with the reference unless the task explicitly changes product copy.
6. Add missing CSS classes to `frontend/src/index.css` by copying the reference intent closely.
7. Run `npm.cmd run build` from `frontend`.

## Screen Map

- Dashboard: `components/dashboard.jsx`
- Importar: `components/importar.jsx`
- Transacoes: `components/transacoes.jsx`
- Provisoes: `components/provisoes.jsx`
- Metas: `components/stubs.jsx`, functions `Metas` and `MetaDetailModal`
- Regras: `components/stubs.jsx`, function `Regras`
- Configuracoes: `components/config.jsx`
- Shell/sidebar/header: `components/shell.jsx`

## Guardrails

- Do not rely only on `obsidian-vault/07_UX_REFERENCE.md` when the downloaded reference exists.
- Do not replace reference-style screens with generic placeholders, landing sections, or unrelated component patterns.
- Preserve the repo's API client, routing, typed models, and existing shared components when they fit the reference.
- Avoid broad CSS rewrites. Add or adjust the smallest set of classes needed for the target screen.
