# Face Recognition System

This repository implements a versatile Face Recognition System featuring two distinct subsystems for different use cases: **Dynamic Auto-Tagging** (One-Shot Learning) and **Static YOLO Classification** (Supervised Training).

---

### Demo

![Demo](./assets/demo.gif)

## 🚀 Project Overview

The project is divided into two independent subsystems based on their technical approach and hardware integration.

### 1. [FaceRecognitionWithAutoTagging (Dynamic)](./FaceRecognitionWithAutoTagging/README.md)

* **Purpose**: Instant recognition and auto-registration of unknown individuals using depth sensing.
* **Best for**: Zero-downtime environments, retail greetings, and dynamic security.
* **Key Features**: One-Shot learning, Intel RealSense Depth filtering, Kalman Filter tracking, and Text-to-Speech (TTS).
* **Technologies**: `face_recognition` (ResNet-128D), `dlib`, OpenCV, Intel RealSense SDK.

### 2. [FaceRecognitionByTraining (Static)](./FaceRecognitionByTraining/README.md)

* **Purpose**: High-accuracy face classification via traditional neural network training.
* **Best for**: Rigorous security, employee attendance, and physical access control.
* **Key Features**: Custom dataset collection, data augmentation, YOLOv8 fine-tuning, and Raspberry Pi integration.
* **Technologies**: YOLOv8 (Face Detection & Classification), Ultralytics, PyTorch.

---

## 🏗️ Project Architecture

The system's technical flow is detailed in the [Project Architecture](./brain/project_architecture.md) documentation.

### High-Level Technical Stack

* **Languages**: Python 3.9+

* **Computer Vision**: OpenCV, Ultralytics YOLOv8, `face_recognition`.
* **Hardware Integration**: Intel RealSense D400 series, Standard Webcams, Raspberry Pi (GPIO).
* **Tracking**: Kalman Filtering for smooth bounding boxes.
* **Audio**: `pyttsx3` for asynchronous speech feedback.

---

## 🛠️ Setup & Installation

### Prerequisites

* Python 3.9 or 3.10

* GPU with CUDA support (recommended for YOLO training)
* Intel RealSense SDK (required for Auto-Tagging subsystem)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/thippeswammy/FaceRecognition.git
   cd FaceRecognition
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

---

## 📂 Repository Structure

```bash
FaceRecognition/
├── FaceRecognitionByTraining/      # Static YOLO-based subsystem
├── FaceRecognitionWithAutoTagging/ # Dynamic Auto-Tagging subsystem
├── runs/                           # YOLO training runs and weights
└── requirements.txt                # Global dependencies
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss major changes.

## 📄 License

This project is licensed under the MIT License.
