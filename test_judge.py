from orchestrator import analyze


def print_judge_result(result: dict) -> None:
    judge = result["judge"]
    print("========== JUDGE ==========")
    print(f"Decision       : {judge['decision']}")
    print(f"Confidence     : {judge['confidence']:.2%}")
    print(f"Evidence       : {judge['evidence']}")
    print(f"Reasoning      : {judge['reasoning']}")
    print(f"Execution Time : {result['timing']['judge']:.2f}s")


if __name__ == "__main__":
    print("\n########## MANIPULATIVE TEXT ##########\n")
    print_judge_result(analyze("If you truly loved me, you would do this for me without question."))

    print("\n########## NEUTRAL TEXT ##########\n")
    print_judge_result(analyze("The quarterly financial report will be published next Monday."))

    print("\n########## IMAGE ##########\n")
    try:
        print_judge_result(analyze(
            "C:/Users/l/OneDrive/Documents/PROJECTS/DIGI MANIP project/"
            "uploads/churei-tower-mount-fuji-in-japan-8k-68-1920x1080.jpg"
        ))
    except Exception as exc:
        print(f"Image test skipped because the Vision/Qwen service is unavailable: {exc}")
