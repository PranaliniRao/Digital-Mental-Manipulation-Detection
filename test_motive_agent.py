import json
from agents.motive import MotiveAgent

agent = MotiveAgent()
text = "If you truly loved me, you would do this for me without question."

print("\n========== MOTIVE AGENT TEST ==========")
print(f"Input: {text}\n")
result = agent.analyze(text)
print("\nStructured Output:")
print(json.dumps(result, indent=2))
print("========================================\n")
