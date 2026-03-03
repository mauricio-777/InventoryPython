"""
Currency utilities for the Inventory system.

Functions
---------
formatear_moneda(amount, moneda='S/')
    Returns a formatted currency string, e.g. "S/ 1,234.56".

redondear_precio(amount, decimales=2)
    Returns a float rounded to the given number of decimal places.

calcular_igv(subtotal, tasa=0.18)
    Returns the IGV (Peruvian VAT) amount for a given subtotal.

calcular_total_con_igv(subtotal, tasa=0.18)
    Returns (igv, total) tuple for a given subtotal.
"""

from decimal import ROUND_HALF_UP, Decimal
from typing import Union

Number = Union[int, float, Decimal]


def _to_decimal(value: Number) -> Decimal:
    return Decimal(str(value))


def formatear_moneda(amount: Number, moneda: str = "S/") -> str:
    """
    Format a numeric amount as a currency string.

    >>> formatear_moneda(1234.5)
    'S/ 1,234.50'
    >>> formatear_moneda(99.9, "USD")
    'USD 99.90'
    """
    d = _to_decimal(amount).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    # Format with thousands separator
    int_part, dec_part = f"{d:.2f}".split(".")
    int_formatted = f"{int(int_part):,}"
    return f"{moneda} {int_formatted}.{dec_part}"


def redondear_precio(amount: Number, decimales: int = 2) -> float:
    """
    Round a price to the specified number of decimal places using ROUND_HALF_UP.

    >>> redondear_precio(1.005, 2)
    1.01
    """
    exp = Decimal("0." + "0" * decimales) if decimales > 0 else Decimal("1")
    return float(_to_decimal(amount).quantize(exp, rounding=ROUND_HALF_UP))


def calcular_igv(subtotal: Number, tasa: float = 0.18) -> float:
    """
    Calculate Peruvian IGV for a given subtotal.

    >>> calcular_igv(100)
    18.0
    """
    return redondear_precio(_to_decimal(subtotal) * _to_decimal(tasa))


def calcular_total_con_igv(subtotal: Number, tasa: float = 0.18) -> tuple[float, float]:
    """
    Returns (igv_amount, total_with_igv) for a given subtotal.

    >>> calcular_total_con_igv(100)
    (18.0, 118.0)
    """
    igv = calcular_igv(subtotal, tasa)
    total = redondear_precio(_to_decimal(subtotal) + _to_decimal(igv))
    return igv, total
