"""
Standard response schemas for the Inventory API.

All controllers should wrap their return values using the helpers below
so that the API surface remains consistent:

    from CommonLayer.schemas.base_response import ok, error

    # Success
    return jsonify(ok({"id": 1, "name": "Chair"})), 200

    # Error (usually handled by exception_handler.py, but available here too)
    return jsonify(error("Producto no encontrado", 404)), 404

Pydantic models are also exported for documentation purposes and future
FastAPI migration compatibility.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


# ─── Pydantic models (for documentation / OpenAPI schema) ─────────────────

class SuccessResponse(BaseModel, Generic[T]):
    """
    Generic success envelope.

    Example JSON::

        {
            "status": "success",
            "data": { "id": 1, "name": "Silla de madera" },
            "timestamp": "2026-03-03T00:00:00Z"
        }
    """

    status: str = Field(default="success", examples=["success"])
    data: Optional[T] = Field(default=None, description="Payload de la respuesta.")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="Marca de tiempo ISO 8601 (UTC).",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "status": "success",
                    "data": {"id": 1, "name": "Producto de ejemplo"},
                    "timestamp": "2026-03-03T00:00:00+00:00",
                }
            ]
        }
    }


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Paginated success envelope.

    Example JSON::

        {
            "status": "success",
            "data": [...],
            "pagination": { "page": 1, "page_size": 20, "total": 150, "total_pages": 8 }
        }
    """

    status: str = Field(default="success")
    data: list[T] = Field(default_factory=list)
    pagination: dict[str, Any] = Field(
        default_factory=dict,
        description="Metadatos de paginación: page, page_size, total, total_pages.",
        examples=[{"page": 1, "page_size": 20, "total": 150, "total_pages": 8}],
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class ErrorResponse(BaseModel):
    """
    Standard error envelope.

    Example JSON::

        {
            "status": "error",
            "code": 404,
            "error": "Not Found",
            "message": "El recurso solicitado no existe."
        }
    """

    status: str = Field(default="error")
    code: int = Field(examples=[404])
    error: str = Field(examples=["Not Found"])
    message: str = Field(examples=["El recurso solicitado no existe."])

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "status": "error",
                    "code": 404,
                    "error": "Not Found",
                    "message": "El recurso solicitado no existe.",
                }
            ]
        }
    }


# ─── Plain-dict helpers (for use with Flask's jsonify) ────────────────────

def ok(data: Any = None) -> dict:
    """
    Build a success response dict.

    Usage::

        return jsonify(ok(product_data)), 200
    """
    return {
        "status": "success",
        "data": data,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def ok_paginated(data: list, page: int, page_size: int, total: int) -> dict:
    """
    Build a paginated success response dict.

    Usage::

        return jsonify(ok_paginated(items, page=1, page_size=20, total=150)), 200
    """
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 1
    return {
        "status": "success",
        "data": data,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def error(message: str, code: int = 400, error_type: str = "Error") -> dict:
    """
    Build an error response dict.

    Usage::

        return jsonify(error("Producto no encontrado", 404, "Not Found")), 404
    """
    return {
        "status": "error",
        "code": code,
        "error": error_type,
        "message": message,
    }
