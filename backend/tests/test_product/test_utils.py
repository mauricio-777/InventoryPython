"""
Unit tests — CommonLayer utilities.
Covers: date_utils, currency_utils, sku_generator, common_validators.

Run with:
    cd backend
    python -m pytest tests/Product/ -v
"""

from datetime import date, timedelta

# ─── date_utils ─────────────────────────────────────────────────────────────

from CommonLayer.utils.date_utils import (
    calcular_edad_lote,
    esta_vencido,
    dias_para_vencer,
    formatear_fecha,
    formatear_fecha_hora,
    parsear_fecha,
)


def test_calcular_edad_lote_today():
    """A batch entered today should have age 0."""
    assert calcular_edad_lote(date.today()) == 0


def test_calcular_edad_lote_past():
    """A batch entered 10 days ago should have age 10."""
    past = date.today() - timedelta(days=10)
    assert calcular_edad_lote(past) == 10


def test_esta_vencido_past():
    expired = date.today() - timedelta(days=1)
    assert esta_vencido(expired) is True


def test_esta_vencido_future():
    future = date.today() + timedelta(days=10)
    assert esta_vencido(future) is False


def test_dias_para_vencer_future():
    future = date.today() + timedelta(days=5)
    assert dias_para_vencer(future) == 5


def test_dias_para_vencer_past():
    past = date.today() - timedelta(days=3)
    assert dias_para_vencer(past) == -3


def test_formatear_fecha():
    assert formatear_fecha("2026-03-03") == "03/03/2026"


def test_parsear_fecha_iso():
    d = parsear_fecha("2026-03-03")
    assert d == date(2026, 3, 3)


def test_parsear_fecha_slash():
    d = parsear_fecha("03/03/2026")
    assert d == date(2026, 3, 3)


# ─── currency_utils ─────────────────────────────────────────────────────────

from CommonLayer.utils.currency_utils import (
    formatear_moneda,
    redondear_precio,
    calcular_igv,
    calcular_total_con_igv,
)


def test_formatear_moneda_default():
    result = formatear_moneda(1234.5)
    assert result == "S/ 1,234.50"


def test_formatear_moneda_custom_currency():
    result = formatear_moneda(99.9, "USD")
    assert result == "USD 99.90"


def test_redondear_precio_half_up():
    assert redondear_precio(1.005, 2) == 1.01


def test_calcular_igv():
    assert calcular_igv(100) == 18.0


def test_calcular_total_con_igv():
    igv, total = calcular_total_con_igv(100)
    assert igv == 18.0
    assert total == 118.0


# ─── sku_generator ──────────────────────────────────────────────────────────

from CommonLayer.utils.sku_generator import generate_sku


def test_generate_sku_format():
    sku = generate_sku("Electronics", "Laptop")
    parts = sku.split("-")
    assert len(parts) == 3
    assert parts[0] == "ELE"
    assert parts[1] == "LAP"
    assert len(parts[2]) == 6


def test_generate_sku_unique():
    sku1 = generate_sku("Muebles", "Silla")
    sku2 = generate_sku("Muebles", "Silla")
    assert sku1 != sku2


# ─── common_validators ──────────────────────────────────────────────────────

import pytest
from CommonLayer.schemas.common_validators import (
    validate_email,
    validate_ruc,
    validate_dni,
    validate_positive_number,
    validate_non_negative_number,
    validate_numeric_range,
    validate_not_empty,
    validate_max_length,
)


def test_validate_email_valid():
    assert validate_email("user@example.com") == "user@example.com"


def test_validate_email_invalid():
    with pytest.raises(ValueError):
        validate_email("not-an-email")


def test_validate_ruc_valid():
    assert validate_ruc("12345678901") == "12345678901"


def test_validate_ruc_too_short():
    with pytest.raises(ValueError):
        validate_ruc("1234567890")


def test_validate_dni_valid():
    assert validate_dni("12345678") == "12345678"


def test_validate_positive_number_valid():
    assert validate_positive_number(5) == 5


def test_validate_positive_number_zero():
    with pytest.raises(ValueError):
        validate_positive_number(0)


def test_validate_non_negative_zero():
    assert validate_non_negative_number(0) == 0


def test_validate_numeric_range_in_range():
    assert validate_numeric_range(5, 1, 10) == 5


def test_validate_numeric_range_out_of_range():
    with pytest.raises(ValueError):
        validate_numeric_range(11, 1, 10)


def test_validate_not_empty_valid():
    assert validate_not_empty("  hello  ") == "hello"


def test_validate_not_empty_blank():
    with pytest.raises(ValueError):
        validate_not_empty("   ")


def test_validate_max_length_within():
    assert validate_max_length("abc", 5) == "abc"


def test_validate_max_length_exceeded():
    with pytest.raises(ValueError):
        validate_max_length("toolongstring", 5)
