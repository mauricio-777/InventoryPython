from flask import Flask, jsonify
from flask_cors import CORS
from Database.config import engine, Base
from Product.Adapters.product_controller import router as product_router
from Product.Adapters.batch_controller import router as batch_router
from Product.Adapters.movement_controller import router as movement_router

# Create all tables
Base.metadata.create_all(bind=engine)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# API Registration
app.register_blueprint(product_router)
app.register_blueprint(batch_router)
app.register_blueprint(movement_router)

@app.route("/", methods=["GET"])
def read_root():
    return jsonify({"status": "ok", "message": "Inventory API is running (Flask)"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
