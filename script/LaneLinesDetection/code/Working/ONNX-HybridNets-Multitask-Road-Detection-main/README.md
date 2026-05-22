# 🏎️ GPU-Accelerated HybridNets Multi-Task Road Detection (ONNX)

An optimized, stabilized, and extended end-to-end computer vision pipeline designed for autonomous driving scene understanding. This repository performs **real-time object detection, driveable road area segmentation, and lane line detection simultaneously** using the HybridNets multi-task network executed via ONNX Runtime with CUDA acceleration.

Additionally, this repository has been extended to support **auxiliary YOLO models** (for pedestrian and crosswalk detection), **multi-panel dashboard rendering**, and a **ground-truth validation framework calculating frame-by-frame Intersection over Union (IoU) metrics**.

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-blue.svg?style=for-the-badge&logo=python&logoColor=white" alt="Python Version"/>
  <img src="https://img.shields.io/badge/ONNX_Runtime-v1.16+-orange.svg?style=for-the-badge&logo=onnx&logoColor=white" alt="ONNX Runtime"/>
  <img src="https://img.shields.io/badge/CUDA-11.8+-green.svg?style=for-the-badge&logo=nvidia&logoColor=white" alt="CUDA Version"/>
  <img src="https://img.shields.io/badge/OpenCV-4.5+-red.svg?style=for-the-badge&logo=opencv&logoColor=white" alt="OpenCV"/>
  <img src="https://img.shields.io/badge/Open_Source-Flagship-brightgreen.svg?style=for-the-badge" alt="Open Source"/>
</p>

---

## 🎥 Real-Time Multi-Task Showcase

Experience the real-time execution of our flagship **HybridNets Multi-Task** perception pipeline. Below are the actual demo videos showing the unified tracking and multi-panel diagnostic feeds running side-by-side:

<div align="center">
  <table width="100%" style="max-width: 1000px; border-collapse: collapse; border: none;">
    <tr style="border: none;">
      <td width="50%" align="center" style="border: none; padding: 12px; vertical-align: top;">
        <h3>🏙️ City Driving</h3>
        <p><em>Dense Traffic & Lane Shifting</em></p>
        <img src="../../../showcase_gifs/Detected15.gif" width="100%" style="max-width: 100%; border-radius: 8px;" alt="City Driving Dashboard Preview"/>
        <br/><br/>
        <a href="../../../showcase_gifs/Detected15.gif">📁 View Animated GIF</a> | 
        <a href="OutputVideo/New folder (3)/Detected15.mp4">🎥 Play Full Video</a>
      </td>
      <td width="50%" align="center" style="border: none; padding: 12px; vertical-align: top;">
        <h3>🌲 Forest Road</h3>
        <p><em>Curves, Shadows & Lighting Shifts</em></p>
        <img src="../../../showcase_gifs/all2.gif" width="100%" style="max-width: 100%; border-radius: 8px;" alt="Forest Road Multi-Panel Preview"/>
        <br/><br/>
        <a href="../../../showcase_gifs/all2.gif">📁 View Animated GIF</a> | 
        <a href="OutputVideo/New folder (2)/all2.mp4">🎥 Play Full Video</a>
      </td>
    </tr>
  </table>
</div>

---

## 🚀 Key Stabilizations & Enhancements

> [!IMPORTANT]
> The original repository has been heavily refactored, stabilized, and upgraded to provide production-grade autonomous capabilities:

1. **⚡ CUDA-Accelerated Real-Time Execution**:
   - Integrated `CUDAExecutionProvider` via ONNX Runtime.
   - Optimized graph execution settings (`optimized_model`) to achieve stable, high-performance **60+ FPS real-time processing** on NVIDIA GPU hardware.
2. **🎛️ 4-Quadrant Multi-Panel Visualization**:
   - Developed `AddingSubImages` to combine four separate diagnostic feeds into a single high-resolution video composite:
     - **Top-Left (TL)**: **Segmented Road & Lane Marks Overlay** (the driveable road area segmented in green and lane markers in blue, blended over the original frame with transparency and object bounding boxes).
     - **Top-Right (TR)**: **Segmented Lane Boundaries Feed** (lane line segmentations color-mapped and blended directly over the original camera frame).
     - **Bottom-Left (BL)**: **Final Multi-Task Perception Feed** (original video frames overlaid with fitted curved lane boundaries plotted as highly precise blue and red circles).
     - **Bottom-Right (BR)**: **Real-Time Lane Coordinate & Slope Plotter** (a graphical diagnostic chart plotting left and right lane coordinates over a timeline).
3. **📊 IoU Metric Validation Framework**:
   - Implemented `calculate_iou` to compare predicted road masks against pixel-level ground truth masks.
   - Outputs true-positive (green), false-negative (red), and false-positive (blue) visual overlays.
   - Automatically benchmarks performance metrics, exporting them directly to `.xlsx` and `Summary.xlsx` for comprehensive model analysis.
