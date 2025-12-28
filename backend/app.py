from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import shutil
import os



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
DETECT_DIR = os.path.join(BASE_DIR, "runs", "detect")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DETECT_DIR, exist_ok=True)

app.mount("/results", StaticFiles(directory=DETECT_DIR), name="results")

model = YOLO("best.pt")

def calculate_severity(boxes, img_width, img_height):
    """Determines severity based on the largest pothole's area ratio."""
    if not boxes:
        return "None"
    
    max_ratio = 0
    total_img_area = img_width * img_height

    for box in boxes:
        # box.xyxy[0] provides [x1, y1, x2, y2] coordinates
        coords = box.xyxy[0].tolist()
        w = coords[2] - coords[0]
        h = coords[3] - coords[1]
        pothole_area = w * h
        
        ratio = (pothole_area / total_img_area) * 100
        if ratio > max_ratio:
            max_ratio = ratio

    # These thresholds determine the severity label
    if max_ratio > 10: return "High"
    if max_ratio > 3: return "Medium"
    return "Low"

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    temp_input_path = os.path.join(UPLOAD_DIR, "current_upload.jpg")

    with open(temp_input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    results = model.predict(
        source=temp_input_path, 
        conf=0.3, 
        save=True, 
        project=DETECT_DIR, 
        name="latest_result", 
        exist_ok=True
    )

    img_h, img_w = results[0].orig_shape
    boxes = results[0].boxes
    pothole_count = len(boxes) if boxes else 0
    
    # New severity metric calculation
    severity = calculate_severity(boxes, img_w, img_h)

    image_url = f"/results/latest_result/current_upload.jpg"

    return {
        "potholes_detected": pothole_count,
        "severity": severity,
        "image_url": image_url
    }



import uvicorn

if __name__ == "__main__":
    uvicorn.run(app , host="0.0.0.0" , port=8000)