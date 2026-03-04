from flask import Flask, jsonify
from flask_cors import CORS
from Database.config import engine, Base, SessionLocal
from Product.Adapters.product_controller import router as product_router
from Product.Adapters.batch_controller import router as batch_router
from Product.Adapters.movement_controller import router as movement_router
from Stakeholder.Domain.customer import Customer
from Stakeholder.Domain.supplier import Supplier
from Stakeholder.Adapters.customer_controller import router as customer_router
from Stakeholder.Adapters.supplier_controller import router as supplier_router
from Stakeholder.Adapters.stakeholder_controller import router as stakeholder_router
from Report.Adapters.report_controller import router as report_router
from Audit.Adapters.audit_controller import router as audit_router
from Audit.Domain.audit_log import AuditLog
from User.Domain.role import Role
from User.Domain.user import User
from User.Adapters.user_controller import router as user_router
from User.Domain.user_service import UserService
from Auth.Adapters.auth_controller import router as auth_router
from CommonLayer.middleware.exception_handler import register_exception_handlers
from CommonLayer.middleware.logging_middleware import register_logging_middleware
from CommonLayer.logging.logger import get_logger

logger = get_logger(__name__)

# Create all tables
Base.metadata.create_all(bind=engine)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'SuperSecretKeyForResetTokens123!@#' # Hardcoded para entorno de desarrollo / MVP
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── Middlewares ──────────────────────────────────────────────────────────────
register_exception_handlers(app)
register_logging_middleware(app)

# Teardown handler to close database sessions
@app.teardown_appcontext
def shutdown_session(exception=None):
    SessionLocal.remove()

# API Registration
app.register_blueprint(product_router)
app.register_blueprint(batch_router)
app.register_blueprint(movement_router)
app.register_blueprint(customer_router)
app.register_blueprint(supplier_router)
app.register_blueprint(stakeholder_router)
app.register_blueprint(report_router)
app.register_blueprint(audit_router)
app.register_blueprint(user_router)
app.register_blueprint(auth_router)

# ── Seed: roles y usuario admin inicial ──────────────────────────────────────
with app.app_context():
    seed_db = SessionLocal()
    try:
        UserService.seed_roles_and_admin(seed_db)
    finally:
        seed_db.close()

@app.route("/", methods=["GET"])
def read_root():
    return jsonify({"status": "ok", "message": "Inventory API is running (Flask)", "version": "1.0.0"}), 200

@app.route("/api/health", methods=["GET"])
def health_check():
    """Dedicated health-check endpoint for monitoring and integration tests."""
    return jsonify({"status": "ok", "service": "inventory-api"}), 200

if __name__ == "__main__":
    logger.info("Starting Inventory API on http://0.0.0.0:8000")
    app.run(host="0.0.0.0", port=8000, debug=True)

