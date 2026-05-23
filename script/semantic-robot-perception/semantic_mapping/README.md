# 🗺️ semantic_mapping

`semantic_mapping` is the sensor fusion and spatial mapping package of the ROS 2 mobile robot stack. It consumes 2D tracked bounding boxes from the vision pipeline, fuses them with 2D LIDAR scans via geometric ray casting, projects them into the global coordinate frame (`map`), and manages a persistent database of identified physical objects. The registered entities are published as interactive, multi-layered interactive `MarkerArray` elements for rich 3D visualization in RViz.

---

## ✨ Core Nodes

### 1️⃣ Camera-LiDAR Fusion Node (`camera_lidar_fusion_node.py`)
Computes the 3D position of tracked objects by fusing camera bearing projections with LIDAR range measurements.
- **Pinhole Camera Ray Projection**: Approximates the yaw direction of an object from its 2D pixel center using camera intrinsics ($f_x$, $c_x$).
- **LiDAR Depth Intersection**: Transforms the camera ray into the LIDAR reference frame (`laser_frame`) and extracts the corresponding range reading from the `/scan` topic.
- **Global Frame Transformation**: Projects the fused $X, Y$ coordinate into the `map` coordinate frame using active TF buffer transformations.
- **Estimated Heading (Yaw)**: Determines the yaw orientation of the object pointing towards the camera at the time of discovery.

### 2️⃣ Semantic Map Manager (`semantic_map_manager.py`)
Maintains a persistent database of registered objects in the world and handles semantic filtering.
- **Map-level Spatial Association**: Checks if a newly reported detection matches an existing database entry within a configurable spatial radius (e.g. `0.5m`).
- **Exponential Moving Average (EMA)**: Smooths sensory noise by updating localized positions with an EMA filter ($x_{new} = (1 - \alpha) \cdot x_{prev} + \alpha \cdot x_{incoming}$).
- **Filtered Categories**: Supports target class filtering via `config/config.yaml` to restrict mapping to a specific set of target classes (or registers all if left empty).
- **RViz 3D Marker Publishing**: Publishes a rich, three-layered `MarkerArray` (`semantic_map_markers`) that never expires, ensuring persistent rendering:
  1. **Cylinder Body**: Deterministically colored based on the object's class category hash.
  2. **Yaw Direction Arrow**: High-contrast gold arrow indicating the object's heading.
  3. **Text Floating Label**: Renders the class category name and the observation frequency count (e.g. `cardboard box (x42)`).

---

## 📡 ROS 2 Interface Specifications

### Camera-LiDAR Fusion Node
- **Subscriptions**:
  - `/camera/camera_info` (`sensor_msgs/msg/CameraInfo`): Camera calibration matrices.
  - `/scan` (`sensor_msgs/msg/LaserScan`): Laser range scan.
  - `tracked_detections` (`vision_interfaces/msg/TrackedBoundingBoxArray`): Tracked 2D bounding boxes.
- **Publishers**:
  - `fused_objects` (`vision_interfaces/msg/FusedObjectArray`): Fused 3D object positions and classes.

### Semantic Map Manager Node
- **Subscriptions**:
  - `fused_objects` (`vision_interfaces/msg/FusedObjectArray`): Fused object list.
- **Publishers**:
  - `semantic_map_markers` (`visualization_msgs/msg/MarkerArray`): Multi-layered visual markers for RViz representation.
- **Parameters**:
  - `config_file` (string, default: `''`): Path to the `config.yaml` specifying target classes.

---

## 🛠️ Configuration & Launching

### YAML Setup (`config/config.yaml`)
To restrict mapping to specific classes:
```yaml
# Configuration for Semantic Map Manager
target_classes: ["forklift", "rack"] # Leave empty [] to map all categories
```

### Combined Launch Stack (`launch/semantic_mapping.launch.py`)
This package includes a unified launcher that starts the entire perception and semantic mapping pipeline (detector, tracker, camera-lidar fusion, and semantic map manager) with optimized parameters:
```bash
ros2 launch semantic_mapping semantic_mapping.launch.py
```

---

## 📂 Directory Structure

```text
semantic_mapping/
├── config/
│   └── config.yaml          # Mapping filter configurations
├── launch/
│   └── semantic_mapping.launch.py  # Unified launcher for full perception + mapping stack
├── package.xml              # Package dependencies
├── resource/
├── setup.py                 # Python package installation
├── setup.cfg
├── test/
└── semantic_mapping/        # Source package folder
    ├── __init__.py
    ├── camera_lidar_fusion_node.py  # Camera-LiDAR depth fusion node
    └── semantic_map_manager.py      # Map manager and marker publisher node
```
