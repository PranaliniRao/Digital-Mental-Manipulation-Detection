import json
from agents.intent import IntentAgent

agent = IntentAgent()
text = "If you truly loved me, you would do this for me without question."

print("\n========== INTENT AGENT TEST ==========")
print(f"Input: {text}\n")

result = agent.analyze(text)

print("\nStructured Output:")
print(json.dumps(result, indent=2))
print("=======================================\n")
