# Face Recognition System Architecture & Technical Specifications

This document outlines the complete architecture of the **FaceRecognition** project, detailing the underlying machine learning models, training mechanisms, high-level functionality, and lower-level execution flows.

The project is bifurcated into two independent subsystems:
1. **FaceRecognitionWithAutoTagging** (Dynamic Recognition) - *Prioritized focus*
2. **FaceRecognitionByTraining** (Static YOLO-based Classification)

---

## 1. FaceRecognitionWithAutoTagging (Dynamic Registration System)

This subsystem performs real-time face detection, tracking, depth-sensing, text-to-speech greetings, and **auto-tagging** without requiring a formal neural network training loop.

### 1.1 High-Level Architecture
- **Purpose**: Instantly recognize known individuals, verbally greet them, and dynamically "learn" unknown individuals by saving their biometric signatures. 
- **Core Loop**: Capture Camera Frame $\rightarrow$ Detect Faces $\rightarrow$ Extract Encodings $\rightarrow$ Compare with Known Database $\rightarrow$ Auto-Tag (if unknown & within range) $\rightarrow$ Smoothen Tracking $\rightarrow$ Text-to-Speech Output.
- **Hardware Integrations**: Supports standard webcams and **Intel RealSense** RGB-Depth cameras.

### 1.2 Model & Machine Learning Details 
- **Library**: `face_recognition` (Python abstraction over `dlib`).
- **Face Detection Model**: **HOG (Histogram of Oriented Gradients)** combined with a linear classifier. Used to locate bounded face boxes efficiently on CPU.
- **Face Encoding Model**: **ResNet-based CNN** (Residual Neural Network) trained via metric learning. It maps a face into a **128-dimensional vector** space (face encoding). This model is pre-trained on a dataset of ~3 million faces.
- **How it "Trains" (Verification, not Classification)**: Instead of updating neural network weights via backpropagation, it uses a **One-Shot Learning / Metric Search approach**. It calculates the Euclidean distance between the 128D encoding of the current face and the encodings stored in the database. If the distance is below a threshold (e.g., `< 0.6`), it classifies it as a match (K-Nearest Neighbors approach). 

### 1.3 How it Works (Low Level / Technical Flow)

1. **Initialization (`recognizeByIntelRealSenseWithAutoTage.py`)**:
   - Parses `ConfigFile.json` for confidence thresholds and welcome messages.
   - Loads baseline known face images from `known_faces/` and previously auto-tagged faces from `AutoTagKnow/`. It calculates their 128D encodings eagerly and holds them in memory (`known_encodings`).
   - Initializes a background Daemon thread and a Queue (`pyttsx3`) for non-blocking Text-to-Speech capabilities.
   - Bootstraps Intel RealSense pipeline (`rs.pipeline()`), aligning depth (Z16 format) to color (BGR format).

2. **Per-Frame Processing Loop**:
   - Fetches aligned RGB and Depth frames. Converts RGB to HOG-friendly format.
   - Computes facial bounding boxes and 128D encodings.
   
3. **The Auto-Tagging Engine & Depth Filter**:
   - The Euclidean distance between the new encoding and memory is calculated. 
   - If no match is found, the system checks the **Depth value** (distance from the camera) at the center of the bounding box. 
   - **Condition**: If the person is within `DepthCon` meters (e.g., 0.5m), the system assigns them a sequential ID (`personX`).
   - It captures the crop of the face and writes it locally to `AutoTagKnow/personX.jpg` and dynamically appends the new 128D encoding to the runtime memory.

4. **Tracking & Smoothing**:
   - Bounding boxes naturally jitter. The script implements an **OpenCV Kalman Filter** (4 dynamic states, 2 measurement states).
   - In each frame, it matches current faces to the closest Kalman instance, runs `kf.predict()` to estimate where the face should be, and inputs the actual detection coordinates into `kf.correct()`. This ensures smooth UI rendering bounding boxes.

5. **Audio Feedback Engine**:
   - Uses a thread-safe `Lock()` approach to add user names to an asynchronous speech queue. To prevent infinite spam calling, a secondary `reset_speech_list` thread clears the tracking cache every `reset_timing` seconds safely avoiding deadlocks.

---

## 2. FaceRecognitionByTraining (Static YOLO System)

This subsystem acts as a traditional Machine Learning pipeline designed for high-accuracy bounding box extraction and deep neural network fine-tuning.

### 2.1 High-Level Architecture
- **Purpose**: Collect custom datasets, augment them, and train a highly robust standard YOLO classifier to recognize specific enrollees.
- **Workflow**: Data Collection `FaceDataCollector` $\rightarrow$ Dataset Splitting `Register` $\rightarrow$ YOLO Training `FaceTraining` $\rightarrow$ Inference Pipeline `FaceTesting`.

### 2.2 Model Details
- **Detection Model**: `yolov8m-face.pt` (YOLOv8 Medium tuned for Faces). It natively spots bounding boxes.
- **Classification Model**: `yolov8n-cls.pt` (YOLOv8 Nano Classifier). This operates on the isolated face crops.
- **Training Method**: 
  - Standard supervised learning backpropagation using the `ultralytics` engine.
  - The model trains for **100 epochs** using a highly augmented pipeline (Hue/Saturation tweaks, 15° rotations, scaling, translations, flips, mosaic, and mixup) to ensure it handles varying lighting and angles.

### 2.3 How it Works (Low Level / Technical Flow)

1. **Dataset Structuring**:
   - `Register.py` automatically collects face crops. It shuffles user images and slices them uniformly: 80% Training, 10% Validation, 10% Test blocks.
   - Images are saved under `TrainingDataSetForClassification/`.

2. **Inference Pipeline (`FaceTesting.py`)**:
   - Frame capture $\rightarrow$ pass frame through `YOLOv8 Face Detection`.
   - Iterate over returned bounding boxes $\rightarrow$ slice the pixels out of the parent image cleanly.
   - Feed the tiny chopped face into the custom-trained `YOLOv8 Classification` model $\rightarrow$ returns a Top-1 Label and Probability Index.
   
3. **Temporal Tracking & Triggering**:
   - Maintains a custom heuristic tracking loop (measuring XY distance thresholds over 50 pixels) to map consistent face classifications over sequential frames.
   - If a specific tracked face is seen successfully for **over 50 frames**, it spins up a custom thread to trigger `communication.py` (e.g., an embedded Raspberry PI / COM port signal to open a physical door), pauses, and resets itself.

---

## Conclusion & Usage Summary

- **If you need zero-downtime integration**: Use the `FaceRecognitionWithAutoTagging` layer, utilizing `ConfigFile.json` to map real names to known datasets. The system scales instantly.
- **If you need rigorous security & accuracy**: Use `FaceRecognitionByTraining`. Run `python Register.py --persons <name>` to collect, attach `--train` to trigger the Deep Learning iteration, and run `--find` to test in real-time.
