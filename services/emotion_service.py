import time
import torch
from transformers import pipeline

_DEVICE = 0 if torch.cuda.is_available() else -1

_emotion_pipeline = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None,
    device=_DEVICE
)

_EMOTION_KEYS = ["joy", "sadness", "anger", "fear", "surprise", "disgust", "neutral"]


def predict_emotion(text: str) -> dict:
    _start = time.perf_counter()
    results = _emotion_pipeline(text)[0]
    _elapsed = time.perf_counter() - _start

    all_emotions = {key: 0.0 for key in _EMOTION_KEYS}
    for entry in results:
        label = entry["label"].lower()
        if label in all_emotions:
            all_emotions[label] = entry["score"]

    primary = max(all_emotions, key=all_emotions.get)

    sorted_emotions = sorted(all_emotions.items(), key=lambda x: x[1], reverse=True)

    print("=" * 50)
    print("            EMOTION ANALYSIS SERVICE")
    print("=" * 50)
    print()
    print("Input:")
    print("-" * 50)
    print(text)
    print()
    print("Inference Time:")
    print("-" * 50)
    print(f"{_elapsed:.2f} seconds")
    print()
    print("Primary Emotion:")
    print("-" * 50)
    print(primary.capitalize())
    print()
    print("Confidence:")
    print("-" * 50)
    print(f"{all_emotions[primary] * 100:.2f}%")
    print()
    print("Emotion Scores:")
    print("-" * 50)
    for emotion, score in sorted_emotions:
        print(f"{emotion.capitalize():<11}: {score * 100:.2f}%")
    print()
    print("=" * 50)
    print("Emotion Analysis Complete")
    print("=" * 50)

    return {
        "primary_emotion": primary,
        "confidence": all_emotions[primary],
        "all_emotions": all_emotions
    }
