from orchestrator import analyze

if __name__ == "__main__":

    # ------------------------------------------------------------------
    # Test 1 : Plain manipulative text
    # ------------------------------------------------------------------
    print("\n########## TEST 1 — Manipulative Text ##########\n")
    result1 = analyze("If you truly loved me, you would do this for me without question.")
    print("RETURNED DICT:")
    print(f"  input_type     : {result1['input_type']}")
    print(f"  text_analyzed  : {result1['text_analyzed']}")
    print(f"  roberta label  : {result1['roberta_output']['label']}")
    print(f"  roberta conf   : {result1['roberta_output']['confidence']:.4f}")
    print(f"  emotion        : {result1['emotion_output']['primary_emotion']}")
    print(f"  emotion conf   : {result1['emotion_output']['confidence']:.4f}")
    print(f"  total time     : {result1['timing']['total']:.2f}s")

    # ------------------------------------------------------------------
    # Test 2 : Plain neutral text
    # ------------------------------------------------------------------
    print("\n########## TEST 2 — Neutral Text ##########\n")
    result2 = analyze("The quarterly financial report will be published next Monday.")
    print("RETURNED DICT:")
    print(f"  input_type     : {result2['input_type']}")
    print(f"  text_analyzed  : {result2['text_analyzed']}")
    print(f"  roberta label  : {result2['roberta_output']['label']}")
    print(f"  roberta conf   : {result2['roberta_output']['confidence']:.4f}")
    print(f"  emotion        : {result2['emotion_output']['primary_emotion']}")
    print(f"  emotion conf   : {result2['emotion_output']['confidence']:.4f}")
    print(f"  total time     : {result2['timing']['total']:.2f}s")

    # ------------------------------------------------------------------
    # Test 3 : Image input (requires Colab/Qwen runtime to be active)
    # ------------------------------------------------------------------
    print("\n########## TEST 3 — Image Input ##########\n")
    try:
        result3 = analyze(
            "C:/Users/l/OneDrive/Documents/PROJECTS/DIGI MANIP project/uploads/churei-tower-mount-fuji-in-japan-8k-68-1920x1080.jpg"
        )
        print("RETURNED DICT:")
        print(f"  input_type     : {result3['input_type']}")
        print(f"  vision_output  : {result3['vision_output']}")
        print(f"  text_analyzed  : {result3['text_analyzed'][:80] if result3['text_analyzed'] else 'EMPTY'}")
        print(f"  roberta label  : {result3['roberta_output']['label']}")
        print(f"  roberta conf   : {result3['roberta_output']['confidence']:.4f}")
        print(f"  emotion        : {result3['emotion_output']['primary_emotion']}")
        print(f"  emotion conf   : {result3['emotion_output']['confidence']:.4f}")
        print(f"  vision time    : {result3['timing']['vision_service']:.2f}s")
        print(f"  total time     : {result3['timing']['total']:.2f}s")
    except Exception as e:
        print(f"  ⚠ SKIPPED — Qwen/Vision Service offline: {e}")
        print("  Start your Colab runtime and update QWEN_API_URL in vision_service.py to test this path.")

    # ------------------------------------------------------------------
    # Test 4 : Fear / urgency manipulation
    # ------------------------------------------------------------------
    print("\n########## TEST 4 — Fear Induction Text ##########\n")
    result4 = analyze("Your account will be permanently deleted in 24 hours unless you act now.")
    print("RETURNED DICT:")
    print(f"  input_type     : {result4['input_type']}")
    print(f"  roberta label  : {result4['roberta_output']['label']}")
    print(f"  roberta conf   : {result4['roberta_output']['confidence']:.4f}")
    print(f"  emotion        : {result4['emotion_output']['primary_emotion']}")
    print(f"  emotion conf   : {result4['emotion_output']['confidence']:.4f}")
    print(f"  total time     : {result4['timing']['total']:.2f}s")

    print("\n########## ALL TESTS COMPLETE ##########\n")
