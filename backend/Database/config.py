from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, scoped_session
from sqlalchemy.pool import StaticPool

SQLALCHEMY_DATABASE_URL = "sqlite:///./inventory.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    pool_pre_ping=True,
    echo=False
)
session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
SessionLocal = scoped_session(session_factory)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
