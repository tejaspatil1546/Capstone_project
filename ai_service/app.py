"""
Sentry AI - Computer Vision & ML Microservice API (Port 5001)
Provides REST endpoints for SSIM maintenance verification and 5-class issue classification.
"""

import os
import sys
import io
import base64
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ssim_engine import analyze_maintenance_pair
from classifier_engine import classify_issue_image, CLASSES, TEAM_ROUTING


app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLE_DIR = os.path.join(BASE_DIR, "sample_data")
ZONES_DIR = os.path.join(SAMPLE_DIR, "zones")
ISSUES_DIR = os.path.join(SAMPLE_DIR, "issues")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "Sentry AI/CV Microservice",
        "version": "1.0.0",
        "modules": {
            "ssim_engine": "OpenCV / scikit-image SSIM",
            "classifier_engine": "5-Class Infrastructure Model"
        }
    })


@app.route("/compare-images", methods=["POST"])
def compare_images():
    """
    Compares morning and evening site camera images to evaluate maintenance compliance.
    Accepts multipart/form-data with 'morning' and 'evening' files,
    or JSON payload with base64 encoded strings / server filepaths.
    """
    try:
        morning_data = None
        evening_data = None

        if "morning" in request.files and "evening" in request.files:
            morning_data = request.files["morning"].read()
            evening_data = request.files["evening"].read()
        elif request.is_json:
            data = request.get_json()
            if "morning_b64" in data and "evening_b64" in data:
                m_b64 = data["morning_b64"].split(",")[-1]
                e_b64 = data["evening_b64"].split(",")[-1]
                morning_data = base64.b64decode(m_b64)
                evening_data = base64.b64decode(e_b64)
            elif "morning_path" in data and "evening_path" in data:
                with open(data["morning_path"], "rb") as f:
                    morning_data = f.read()
                with open(data["evening_path"], "rb") as f:
                    evening_data = f.read()

        if not morning_data or not evening_data:
            return jsonify({
                "error": "Missing image inputs. Provide 'morning' and 'evening' files or base64 payloads."
            }), 400

        result = analyze_maintenance_pair(morning_data, evening_data)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict-issue", methods=["POST"])
def predict_issue():
    """
    Classifies an uploaded issue photograph into one of the 5 predefined classes
    and infers severity + maintenance team assignment.
    """
    try:
        image_data = None
        description_hint = ""

        if "image" in request.files:
            image_data = request.files["image"].read()
            description_hint = request.form.get("description", "")
        elif request.is_json:
            data = request.get_json()
            if "image_b64" in data:
                b64_clean = data["image_b64"].split(",")[-1]
                image_data = base64.b64decode(b64_clean)
            elif "image_path" in data:
                with open(data["image_path"], "rb") as f:
                    image_data = f.read()
            description_hint = data.get("description", "")

        if not image_data:
            return jsonify({
                "error": "Missing image input. Provide 'image' file or 'image_b64'."
            }), 400

        result = classify_issue_image(image_data, description_hint=description_hint)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/sample-pairs", methods=["GET"])
def get_sample_pairs():
    """Returns metadata and base64 previews of pre-generated demo datasets."""
    def to_b64(path):
        if not os.path.exists(path):
            return None
        with open(path, "rb") as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"

    samples = {
        "zones": [
            {
                "id": "zone-cafe-01",
                "name": "Main Cafeteria (Zone 1)",
                "expected": "COMPLIANT",
                "notes": "Morning cluttered -> Evening cleared and wiped",
                "morning_preview": to_b64(os.path.join(ZONES_DIR, "cafeteria_morning.jpg")),
                "evening_preview": to_b64(os.path.join(ZONES_DIR, "cafeteria_evening.jpg"))
            },
            {
                "id": "zone-court-04",
                "name": "Central Courtyard (Zone 4)",
                "expected": "NON-COMPLIANT",
                "notes": "Morning litter -> Evening unattended / unchanged",
                "morning_preview": to_b64(os.path.join(ZONES_DIR, "courtyard_morning.jpg")),
                "evening_preview": to_b64(os.path.join(ZONES_DIR, "courtyard_evening.jpg"))
            }
        ],
        "issues": [
            {
                "category": "Electrical",
                "description": "Exposed switchboard wires sparking near Lab 304",
                "preview": to_b64(os.path.join(ISSUES_DIR, "sample_electrical.jpg"))
            },
            {
                "category": "Plumbing",
                "description": "Continuous pipe leakage and water accumulation on 2nd floor",
                "preview": to_b64(os.path.join(ISSUES_DIR, "sample_plumbing.jpg"))
            },
            {
                "category": "Structural Damage",
                "description": "Deep vertical fissure and plaster detachment on corridor wall",
                "preview": to_b64(os.path.join(ISSUES_DIR, "sample_structural.jpg"))
            },
            {
                "category": "Cleanliness",
                "description": "Overflowing trash bin with waste scattered in common walkway",
                "preview": to_b64(os.path.join(ISSUES_DIR, "sample_cleanliness.jpg"))
            },
            {
                "category": "Equipment Failure",
                "description": "Ceiling multimedia projector malfunctioning in Seminar Hall A",
                "preview": to_b64(os.path.join(ISSUES_DIR, "sample_equipment.jpg"))
            }
        ]
    }
    return jsonify(samples)


if __name__ == "__main__":
    print("Starting Sentry AI Microservice on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)
