# Fire Tracking (YOLOv8)

An advanced fire detection and tracking system using the YOLOv8 deep learning model.

## Features
- Real-time fire detection using pre-trained YOLO models.
- Target locking and tracking.
- Multiple detection modes (Mobile Camera, USB Camera, Images, Video).

## Structure
- `arduino/`: `FireTracking.ino` for hardware response.
- `python/`: Various scripts for different detection scenarios (e.g., `SingleFire.py`, `FireLocking.py`).
- `assets/`: Contains models (`FireModel.pt`, `yolov8-face.pt`) and sample media.

## Requirements
- `ultralytics` (YOLOv8)
- `torch`
- `opencv-python`
