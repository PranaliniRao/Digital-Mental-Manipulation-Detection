from orchestrator import analyze
from services.report_service import generate_report


def run(label: str, input_value: str) -> None:
    print(f"\n{'#'*6} {label} {'#'*6}\n")
    try:
        analysis = analyze(input_value)
        report   = generate_report(analysis, fmt="console")
        print(report)
    except Exception as exc:
        print(f"Test skipped — {exc}")


if __name__ == "__main__":
    run(
        "MANIPULATIVE TEXT",
        "If you truly loved me, you would do this for me without question.",
    )

    run(
        "NEUTRAL TEXT",
        "The quarterly financial report will be published next Monday.",
    )

    run(
        "IMAGE",
        "C:/Users/l/OneDrive/Documents/PROJECTS/DIGI MANIP project/"
        "uploads/churei-tower-mount-fuji-in-japan-8k-68-1920x1080.jpg",
    )
