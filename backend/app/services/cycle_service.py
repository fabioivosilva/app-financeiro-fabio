from datetime import date
from sqlalchemy.orm import Session
from app.models import Settings

def get_cycle_dates(db: Session, month: int, year: int):
    """
    Retorna (start_date, end_date) para o ciclo solicitado.
    Ex: Ciclo de Maio/2026 (se start=27) -> 2026-04-27 até 2026-05-26.
    """
    settings = db.query(Settings).first()
    cycle_start_day = settings.cycle_start_day if settings else 27

    # O ciclo "Maio" termina no dia 26 de Maio e começou no dia 27 de Abril
    import calendar
    end_date = date(year, month, cycle_start_day - 1)
    
    # Calcular início
    start_month = month - 1
    start_year = year
    if start_month == 0:
        start_month = 12
        start_year -= 1
    
    # Ajustar dia se o mês anterior for menor (ex: dia 31 em fevereiro)
    last_day_prev = calendar.monthrange(start_year, start_month)[1]
    start_day = min(cycle_start_day, last_day_prev)
    
    start_date = date(start_year, start_month, start_day)
    
    return start_date, end_date

def get_current_cycle_dates(db: Session):
    """Retorna o ciclo que contém o dia de hoje."""
    hoje = date.today()
    settings = db.query(Settings).first()
    cycle_start_day = settings.cycle_start_day if settings else 27
    
    if hoje.day >= cycle_start_day:
        # Estamos no início de um ciclo que termina no mês que vem
        month = hoje.month + 1
        year = hoje.year
        if month > 12:
            month = 1
            year += 1
        return get_cycle_dates(db, month, year)
    else:
        # Estamos no ciclo que termina este mês
        return get_cycle_dates(db, hoje.month, hoje.year)
