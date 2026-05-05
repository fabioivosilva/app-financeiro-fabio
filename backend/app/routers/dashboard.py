from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
from app.database import get_db
from app.models import Transaction, Provision, Category
from app.services.cycle_service import get_cycle_dates

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_summary(
    month: int = Query(...),
    year: int = Query(...),
    db: Session = Depends(get_db),
):
    """
    Retorna o resumo consolidado do ciclo solicitado.
    Fonte única de verdade para o Dashboard.
    """
    start, end = get_cycle_dates(db, month, year)
    
    # 1. Transações do Ciclo
    transactions = db.query(Transaction).filter(
        Transaction.date >= start,
        Transaction.date <= end,
    ).all()
    
    # Realizado de Caixa (Exclui Crédito e Categorias Internas)
    realized_income = sum(t.amount for t in transactions if t.amount > 0 and not (t.category and t.category.exclude_totals))
    realized_expense = sum(t.amount for t in transactions if t.amount < 0 and t.origin != "Crédito" and not (t.category and t.category.exclude_totals))
    
    # Consumo de Cartão (Apenas Crédito)
    card_consumption = sum(abs(t.amount) for t in transactions if t.origin == "Crédito" and not (t.category and t.category.exclude_totals))
    
    # 2. Provisões do Ciclo
    all_active_provisions = db.query(Provision).filter(Provision.active == True).all()
    fulfilled_provision_ids = {t.provision_id for t in transactions if t.provision_id}
    
    predicted_income_remaining = 0
    predicted_expense_remaining = 0
    pending_provisions_count = 0
    
    for p in all_active_provisions:
        if p.id in fulfilled_provision_ids:
            continue
            
        is_in_cycle = False
        if p.type == "mensal":
            is_in_cycle = True
        elif p.type == "parcela":
            if p.month == month and p.year == year:
                is_in_cycle = True
        
        if is_in_cycle:
            pending_provisions_count += 1
            if p.amount > 0:
                predicted_income_remaining += p.amount
            else:
                predicted_expense_remaining += abs(p.amount)
    
    # 3. Saldo Projetado
    projected_balance = (realized_income + realized_expense) + predicted_income_remaining - predicted_expense_remaining

    # 4. Métricas Adicionais para UI
    pending_tx_count = len([t for t in transactions if t.status == "pendente" or not t.category_id])

    # 5. Gastos por Categoria
    category_expenses = {}
    for t in transactions:
        if t.amount < 0 and t.category_id and not (t.category and t.category.exclude_totals):
            cid = t.category_id
            category_expenses[cid] = category_expenses.get(cid, 0) + abs(t.amount)
    
    cats = db.query(Category).filter(Category.id.in_(category_expenses.keys())).all()
    gastos_por_cat = [
        {
            "id": c.id,
            "label": c.name,
            "valor": round(category_expenses[c.id], 2),
            "color": c.color,
            "icon": c.icon,
            "limit": c.limit_value
        }
        for c in cats
    ]
    gastos_por_cat.sort(key=lambda x: x["valor"], reverse=True)

    # 6. Top Gastos
    top_gastos = sorted(
        [t for t in transactions if t.amount < 0 and not (t.category and t.category.exclude_totals)],
        key=lambda x: x.amount
    )[:5]
    top_gastos_data = [
        {
            "id": t.id,
            "description": t.description,
            "amount": round(t.amount, 2),
            "date": t.date.isoformat(),
            "category_name": t.category.name if t.category else "Sem categoria",
            "category_color": t.category.color if t.category else "#888888",
            "category_icon": t.category.icon if t.category else "label",
        }
        for t in top_gastos
    ]

    return {
        "cycle": {
            "start": start.isoformat(),
            "end": end.isoformat(),
            "month_label": f"{month:02d}/{year}"
        },
        "metrics": {
            "realized_income": round(realized_income, 2),
            "realized_expense": round(abs(realized_expense), 2),
            "card_consumption": round(card_consumption, 2),
            "predicted_income_remaining": round(predicted_income_remaining, 2),
            "predicted_expense_remaining": round(predicted_expense_remaining, 2),
            "projected_balance": round(projected_balance, 2),
            "actual_balance": round(realized_income + realized_expense, 2),
        },
        "counts": {
            "pending_transactions": pending_tx_count,
            "pending_provisions": pending_provisions_count,
            "total_transactions": len(transactions)
        },
        "gastos_por_cat": gastos_por_cat,
        "top_gastos": top_gastos_data
    }
