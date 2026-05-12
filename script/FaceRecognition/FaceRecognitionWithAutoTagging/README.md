# Face Recognition With Auto-Tagging (Dynamic)

This subsystem provides a high-speed, zero-training registration system. It uses **One-Shot Learning** to recognize faces instantly and features an **Auto-Tagging** engine that leverages depth data from an Intel RealSense camera to register new users dynamically.

---

## 🛠️ Key Features
- **Auto-Tagging**: Automatically registers unknown individuals as `personX` when they come within a specific depth range (e.g., 0.5 meters).
- **One-Shot Learning**: Uses 128-dimensional biometric encodings to match faces against a database without needing a neural network training loop.
- **Intel RealSense Integration**: Utilizes RGB + Depth alignment for distance-based logic.
- **Kalman Filter Tracking**: Ensures smooth, non-jittery bounding boxes for a premium UI experience.
- **Voice Feedback**: Asynchronous Text-to-Speech (TTS) greetings for recognized individuals.

---

## 🚀 How It Works

### 1. Registration Logic
The system loads baseline images from `known_faces/` and previously auto-tagged images from `AutoTagKnow/`. It calculates their 128D encodings on startup.

### 2. Auto-Tagging Engine
When an unknown face is detected:
1. The system checks the **Depth (Z)** distance from the camera.
2. If the person is within the threshold defined in `ConfigFile.json` (e.g., 0.6m), it captures their face crop.
3. The crop is saved to `AutoTagKnow/` and the person is instantly added to the runtime memory.

---

## 🎮 Usage

### Primary Entry Point (RealSense)
Run this script for the full experience including depth-sensing and auto-tagging:
```bash
python recognizeByIntelRealSenseWithAutoTage.py
```

### Standard Recognition
For standard Intel RealSense recognition without auto-tagging:
```bash
python recognizeByIntelRealSense.py
```

### Webcam Support
For basic recognition using a standard webcam (No depth/auto-tagging):
```bash
python recognize.py
```

---

## 📂 Script Definitions

- **`recognizeByIntelRealSenseWithAutoTage.py`**: The flagship script implementing the full pipeline.
- **`recognizeByIntelRealSense.py`**: Standard recognition using depth for ROI but no new registration.
- **`recognize.py`**: Lightweight webcam-based inference.
- **`ConfigFile.json`**: Configuration for confidence thresholds, depth limits, and greeting messages.

## ⚙️ Configuration (`ConfigFile.json`)

The system's behavior can be tuned through `ConfigFile.json`. Key parameters include:

- **`ENABLE_AUTO_TAG`**: Set to `"True"` to enable the automatic registration of unknown individuals.
- **`DepthCon`**: The distance threshold (in meters) for auto-tagging. People must be within this range to be registered.
- **`Conf`**: Recognition confidence threshold (Euclidean distance). Lower values are stricter.
- **`reset_timing`**: Seconds before the system "resets" its speech queue for a specific person to avoid greeting spam.
- **`welcome_messages`**: A mapping of names to custom text-to-speech greetings.

---

## ⚙️ Technical Specifications
- **Face Detection**: HOG (Histogram of Oriented Gradients) with Linear SVM.
- **Face Encoding**: ResNet-based CNN trained on 3M+ images to produce 128D vectors.
- **Comparison**: Euclidean distance (Match threshold < 0.6).
- **Tracking**: 4-state OpenCV Kalman Filter.

---

## 📁 Directory Structure
```bash
FaceRecognitionWithAutoTagging/
├── AutoTagKnow/      # Dynamically registered face images
├── known_faces/      # Manually enrolled face images
├── ConfigFile.json   # System thresholds and parameters
└── ...
```

[Return to Root README](../README.md)