# UX Reference — App Financeiro Fabio v2.0

## Design System: Etheris Finance

Gerado pelo Stitch em 2026-05-02.
Spec completo: `C:\Users\fabio\Downloads\stitch_preview\stitch_instant_finance_tracker\etheris_finance\DESIGN.md`

---

## Tokens de Cor (Tailwind)

```js
colors: {
  // Superfícies
  "background":               "#17111b",  // fundo geral
  "surface":                  "#17111b",
  "surface-dim":              "#17111b",
  "surface-container-lowest": "#110c16",
  "surface-container-low":    "#1f1923",
  "surface-container":        "#231d28",  // cards
  "surface-container-high":   "#2e2832",
  "surface-container-highest":"#39323d",
  "surface-bright":           "#3e3742",

  // Texto
  "on-surface":         "#ebdfed",  // texto principal
  "on-surface-variant": "#d0c2d7",  // texto secundário
  "outline":            "#998ca0",  // texto placeholder/label
  "outline-variant":    "#4d4354",  // bordas sutis

  // Primário (roxo)
  "primary":            "#e0b6ff",  // texto sobre roxo
  "primary-container":  "#820AD1",  // botões, destaques
  "on-primary":         "#4b007d",
  "on-primary-container":"#e4c0ff",
  "inverse-primary":    "#8a1dd9",

  // Erro / Sucesso / Warning
  "error":              "#ffb4ab",
  "error-container":    "#93000a",

  // Secundário (ciano — usar com parcimônia)
  "secondary":          "#e6feff",
  "secondary-container":"#00f4fe",
}
```

---

## Glassmorphism — Regras de Implementação

| Elemento | Regra |
|---|---|
| **Cards** | `backdrop-filter: blur(20px)` · bg rgba(255,255,255,0.03) · border 1px rgba(255,255,255,0.12) · border-radius 1rem |
| **Modais** | blur(20px) · bg rgba(255,255,255,0.08) · border 1px rgba(255,255,255,0.20) · border-radius 1.5rem |
| **Botão primary** | bg `#820AD1` · hover: `box-shadow: 0 0 15px #820AD1` |
| **Botão ghost** | glass border · backdrop blur · texto branco |
| **Input** | bg semi-transparente dark · active glow `#820AD1` |
| **Rows de tabela** | hover: opacidade de 3% → 6% |

---

## Tipografia — Inter

| Role | Tamanho | Peso |
|---|---|---|
| display-lg | 48px | 700 |
| headline-md | 24px | 600 |
| title-sm | 18px | 600 |
| body-base | 16px | 400 |
| body-sm | 14px | 400 |
| label-caps | 12px | 700, letter-spacing 0.05em |
| numeric-data | 16px | 500, tabular-nums |

---

## Protótipos HTML (referência por tela)

| Tela | Arquivo HTML |
|---|---|
| Dashboard | `stitch_instant_finance_tracker\dashboard_consolidado\code.html` |
| Importar | `stitch_instant_finance_tracker\importar_arquivos\code.html` |
| Transações | `stitch_instant_finance_tracker\transa_es_do_ciclo\code.html` |
| Provisões | `stitch_instant_finance_tracker\provis_es_e_futuro\code.html` |
| Configurações | *(não gerado — criar do zero seguindo este design system)* |
| Metas, Regras, Cartão | *(não gerados — adaptar páginas existentes)* |

**Caminho base:** `C:\Users\fabio\Downloads\stitch_preview\`

---

## Nota sobre o gráfico do Dashboard

O gráfico "Fluxo de Caixa Futuro" do protótipo Stitch tem problema de clareza
(barras mistas + linha sem legenda). **Não seguir o protótipo neste ponto.**

Implementar como barras agrupadas simples:
- Verde = Receita prevista
- Vermelho = Despesa prevista
- Roxo `#820AD1` = Saldo projetado

Gráfico deve ocupar pelo menos 50% da altura inferior do Dashboard.
