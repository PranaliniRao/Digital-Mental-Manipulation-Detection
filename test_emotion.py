from services.emotion_service import predict_emotion

if __name__ == "__main__":
    print("Starting Emotion Service Test...")

    print("Running Test 1...")
    result1 = predict_emotion("I am extremely happy today because I finally achieved my dream.")
    print(result1)

    print("Running Test 2...")
    result2 = predict_emotion("I feel hopeless and completely alone.")
    print(result2)

    print("Emotion Service Test Complete.")
