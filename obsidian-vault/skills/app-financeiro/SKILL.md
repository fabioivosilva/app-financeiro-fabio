---
name: app-financeiro
description: Startup, UI reference, backlog/roadmap, and task closing workflow for the App Financeiro Fabio project. Use whenever Codex works in this repository, when the user mentions app financeiro, Fabio finance project, NORTE.md, backlog, Obsidian project memory, frontend screens, visual reference, parsers/importacao, claims, commits, or closing roadmap items.
---

# App Financeiro

Use this as the single project skill. Do not combine it with older split skills.

## Startup

1. Work on `develop`.
2. Pull the latest `origin/develop` when network/git access is available.
3. Read only the `SNAPSHOT` block at the top of `NORTE.md`.
4. Stop after learning:
   - active claims,
   - next task,
   - suggested session size.
5. Read deeper in `NORTE.md` only after the user confirms the task or the implementation needs item detail.

Prefer `NORTE.md` as the current roadmap/backlog source. Use Obsidian notes only for focused detail:

- UI summary: `obsidian-vault/07_UX_REFERENCE.md`
- Parsers: `obsidian-vault/08_PARSERS.md`
- Thiago onboarding: `obsidian-vault/THIAGO_SETUP.md` when present

## Frontend Rule

Before editing any frontend screen, component, CSS, modal, popover, navigation, card, dashboard, import, transaction, provision, goal/meta, rule, or settings UI:

1. Open `C:\Users\fabio\Downloads\App-financeiro`.
2. Read the exact reference component and CSS block.
3. Port the reference structure into the repo's React/TypeScript code:
   - same wrapper classes,
   - same element order,
   - same labels,
   - same modal/popover/grid behavior,
   - same visual hierarchy.
4. Connect real API/state after the visual structure matches.
5. Copy missing reference CSS classes into `frontend/src/index.css`.
6. Run `npm.cmd run build` from `frontend`.

Reference screen map:

- Dashboard: `components/dashboard.jsx`
- Importar: `components/importar.jsx`
- Transacoes: `components/transacoes.jsx`
- Provisoes: `components/provisoes.jsx`
- Metas: `components/stubs.jsx`, functions `Metas` and `MetaDetailModal`
- Regras: `components/stubs.jsx`, function `Regras`
- Configuracoes: `components/config.jsx`
- Shell/sidebar/header: `components/shell.jsx`

The downloaded reference wins over "close enough" layouts.

## Backend And Parsers

For parser/import work, read `obsidian-vault/08_PARSERS.md` and the relevant files under `backend/app/parsers/`.

Do not mark parser work done only because parsing succeeds. Confirm the import flow reaches transactions or document the exact blocker in `NORTE.md`.

## Closing A Task

When completing any `NORTE.md` roadmap/backlog item:

1. Validate with relevant checks:
   - frontend: `npm.cmd run build` in `frontend`,
   - backend: `backend\.venv\Scripts\python.exe -m py_compile <files>` and relevant tests when available,
   - desktop build only if the current repo still has `build_desktop.bat` and the task requires it.
2. Update `NORTE.md`:
   - remove the item entirely from the roadmap section (do NOT leave it as `[x]`),
   - remove its claim,
   - refresh `SNAPSHOT` status, next task, and claims.
3. Append the closed item to `obsidian-vault/CHANGELOG.md` with date and short outcome.
   This keeps NORTE.md token-cheap for every future session.
4. Keep memory compact. Prefer `NORTE.md` for the new workflow; add Obsidian handoff only when it helps the next session.
5. Check `git status --short`.
6. Do not commit `.pyc`, local databases, generated exe/build artifacts, private imports, or debug files.
7. Commit the task scope intentionally.
8. Push only when authorized.

Never declare a roadmap item complete without updating `NORTE.md`.
