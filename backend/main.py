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

# Create all tables
Base.metadata.create_all(bind=engine)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

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

@app.route("/", methods=["GET"])
def read_root():
    return jsonify({"status": "ok", "message": "Inventory API is running (Flask)"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
