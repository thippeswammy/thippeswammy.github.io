# Face Recognition By Training (Static YOLO)

This subsystem implements a robust, supervised learning pipeline for face recognition. It uses **YOLOv8** for high-accuracy face detection and a custom-trained YOLOv8 classifier to identify specific individuals.

---

## 🛠️ Features
- **Deterministic Classification**: High precision for pre-enrolled individuals.
- **Robust Detection**: Powered by `yolov8m-face.pt`, capable of spotting faces in complex backgrounds.
- **Data Augmentation**: Automatically enhances training data with rotations, hue tweaks, and scaling.
- **Hardware Triggers**: Supports physical output (e.g., door locks) via `communication.py` and Raspberry Pi GPIO.

---

## 🔄 Workflow

### 1. Data Collection
Collect face crops for specific individuals. This will save images to the `CollectedDataset/` directory.
```bash
python Register.py --persons <person1> <person2> --test-cases <case_name>
```
*Example:* `python Register.py --persons alice bob --test-cases office_staff`

### 2. Model Training
Train the classification model using the collected dataset. This process splits data into 80/10/10 (Train/Val/Test) and runs the fine-tuning.
```bash
python Register.py --train --test-cases <case_name>
```

### 3. Inference (Recognition)
Run the real-time recognition loop. If a person is tracked consistently for over 50 frames, it can trigger a physical signal.
```bash
python Register.py --find --test-cases <case_name>
```

---

## 📂 Script Definitions

- **`Register.py`**: The primary CLI tool that wraps collection, training, and finding logic.
- **`FaceDataCollector.py`**: Handles frame capture and face cropping during registration.
- **`FaceTraining.py`**: Orchestrates the YOLOv8 classification training loop.
- **`FaceTesting.py`**: The core inference engine that combines detection and classification.
- **`communication.py`**: Manages serial/GPIO communication for external hardware triggers.
- **`Augmentation.py`**: utilities for diversifying the training dataset.

---

## 📦 Models Used
- **Detection**: `yolov8m-face.pt` (Medium model for reliable face localization).
- **Classification**: `yolov8n-cls.pt` (Nano model for efficient real-time identification).

---

## 📁 Directory Structure
```bash
FaceRecognitionByTraining/
├── CollectedDataset/              # Raw face crops per person
├── TrainingDataSetForClassification/ # Organized Train/Val/Test sets
├── runs/                           # YOLO training artifacts and weights
├── Register.py                    # Main CLI entry point
└── ...
```

[Return to Root README](../README.md)