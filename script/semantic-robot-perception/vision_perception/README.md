# 👁️ vision_perception

`vision_perception` is a deep-learning-powered visual perception package for ROS 2. It wraps modern object detection backbones (Ultralytics YOLO and Open-Vocabulary YOLO-World) into high-efficiency ROS 2 nodes, and incorporates a spatial-centroid object tracker to provide stable class tracking across consecutive camera frames.

---

## ✨ Key Components

### 1️⃣ Object Detector Node (`object_detector_node.py`)
Loads a pre-trained YOLO/YOLO-World weights file and processes real-time camera image streams.
- **Support for Open-Vocabulary**: When using a YOLO-World model (e.g., `yolov8s-world.pt`), you can dynamically restrict detection classes to a custom list of text prompts (e.g. `cardboard box`, `wooden pallet`, `forklift`).
- **Publishes Bounding Box Arrays**: Outputs structured 2D bounding boxes.
- **Debug Visualizer**: Publishes a real-time overlay topic showing predicted bounding boxes and confidence scores drawn over the image frame.

### 2️⃣ Object Tracker Node (`object_tracker_node.py`)
Assigns persistent unique tracking IDs to detected bounding boxes using a fast spatial nearest-neighbor tracker.
- **Class-Consistent Sorting**: Filters association based on the object's class category so different elements are never cross-associated.
- **Centroid Matching**: Computes Euclidean distances between current detection centroids and active tracks.
- **Disappeared Tolerance**: Retains tracks for a customizable frame count if the object is temporarily occluded or missed.

---

## 📡 ROS 2 Interface Specifications

### Object Detector Node
- **Subscriptions**:
  - `/camera/image_raw` (`sensor_msgs/msg/Image`): Raw camera input stream.
- **Publishers**:
  - `detections` (`vision_interfaces/msg/BoundingBoxArray`): Detected 2D bounding boxes.
  - `detections_image` (`sensor_msgs/msg/Image`): Debug annotated image frame.
- **Parameters**:
  - `model_path` (string, default: `'yolov8s-world.pt'`): Path or model name of the YOLO weight model.
  - `confidence_threshold` (float, default: `0.1`): Minimum confidence score to output a detection.
  - `custom_classes` (array of strings, default: `['cardboard box', 'wooden pallet', 'rack', 'forklift']`): List of open-vocab prompt words when utilizing YOLO-World.

### Object Tracker Node
- **Subscriptions**:
  - `detections` (`vision_interfaces/msg/BoundingBoxArray`): Bounding boxes from the detector.
- **Publishers**:
  - `tracked_detections` (`vision_interfaces/msg/TrackedBoundingBoxArray`): Tracked bounding boxes with persistent tracking IDs.

---

## 🛠️ Usage & Operations

To run individual perception nodes:

```bash
# Run Object Detector Node
ros2 run vision_perception object_detector_node --ros-args -p model_path:=yolov8s-world.pt -p confidence_threshold:=0.1

# Run Object Tracker Node
ros2 run vision_perception object_tracker_node
```

## 📦 Directory Structure

```text
vision_perception/
├── resource/            # ROS 2 package resources
├── setup.py             # Python packaging script
├── setup.cfg            # Script configuration
├── package.xml          # Dependencies and package metadata
├── test/                # Linter and quality assurance files
└── vision_perception/   # Source python package
    ├── __init__.py
    ├── object_detector_node.py  # YOLO Object Detection Node
    └── object_tracker_node.py   # Centroid Tracker Node
```
