from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import numpy as np
import cv2
from typing import List, Dict

app = FastAPI(title="TerraNova AI Disease Detection Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
MODEL_PATH = "models/best.pt"
model = None

@app.on_event("startup")
async def load_model():
    """Load YOLO model on startup"""
    global model
    try:
        model = YOLO(MODEL_PATH)
        print(f"✅ Model loaded successfully from {MODEL_PATH}")
        print(f"📊 Model classes: {model.names}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print("⚠️ Service will run without model - please add best.pt to models/ directory")

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "service": "NovaTerra AI Disease Detection",
        "status": "running",
        "model_loaded": model is not None,
    }

@app.get("/health")
def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "classes": model.names if model else None,
    }

@app.post("/detect")
async def detect_disease(file: UploadFile = File(...)):
    """
    Detect plant diseases in uploaded image
    
    Args:
        file: Image file (JPG, PNG)
        
    Returns:
        {
            "detected": bool,
            "diseases": [
                {
                    "class": "tomato_late_blight",
                    "confidence": 0.95,
                    "bbox": [x1, y1, x2, y2]
                }
            ],
            "summary": {
                "total_detections": 2,
                "disease_types": ["late_blight", "leaf_spot"],
                "max_confidence": 0.95
            }
        }
    """
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded. Please add best.pt to models/ directory")
    
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Convert to numpy array
        img_array = np.array(image)
        
        # Run inference
        results = model.predict(
            source=img_array,
            conf=0.25,  # Confidence threshold
            iou=0.45,   # NMS IoU threshold
            verbose=False
        )
        
        # Parse results
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                detection = {
                    "class": model.names[int(box.cls[0])],
                    "confidence": float(box.conf[0]),
                    "bbox": box.xyxy[0].tolist(),  # [x1, y1, x2, y2]
                }
                detections.append(detection)
        
        # Create summary
        disease_types = list(set([d["class"] for d in detections]))
        max_confidence = max([d["confidence"] for d in detections]) if detections else 0
        
        return {
            "detected": len(detections) > 0,
            "diseases": detections,
            "summary": {
                "total_detections": len(detections),
                "disease_types": disease_types,
                "max_confidence": max_confidence,
                "healthy": len(detections) == 0
            },
            "image_size": {
                "width": image.width,
                "height": image.height
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection error: {str(e)}")

@app.post("/batch-detect")
async def batch_detect(files: List[UploadFile] = File(...)):
    """
    Detect diseases in multiple images
    
    Args:
        files: List of image files
        
    Returns:
        List of detection results
    """
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    results = []
    for file in files:
        try:
            result = await detect_disease(file)
            results.append({
                "filename": file.filename,
                "result": result
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