4. **🧠 YOLO Sensor Fusion**:
   - Fused auxiliary YOLO models (`ZebraCrossingTrain.pt` and `PersonTrain.pt`) into the pipeline.
   - Enables simultaneous detection of crosswalks (marked in cyan) and pedestrians (marked in magenta) alongside road/lane markings for advanced ADAS safety auditing.

---

## 📂 Project Directory Structure

```
.
├── hybridnets
│   ├── hybridnets.py           # Core HybridNets network parser
│   └── utils22.py              # Utility helper functions
├── models
│   ├── hybridnets_384x512      # Folder containing hybridnets.onnx & anchors.npy
│   ├── ZebraCrossingTrain.pt   # YOLO auxiliary crosswalk detection weights
│   └── PersonTrain.pt          # YOLO auxiliary pedestrian detection weights
├── OutputVideo
│   ├── DetectedX.avi           # Unified multi-task tracking video outputs
│   ├── New folder (2)          # Multi-view composite panels (allX.mp4 / allX.avi)
│   └── New folder (3)          # Single-panel output video clips (DetectedX.mp4 / DetectedX.avi)
├── Outputs                     # Pixel overlay debug images directory
├── image_road_detection.py      # Multi-task detection on static images
├── video_road_detection.py      # Core video processing pipeline script
├── video_bird_eye_view_road_detection.py # BEV projection pipeline script
└── requirements.txt            # System dependencies manifest
```

---

## 📦 Requirements & Installation

Configure your environment using the commands below:

```bash
# Clone or navigate to the repository
cd code/Working/ONNX-HybridNets-Multitask-Road-Detection-main

# Install dependencies
pip install -r requirements.txt
pip install youtube_dl
```

---

## 🧠 ONNX & Pretrained Models

1. **HybridNets ONNX Model**: 
   - The converted ONNX model is sourced from [PINTO0309's Model Zoo](https://github.com/PINTO0309/PINTO_model_zoo/tree/main/276_HybridNets).
   - Download the model and anchors files, saving them into the **`models/`** folder:
     - `models/hybridnets_384x512/hybridnets_384x512.onnx`
     - `models/hybridnets_384x512/anchors_384x512.npy`
2. **YOLO Auxiliary Weights**:
   - Save `ZebraCrossingTrain.pt` and `PersonTrain.pt` under the `models/` directory to enable pedestrian/crosswalk detection.

---

## 🛠️ How to Run

Execute the pipeline scripts below for different inference modes:

### 1. Multi-Task Video Inference (Multi-Panel Diagnostic Mode)
Processes video files, displays live visualizations of the 4 quadrants, and writes the output directly to the `OutputVideo/` folder:
```bash
python video_road_detection.py
```

### 2. Single Image Multi-Task Detection
```bash
python image_road_detection.py
```

### 3. Video Bird's Eye View (BEV) Projection
```bash
python video_bird_eye_view_road_detection.py
```
> [!TIP]
> **BEV Horizon Alignment**: For custom video sources, set `horizon_points=None` in the script to trigger manual selection mode. Click on two horizon points on the interactive horizontal line, and copy the printed coordinates back into the `horizon_points` variable for next runs.

---

## 📈 Evaluation & Results Visualizations

The validation framework evaluates the model's accuracy on a frame-by-frame basis, providing a color-coded performance overlay:

* **🟩 Green Pixels**: True Positives (perfect segment matches).
* **🟥 Red Pixels**: False Negatives (missed road regions).
* **🟦 Blue Pixels**: False Positives (over-segmented regions).

```
=========================================================================
Frame Numbers = 125
Average IoU: 0.8942
Processing Speed: 62.4 Img/s (CUDA Acceleration Enabled)
=========================================================================
```

---

## 🔗 References & Credits

All individual pipelines are developed on top of brilliant open-source research and community implementations. We express our gratitude to the original creators:

* **Original Multi-Task PyTorch Model**: [datvuthanh/HybridNets](https://github.com/datvuthanh/HybridNets) (Vu Thanh Dat)
* **ONNX Implementation & Inference**: [ibaiGorordo/ONNX-HybridNets-Multitask-Road-Detection](https://github.com/ibaiGorordo/ONNX-HybridNets-Multitask-Road-Detection) (Ibai Gorordo)
* **ONNX Model Zoo Conversion**: [PINTO0309 Model Zoo](https://github.com/PINTO0309/PINTO_model_zoo) (PINTO0309)
* **Model Conversion Utility**: [openvino2tensorflow](https://github.com/PINTO0309/openvino2tensorflow)
* **Non-Maximum Suppression Optimization**: [Fast NMS Algorithm](https://python-ai-learn.com/2021/02/14/nmsfast/)
* **Original Research Paper**: [HybridNets: End-to-End Multi-Task Self-Driving Network (arXiv:2203.09035)](https://arxiv.org/abs/2203.09035)
