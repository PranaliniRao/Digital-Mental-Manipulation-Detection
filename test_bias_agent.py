import json
from agents.bias import BiasAgent

agent = BiasAgent()
text = "If you truly loved me, you would do this for me without question."

print("\n========== BIAS AGENT TEST ==========")
print(f"Input: {text}\n")
result = agent.analyze(text)
print("\nStructured Output:")
print(json.dumps(result, indent=2))
print("======================================\n")
