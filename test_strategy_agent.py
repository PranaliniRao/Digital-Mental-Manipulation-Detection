import json
from agents.strategy import StrategyAgent

agent = StrategyAgent()
text = "If you truly loved me, you would do this for me without question."

print("\n========== STRATEGY AGENT TEST ==========")
print(f"Input: {text}\n")
result = agent.analyze(text)
print("\nStructured Output:")
print(json.dumps(result, indent=2))
print("==========================================\n")
