"""
Smart Food Bank AI Microservices
Flask application exposing 4 stub endpoints:
  POST /predict   - demand forecast
  POST /assess    - food quality image assessment
  GET  /match     - donation-beneficiary matching
  GET  /analyze   - sentiment analysis
"""

from flask import Flask, request, jsonify
import random, datetime, logging

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


# ── 3. DONATION-BENEFICIARY MATCHING (/match) ──────────────────
@app.route("/match", methods=["GET"])
def match():
    """
    Stub matching service.
    Real implementation: cosine similarity on dietary restriction vectors + family size weighting.
    """
    logger.info("Match suggestions requested")
    suggestions = [
        {
            "donationId": 1,
            "donation": "Rice 30kg – FreshMart",
            "beneficiaries": [
                {"name": "Kumar Family (4)",    "matchScore": 94, "dietary": "Vegetarian"},
                {"name": "Sharma Family (3)",   "matchScore": 81, "dietary": "Diabetic"},
                {"name": "Ravi Household (5)",  "matchScore": 72, "dietary": "None"},
            ],
        },
        {
            "donationId": 2,
            "donation": "Bread 50 loaves – City Bakery",
            "beneficiaries": [
                {"name": "Mohammed Ali (6)", "matchScore": 90, "dietary": "Halal"},
                {"name": "Susan D (2)",      "matchScore": 78, "dietary": "None"},
                {"name": "Kumar HH (4)",     "matchScore": 65, "dietary": "Vegan"},
            ],
        },
    ]
    return jsonify({"success": True, "matches": suggestions})


# ── 4. SENTIMENT ANALYSIS (/analyze) ───────────────────────────
@app.route("/analyze", methods=["POST", "GET"])
def analyze():
    """
    Sentiment analysis using TextBlob polarity.
    Real implementation: BERT/RoBERTa fine-tuned on food bank feedback.
    """
    if request.method == "POST":
        data    = request.json or {}
        comment = data.get("comment", "")
        if TEXTBLOB_AVAILABLE and comment:
            polarity  = TextBlob(comment).sentiment.polarity
            sentiment = "POSITIVE" if polarity > 0.1 else "NEGATIVE" if polarity < -0.1 else "NEUTRAL"
        else:
            sentiment = random.choice(["POSITIVE", "POSITIVE", "NEUTRAL", "NEGATIVE"])
        return jsonify({"sentiment": sentiment, "comment": comment})

    # GET: return sample sentiment summary
    return jsonify({
        "success": True,
        "summary": {
            "POSITIVE": 12,
            "NEUTRAL":  5,
            "NEGATIVE": 3,
        }
    })


# ── Health check ───────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "services": {
            "forecast":  "stub",
            "vision":    "stub",
            "matching":  "stub",
            "sentiment": "textblob" if TEXTBLOB_AVAILABLE else "stub",
        }
    })


if __name__ == "__main__":
    logger.info("Starting Smart Food Bank AI Services on port 5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
