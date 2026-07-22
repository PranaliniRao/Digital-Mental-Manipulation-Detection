from services.roberta_service import predict_manipulation

tests = [
    "Click this link now or your bank account will be permanently suspended.",
    "The sky is blue on a clear day.",
    "If you truly loved me, you would do this for me.",
    "Artificial Intelligence is transforming healthcare.",
    "Limited offer! Buy now before midnight!"
]

for i, text in enumerate(tests, 1):
    print(f"\n========== Test {i} ==========")
    print(text)
    print(predict_manipulation(text))