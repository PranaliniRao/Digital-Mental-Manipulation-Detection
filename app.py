"""
Flask Backend — Digital Manipulation Detector API.

Routes
------
GET  /          — health check
POST /analyze   — accepts text (JSON) or image (multipart/form-data)

All AI logic lives in the orchestrator. This file only handles HTTP.
"""

import os
import time
import uuid

from flask import Flask, request, jsonify
from flask_cors import CORS

from orchestrator import analyze
from services.report_service import generate_report

app = Flask(__name__)

CORS(app,
     origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=False,
)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "bmp", "tiff", "gif"}


def _allowed(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _log(request_type: str, status: str, elapsed: float) -> None:
    print()
    print("=" * 40)
    print("         FLASK API")
    print("=" * 40)
    print(f"  Request Type   : {request_type}")
    print(f"  Status         : {status}")
    print(f"  Processing Time: {elapsed:.2f}s")
    print("=" * 40)
    print()


def _serialize(obj):
    """Recursively make analysis dict JSON-safe."""
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_serialize(i) for i in obj]
    if isinstance(obj, float):
        return obj
    return obj


# ---------------------------------------------------------------------------
# GET /
# ---------------------------------------------------------------------------

@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "running",
        "service": "Digital Manipulation Detector Backend",
    }), 200


# ---------------------------------------------------------------------------
# POST /analyze
# ---------------------------------------------------------------------------

@app.route("/analyze", methods=["POST"])
def analyze_endpoint():
    t0 = time.perf_counter()
    tmp_path = None
    request_type = "UNKNOWN"

    try:
        # ── Detect input type ────────────────────────────────────────────
        if "file" in request.files:
            # --- IMAGE ---
            file = request.files["file"]

            if file.filename == "":
                return jsonify({"success": False, "error": "No file selected."}), 400

            if not _allowed(file.filename):
                return jsonify({
                    "success": False,
                    "error": f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
                }), 400

            ext = file.filename.rsplit(".", 1)[1].lower()
            tmp_path = os.path.join(UPLOAD_FOLDER, f"tmp_{uuid.uuid4().hex}.{ext}")
            file.save(tmp_path)

            request_type = "IMAGE"
            input_value  = tmp_path

        elif request.is_json:
            # --- TEXT ---
            body = request.get_json(silent=True) or {}
            text = body.get("text", "").strip()

            if not text:
                return jsonify({"success": False, "error": "Field 'text' is missing or empty."}), 400

            request_type = "TEXT"
            input_value  = text

        else:
            return jsonify({
                "success": False,
                "error": "Send either JSON {\"text\": \"...\"} or multipart/form-data with a 'file' field.",
            }), 400

        # ── Run pipeline ─────────────────────────────────────────────────
        analysis = analyze(input_value)
        generate_report(analysis, fmt="console")

        elapsed = time.perf_counter() - t0
        _log(request_type, "OK", elapsed)

        return jsonify({"success": True, "analysis": _serialize(analysis)}), 200

    except ConnectionError as exc:
        elapsed = time.perf_counter() - t0
        _log(request_type, "VISION SERVICE UNAVAILABLE", elapsed)
        return jsonify({"success": False, "error": f"Vision service unavailable: {exc}"}), 503

    except Exception as exc:
        elapsed = time.perf_counter() - t0
        _log("UNKNOWN", f"ERROR — {exc}", elapsed)
        return jsonify({"success": False, "error": str(exc)}), 500

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
