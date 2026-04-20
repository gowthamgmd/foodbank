"""
Smart Food Bank AI Microservices (Integrated with Backend)
Flask application exposing 2 stub endpoints:
  POST /predict   - demand forecast
  POST /assess    - food quality image assessment
"""

from flask import Flask, request, jsonify
import random, datetime, logging, sys, os

# Add parent directory to path for imports if needed
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# -- Conditional imports (graceful degradation) --------------
try:
    from textblob import TextBlob
    TEXTBLOB_AVAILABLE = True
except ImportError:
    TEXTBLOB_AVAILABLE = False

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CATEGORIES = ["Grains", "Dairy", "Proteins", "Vegetables", "Fruits", "Beverages", "Canned Goods", "Bakery"]


# ── 1. DEMAND FORECAST (/predict) ──────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    """
    Stub demand forecast — returns predicted quantity per category for next 7 days.
    Real implementation: Prophet model trained on historical donation/distribution data.
    """
    logger.info("Forecast requested: %s", request.json)
    today = datetime.date.today()
    forecast = []
    for cat in CATEGORIES:
        base = random.randint(60, 400)
        noise = random.randint(-20, 20)
        predicted = base + noise
        low  = max(0, predicted - random.randint(10, 30))
        high = predicted + random.randint(10, 30)
        forecast.append({
            "category":  cat,
            "predicted": predicted,
            "low":       low,
            "high":      high,
            "forecastDate": str(today + datetime.timedelta(days=7)),
        })
    return jsonify({"success": True, "forecast": forecast})


# ── 2. FOOD QUALITY ASSESSMENT (/assess) ───────────────────────
@app.route("/assess", methods=["POST"])
def assess():
    """
    Stub image quality classifier.
    Real implementation: CNN (EfficientNet/MobileNet) fine-tuned on food freshness dataset.
    """
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files["image"]
    logger.info("Assessing image: %s", image_file.filename)

    # Simulate classification
    classes      = ["FRESH", "PARTIAL", "SPOILED"]
    weights      = [0.6, 0.25, 0.15]
    quality      = random.choices(classes, weights=weights, k=1)[0]
    shelf_life   = {"FRESH": random.randint(5, 10), "PARTIAL": random.randint(1, 3), "SPOILED": 0}[quality]
    confidence   = round(random.uniform(0.75, 0.97), 2)

    return jsonify({
        "qualityStatus": quality,
        "shelfLifeDays": shelf_life,
        "confidence":    confidence,
    })


# ── Health check ───────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "services": {
            "forecast":  "stub",
            "vision":    "stub",
        }
    })


if __name__ == "__main__":
    logger.info("Starting Smart Food Bank AI Services on port 5001")
    app.run(host="0.0.0.0", port=5001, debug=False)
