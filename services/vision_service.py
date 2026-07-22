import time
import requests

# Change this whenever you restart the Colab runtime
QWEN_API_URL ="https://doorbell-veto-neurotic.ngrok-free.dev/analyze-image" 


def analyze_image(image_path: str):
    """
    Sends an image to the Qwen Vision API and returns the JSON response.
    Raises ConnectionError if the API is unavailable.
    """

    total_start = time.perf_counter()

    print("\n========== QWEN VISION SERVICE ==========")

    # ------------------------------------------------
    # Stage 1 : Open Image
    # ------------------------------------------------
    stage = time.perf_counter()

    with open(image_path, "rb") as f:

        print(f"✅ Image opened ({time.perf_counter() - stage:.3f}s)")

        # --------------------------------------------
        # Stage 2 : Send Request
        # --------------------------------------------
        headers = {
            "ngrok-skip-browser-warning": "true"
        }

        stage = time.perf_counter()

        print("📤 Sending image to Qwen API...")

        try:
            response = requests.post(
                QWEN_API_URL,
                files={"upload": f},
                headers=headers,
                timeout=300
            )
            print(f"✅ API responded ({time.perf_counter() - stage:.2f}s)")
        except requests.exceptions.ConnectionError as e:
            print(f"❌ Connection failed: {e}")
            print(f"⚠️  Qwen API tunnel may be offline. Update QWEN_API_URL in vision_service.py")
            raise ConnectionError(f"Qwen Vision API unavailable: {e}") from e
        except requests.exceptions.Timeout as e:
            print(f"❌ Request timed out: {e}")
            raise ConnectionError(f"Qwen Vision API timeout: {e}") from e

    # ------------------------------------------------
    # Stage 3 : Validate Response
    # ------------------------------------------------
    stage = time.perf_counter()

    try:
        response.raise_for_status()
        print(f"✅ Response validated ({time.perf_counter() - stage:.3f}s)")
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP error: {e}")
        print(f"⚠️  Qwen API returned status {response.status_code}")
        raise ConnectionError(f"Qwen Vision API HTTP error: {e}") from e

    # ------------------------------------------------
    # Stage 4 : Parse JSON
    # ------------------------------------------------
    stage = time.perf_counter()

    try:
        result = response.json()
        print(f"✅ JSON parsed ({time.perf_counter() - stage:.3f}s)")
    except ValueError as e:
        print(f"❌ JSON parse failed: {e}")
        raise ValueError(f"Qwen Vision API returned invalid JSON: {e}") from e

    # ------------------------------------------------
    # Total Time
    # ------------------------------------------------
    total = time.perf_counter() - total_start

    print(f"\n🎯 Total Vision Service Time : {total:.2f} seconds")
    print("=========================================\n")

    return result