"""
Date utilities for the Inventory system.

Functions
---------
calcular_edad_lote(fecha_entrada)
    Returns the number of days since a batch entered the system.

esta_vencido(fecha_vencimiento)
    Returns True if a batch/product has passed its expiry date.

dias_para_vencer(fecha_vencimiento)
    Returns the number of days until expiry (negative = already expired).

formatear_fecha(dt)
    Returns a date/datetime as "dd/mm/yyyy".

formatear_fecha_hora(dt)
    Returns a datetime as "dd/mm/yyyy HH:MM".

parsear_fecha(date_str)
    Parses a date string in "yyyy-mm-dd" or "dd/mm/yyyy" format.
"""

from datetime import date, datetime
from typing import Union


DateLike = Union[date, datetime, str]


def _to_date(value: DateLike) -> date:
    """Coerce a date, datetime, or ISO-string to a date object."""
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    # Try ISO format first, then dd/mm/yyyy
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f"):
        try:
            return datetime.strptime(value, fmt).date()
        except (ValueError, TypeError):
            pass
    raise ValueError(f"No se pudo parsear la fecha: '{value}'")


def calcular_edad_lote(fecha_entrada: DateLike) -> int:
    """
    Returns the number of days since the batch entered the system.

    >>> calcular_edad_lote("2026-01-01")  # 61 days from 2026-03-03
    61
    """
    return (date.today() - _to_date(fecha_entrada)).days


def esta_vencido(fecha_vencimiento: DateLike) -> bool:
    """
    Returns True if today is past the expiry date.

    >>> esta_vencido("2025-01-01")
    True
    """
    return date.today() > _to_date(fecha_vencimiento)


def dias_para_vencer(fecha_vencimiento: DateLike) -> int:
    """
    Returns the number of days until the expiry date.
    Negative values mean the batch is already expired.

    >>> dias_para_vencer("2027-01-01")  # > 0
    """
    return (_to_date(fecha_vencimiento) - date.today()).days


def formatear_fecha(dt: DateLike) -> str:
    """
    Returns a date formatted as 'dd/mm/yyyy'.

    >>> formatear_fecha("2026-03-03")
    '03/03/2026'
    """
    return _to_date(dt).strftime("%d/%m/%Y")


def formatear_fecha_hora(dt: Union[datetime, str]) -> str:
    """
    Returns a datetime formatted as 'dd/mm/yyyy HH:MM'.

    >>> formatear_fecha_hora("2026-03-03T14:30:00")
    '03/03/2026 14:30'
    """
    if isinstance(dt, str):
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%d %H:%M:%S"):
            try:
                dt = datetime.strptime(dt, fmt)
                break
            except ValueError:
                pass
    if isinstance(dt, datetime):
        return dt.strftime("%d/%m/%Y %H:%M")
    # Fallback: treat as date-only
    return formatear_fecha(dt)


def parsear_fecha(date_str: str) -> date:
    """
    Parse a date string in 'yyyy-mm-dd' or 'dd/mm/yyyy' format.

    >>> parsear_fecha("2026-03-03")
    datetime.date(2026, 3, 3)
    """
    return _to_date(date_str)
