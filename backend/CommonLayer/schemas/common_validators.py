"""
Common validators for use with Pydantic schemas or standalone.

Each function raises ValueError on invalid input (compatible with Pydantic's
@validator / @field_validator), or can be called directly and will return
True on success / raise ValueError on failure.

Examples
--------
>>> validate_email("user@example.com")   # True
>>> validate_ruc("12345678901")          # True
>>> validate_positive_number(-5)         # raises ValueError
"""

import re
from datetime import date, datetime
from typing import Union


# ─── Email ─────────────────────────────────────────────────────────────────

_EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")


def validate_email(value: str) -> str:
    """Validate e-mail format. Returns the value on success."""
    if not value or not _EMAIL_RE.match(value.strip()):
        raise ValueError(f"El correo electrónico '{value}' no tiene un formato válido.")
    return value.strip().lower()


# ─── RUC (Peru 11 digits) ──────────────────────────────────────────────────

_RUC_RE = re.compile(r"^\d{11}$")


def validate_ruc(value: str) -> str:
    """Validate Peruvian RUC (11 numeric digits). Returns the value on success."""
    v = str(value).strip()
    if not _RUC_RE.match(v):
        raise ValueError(f"El RUC '{value}' debe tener exactamente 11 dígitos numéricos.")
    return v


# ─── DNI (Peru 8 digits) ──────────────────────────────────────────────────

_DNI_RE = re.compile(r"^\d{8}$")


def validate_dni(value: str) -> str:
    """Validate Peruvian DNI (8 numeric digits). Returns the value on success."""
    v = str(value).strip()
    if not _DNI_RE.match(v):
        raise ValueError(f"El DNI '{value}' debe tener exactamente 8 dígitos numéricos.")
    return v


# ─── Numeric ranges ────────────────────────────────────────────────────────

def validate_positive_number(value: Union[int, float], field_name: str = "El valor") -> Union[int, float]:
    """Validate that value is strictly positive (> 0)."""
    if value is None or value <= 0:
        raise ValueError(f"{field_name} debe ser un número positivo mayor a cero.")
    return value


def validate_non_negative_number(value: Union[int, float], field_name: str = "El valor") -> Union[int, float]:
    """Validate that value is non-negative (>= 0)."""
    if value is None or value < 0:
        raise ValueError(f"{field_name} debe ser igual o mayor a cero.")
    return value


def validate_numeric_range(
    value: Union[int, float],
    min_val: Union[int, float],
    max_val: Union[int, float],
    field_name: str = "El valor",
) -> Union[int, float]:
    """Validate that min_val <= value <= max_val."""
    if value is None or not (min_val <= value <= max_val):
        raise ValueError(f"{field_name} debe estar entre {min_val} y {max_val}.")
    return value


# ─── Dates ────────────────────────────────────────────────────────────────

def validate_date_range(
    start: Union[date, datetime],
    end: Union[date, datetime],
    field_name: str = "El rango de fechas",
) -> bool:
    """Validate that start <= end."""
    if start > end:
        raise ValueError(f"{field_name}: la fecha de inicio debe ser anterior o igual a la de fin.")
    return True


def validate_not_future(value: Union[date, datetime], field_name: str = "La fecha") -> Union[date, datetime]:
    """Validate that the date is not in the future."""
    today = datetime.now().date() if isinstance(value, datetime) else date.today()
    check = value.date() if isinstance(value, datetime) else value
    if check > today:
        raise ValueError(f"{field_name} no puede ser una fecha futura.")
    return value


# ─── Strings ──────────────────────────────────────────────────────────────

def validate_not_empty(value: str, field_name: str = "El campo") -> str:
    """Validate that string is not None or blank."""
    if not value or not value.strip():
        raise ValueError(f"{field_name} no puede estar vacío.")
    return value.strip()


def validate_max_length(value: str, max_len: int, field_name: str = "El campo") -> str:
    """Validate that string does not exceed max_len characters."""
    if value and len(value) > max_len:
        raise ValueError(f"{field_name} no puede superar los {max_len} caracteres.")
    return value
