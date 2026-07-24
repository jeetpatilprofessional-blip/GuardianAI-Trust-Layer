import os
import sys
import subprocess
import uvicorn

# Ensure the workspace directory and backend directory are in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

if __name__ == "__main__":
    print("Initialising database...")
    init_script = os.path.join(BASE_DIR, "init_db.py")
    subprocess.run([sys.executable, init_script])
    print("Starting FastAPI Backend Server on http://localhost:8000...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
