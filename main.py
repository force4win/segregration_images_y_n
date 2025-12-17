import os
import shutil
import argparse
import uvicorn
import webbrowser
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import List

# Configure Argument Parser
parser = argparse.ArgumentParser(description="Segregador de Imagenes SI/NO")
parser.add_argument("directory", nargs='?', default=".", help="Directorio con las imagenes a clasificar")
parser.add_argument("--port", type=int, default=8000, help="Puerto para el servidor web")

# Parse args (Need to handle when run by uvicorn directly vs python main.py)
# We will parse known args to avoid errors if uvicorn injects args
args, unknown = parser.parse_known_args()

TARGET_DIRECTORY = Path(args.directory).resolve()

if not TARGET_DIRECTORY.exists() or not TARGET_DIRECTORY.is_dir():
    print(f"Error: El directorio '{TARGET_DIRECTORY}' no existe o no es valido.")
    exit(1)

app = FastAPI()

# Allow CORS just in case, though it's local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Models
class MoveRequest(BaseModel):
    filename: str
    decision: str # "SI" or "NO"

VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'}

@app.get("/api/config")
def get_config():
    return {"directory": str(TARGET_DIRECTORY)}

@app.get("/api/images")
def list_images():
    """Lists images in the directory sorted from oldest to newest."""
    try:
        files = []
        for f in TARGET_DIRECTORY.iterdir():
            if f.is_file() and f.suffix.lower() in VALID_EXTENSIONS:
                stats = f.stat()
                files.append({
                    "name": f.name,
                    "path": str(f),
                    "created": stats.st_mtime # Sort by modification time (or creation time)
                })
        
        # Sort: Oldest first (ascending timestamp)
        files.sort(key=lambda x: x["created"])
        
        return [f["name"] for f in files]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/file/{filename}")
def get_image(filename: str):
    file_path = TARGET_DIRECTORY / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@app.post("/api/move")
def move_image(req: MoveRequest):
    if req.decision not in ["SI", "NO"]:
        raise HTTPException(status_code=400, detail="Invalid decision. Must be 'SI' or 'NO'.")
    
    source_path = TARGET_DIRECTORY / req.filename
    if not source_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    # Destination folder
    dest_dir = TARGET_DIRECTORY / req.decision
    dest_dir.mkdir(exist_ok=True)
    
    dest_path = dest_dir / req.filename
    
    # Handle duplicates if file already exists in dest
    if dest_path.exists():
        base = dest_path.stem
        ext = dest_path.suffix
        counter = 1
        while dest_path.exists():
            dest_path = dest_dir / f"{base}_{counter}{ext}"
            counter += 1
            
    try:
        shutil.move(str(source_path), str(dest_path))
        return {"status": "success", "moved_to": str(dest_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount static files for Frontend
# We assume 'static' folder is in the same dir as main.py
current_dir = Path(__file__).parent.resolve()
static_dir = current_dir / "static"
if not static_dir.exists():
    static_dir.mkdir()

app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")

def start():
    print(f"Iniciando Segregador de Imagenes en: {TARGET_DIRECTORY}")
    print(f"Abre tu navegador en: http://localhost:{args.port}")
    webbrowser.open(f"http://localhost:{args.port}")
    uvicorn.run(app, host="0.0.0.0", port=args.port)

if __name__ == "__main__":
    start()
