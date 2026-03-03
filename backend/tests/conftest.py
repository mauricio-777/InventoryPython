"""
Shared pytest fixtures for all test modules.

Fixtures
--------
app
    Flask application configured for testing (in-memory SQLite).

client
    Flask test client (use this for HTTP-level integration tests).

db_session
    SQLAlchemy session bound to the in-memory test database.

Usage
-----
    def test_something(client):
        response = client.get("/api/health")
        assert response.status_code == 200
"""

import sys
import os

# ── Path setup ───────────────────────────────────────────────────────────────
# tests/ lives inside backend/, so __file__ → tests/conftest.py
# We need backend/ on sys.path AND as the current working directory
# so that all relative imports in main.py and the app modules work.

_tests_dir = os.path.dirname(os.path.abspath(__file__))          # .../backend/tests
_backend_dir = os.path.dirname(_tests_dir)                        # .../backend

if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# Change CWD to backend so SQLite path ("./inventory.db") and all imports work
os.chdir(_backend_dir)

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("TESTING", "1")

from Database.config import Base
import main as application_module


# ── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def app():
    """
    Create a Flask app configured for testing with an in-memory SQLite database.
    Scope is 'session' so the app is only created once per test run.
    """
    flask_app = application_module.app
    flask_app.config.update({
        "TESTING": True,
        "DEBUG": False,
    })
    yield flask_app


@pytest.fixture(scope="session")
def client(app):
    """Flask test client — use this for all HTTP-level integration tests."""
    return app.test_client()


@pytest.fixture(scope="function")
def db_session():
    """
    Provide a clean SQLAlchemy session connected to an in-memory SQLite DB.
    Each test function gets its own session; tables are recreated fresh.
    """
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)

