# SignalGuard frontend

Phase 1 application foundation for the Digital Manipulation Detector. It is intentionally isolated from the Flask backend and does not implement analysis workflows.

## Run locally

```bash
npm install
npm run dev
```

The future API client expects the existing Flask service to expose `GET /` and `POST /analyze` unchanged.

