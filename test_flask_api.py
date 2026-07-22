"""
test_flask_api.py — Tests for the Flask backend.

Starts the Flask server in a background thread, runs all 3 test cases,
then shuts down.
"""

import json
import os
import threading
import time

import requests

BASE_URL = "http://127.0.0.1:5000"
IMAGE_PATH = os.path.join(
    os.path.dirname(__file__),
    "uploads",
    "churei-tower-mount-fuji-in-japan-8k-68-1920x1080.jpg",
)


def _start_server():
    """Start Flask in a daemon thread so it dies when the test exits."""
    from app import app
    app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)


def _wait_for_server(timeout: int = 90) -> bool:
    deadline = time.time() + timeout
    attempt = 0
    while time.time() < deadline:
        try:
            requests.get(BASE_URL, timeout=1)
            return True
        except Exception:
            time.sleep(1)
            attempt += 1
            print(f"  Waiting for server... ({attempt}s)", end="\r", flush=True)
    print()
    return False


def _print_result(label: str, response: requests.Response) -> None:
    print(f"\n{'='*50}")
    print(f"  TEST: {label}")
    print(f"{'='*50}")
    print(f"  HTTP Status : {response.status_code}")
    try:
        body = response.json()
        print(f"  Success     : {body.get('success')}")
        analysis = body.get("analysis", {})
        if analysis:
            mj = analysis.get("meta_judge", {})
            judge = analysis.get("judge", {})
            print(f"  Final Decision  : {mj.get('final_decision', judge.get('decision', 'N/A'))}")
            print(f"  Confidence      : {mj.get('confidence', judge.get('confidence', 0.0))*100:.1f}%")
            print(f"  Agreement Score : {mj.get('agreement_score', 'N/A')}")
            print(f"  Report Present  : {'report' in analysis}")
            timing = analysis.get("timing", {})
            if timing:
                print(f"  Total Time      : {timing.get('total', 0.0):.2f}s")
        else:
            print(f"  Error       : {body.get('error')}")
    except Exception as e:
        print(f"  Could not parse response: {e}")
        print(f"  Raw: {response.text[:300]}")


# ---------------------------------------------------------------------------
# Pre-load models in main thread so the server starts fast
# ---------------------------------------------------------------------------

print("Pre-loading models (RoBERTa + Emotion)...")
from services.roberta_service import predict_manipulation
from services.emotion_service import predict_emotion
predict_manipulation("warmup")
predict_emotion("warmup")
print("Models loaded.\n")

# ---------------------------------------------------------------------------
# Start server
# ---------------------------------------------------------------------------

print("Starting Flask server...")
t = threading.Thread(target=_start_server, daemon=True)
t.start()

if not _wait_for_server():
    print("ERROR: Flask server did not start within 15 seconds.")
    exit(1)

print("Flask server is up.\n")

# ---------------------------------------------------------------------------
# Test 1 — GET /
# ---------------------------------------------------------------------------
print("########## TEST 1 — GET / ##########")
r = requests.get(BASE_URL)
print(f"  HTTP Status : {r.status_code}")
print(f"  Body        : {r.json()}")

# ---------------------------------------------------------------------------
# Test 2 — POST /analyze  (text)
# ---------------------------------------------------------------------------
print("\n########## TEST 2 — POST /analyze (TEXT) ##########")
r = requests.post(
    f"{BASE_URL}/analyze",
    json={"text": "If you truly loved me, you would do this for me without question."},
)
_print_result("Manipulative Text", r)

# ---------------------------------------------------------------------------
# Test 3 — POST /analyze  (image)
# ---------------------------------------------------------------------------
print("\n########## TEST 3 — POST /analyze (IMAGE) ##########")
if os.path.exists(IMAGE_PATH):
    with open(IMAGE_PATH, "rb") as img:
        r = requests.post(
            f"{BASE_URL}/analyze",
            files={"file": (os.path.basename(IMAGE_PATH), img, "image/jpeg")},
            timeout=360,
        )
    _print_result("Image", r)
else:
    print(f"  Image not found at: {IMAGE_PATH}")
    print("  Skipping image test.")

print("\n\nAll tests complete.")
