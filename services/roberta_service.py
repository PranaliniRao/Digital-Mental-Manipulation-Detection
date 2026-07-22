"""
RoBERTa Manipulation Detection Service.

Loads a fine-tuned RoBERTa model once at startup and exposes
predict_manipulation() for inference. No endpoints, no side effects.
"""

import os
import time

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "ai_models", "roberta")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------------------------------------------------------------------------
# Check for Git LFS pointer file
# ---------------------------------------------------------------------------

MODEL_FILE = os.path.join(MODEL_DIR, "model.safetensors")

if os.path.exists(MODEL_FILE):
    with open(MODEL_FILE, "rb") as f:
        first_line = f.readline()
        if first_line.startswith(b"version https://git-lfs.github.com"):
    
            raise RuntimeError(
                f"RoBERTa model file is a Git LFS pointer, not the actual weights.\n"
                f"File: {MODEL_FILE}\n"
                f"Please run 'git lfs pull' to download the actual model file (expected size: ~498MB).\n"
                f"Alternatively, download the model manually from Hugging Face."
            )

# ---------------------------------------------------------------------------
# Model loading — executed once at import time
# ---------------------------------------------------------------------------

try:
    _tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    _model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_DIR,
        torch_dtype=torch.float16,
        low_cpu_mem_usage=True,
    )
    _model.to(DEVICE)
    _model.eval()
except OSError as e:
    if "paging file" in str(e).lower() or "memory" in str(e).lower():
        print("WARNING: Insufficient system memory to load RoBERTa model.")
        print("Please increase your Windows virtual memory (paging file) size:")
        print("1. Right-click 'This PC' → Properties → Advanced system settings")
        print("2. Under Performance, click Settings → Advanced tab")
        print("3. Under Virtual memory, click Change")
        print("4. Increase the paging file size to at least 8192 MB")
        print("5. Restart your computer and try again")
        raise RuntimeError(
            "Insufficient system memory. Please increase Windows virtual memory (paging file) to at least 8GB."
        ) from e
    raise


# ---------------------------------------------------------------------------
# Inference
# ---------------------------------------------------------------------------

def predict_manipulation(text: str) -> dict:
    """
    Run manipulation detection on the given text.

    Args:
        text: Raw input string to classify.

    Returns:
        Dictionary containing label, is_manipulative flag,
        confidence score, and per-class probabilities.
    """
    total_start = time.perf_counter()

    print("=" * 50)
    print("              ROBERTA SERVICE")
    print("=" * 50)
    print()

    # Tokenization
    print("Loading tokenizer...")
    t0 = time.perf_counter()
    inputs = _tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=512,
    )
    inputs = {k: v.to(DEVICE) for k, v in inputs.items()}
    tokenization_time = time.perf_counter() - t0
    print("\u2713 Ready")
    print()

    print("Preparing input...")
    print("\u2713 Tokenized")
    print()

    # Inference
    print("Running inference...")
    t1 = time.perf_counter()
    with torch.inference_mode():
        outputs = _model(**inputs)
    inference_time = time.perf_counter() - t1
    print("\u2713 Complete")
    print()

    # Softmax
    print("Applying softmax...")
    t2 = time.perf_counter()
    probs = torch.softmax(outputs.logits, dim=-1).squeeze()
    softmax_time = time.perf_counter() - t2
    print("\u2713 Complete")
    print()

    # Prediction
    print("Generating prediction...")
    t3 = time.perf_counter()
    predicted_class = torch.argmax(probs).item()
    manipulative_prob = probs[1].item()
    non_manipulative_prob = probs[0].item()
    label = "manipulative" if predicted_class == 1 else "non_manipulative"
    prediction_time = time.perf_counter() - t3
    print("\u2713 Complete")
    print()

    total_time = time.perf_counter() - total_start

    # Summary output
    print("Prediction")
    print("-" * 10)
    print(f"{'Label':<15}: {label}")
    print(f"{'Confidence':<15}: {probs[predicted_class].item() * 100:.2f}%")
    print()
    print("Timing")
    print("-" * 6)
    print(f"{'Tokenization':<13}: {tokenization_time:.4f}s")
    print(f"{'Inference':<13}: {inference_time:.4f}s")
    print(f"{'Softmax':<13}: {softmax_time:.4f}s")
    print(f"{'Prediction':<13}: {prediction_time:.4f}s")
    print(f"{'Total Time':<13}: {total_time:.4f}s")
    print()
    print("=" * 50)

    return {
        "label": label,
        "is_manipulative": predicted_class == 1,
        "confidence": probs[predicted_class].item(),
        "probabilities": {
            "manipulative": manipulative_prob,
            "non_manipulative": non_manipulative_prob,
        },
    }
