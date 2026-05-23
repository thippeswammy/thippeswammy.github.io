# 📡 vision_interfaces

`vision_interfaces` is a custom ROS 2 message package designed to support the visual detection, tracking, and 3D spatial mapping pipeline. It defines structured message schemas that facilitate high-throughput communication between deep learning detection nodes, geometric sorting trackers, sensor fusion components, and the global semantic map manager.

---

## 📂 Message Definitions (`msg/`)

This package defines five main messages:

### 1️⃣ `BoundingBox.msg`
Represents a single 2D bounding box detection on an image plane.
```protobuf
int32 xmin          # Top-left pixel X coordinate
int32 ymin          # Top-left pixel Y coordinate
int32 xmax          # Bottom-right pixel X coordinate
int32 ymax          # Bottom-right pixel Y coordinate
float32 confidence  # Prediction confidence score [0.0, 1.0]
string class_name   # Identified class category (e.g., 'forklift', 'box')
```

### 2️⃣ `BoundingBoxArray.msg`
A container for a batch of 2D bounding boxes, indexed under a standard ROS 2 header for temporal sync.
```protobuf
std_msgs/Header header
BoundingBox[] boxes  # Array of all bounding box detections in this frame
```

### 3️⃣ `TrackedBoundingBox.msg`
Binds a 2D bounding box to a persistent unique tracking identifier across frames.
```protobuf
BoundingBox box     # Underlying 2D bounding box
int32 track_id      # Persistent track ID assigned by the sorting tracker
```

### 4️⃣ `TrackedBoundingBoxArray.msg`
A container for a batch of tracked bounding boxes, stamped for temporal synchronization.
```protobuf
std_msgs/Header header
TrackedBoundingBox[] boxes  # Array of all tracked objects in this frame
```

### 5️⃣ `FusedObject.msg`
Represents a physically localized object in 3D space after cross-referencing camera rays with LIDAR range measurements.
```protobuf
string class_name                # Object class category
int32 track_id                   # Track ID inherited from the perception node
geometry_msgs/Point position     # Localized 3D position in the reference frame
float64 yaw                      # Estimated heading orientation angle (radians)
```

### 6️⃣ `FusedObjectArray.msg`
A batch of 3D fused objects, typically stamped in the global coordinate frame (e.g., `map`).
```protobuf
std_msgs/Header header
FusedObject[] objects  # Array of all localized 3D fused objects
```

---

## 🛠️ Building & Compiling

Since this is a `CMake` package that generates C++ and Python ROS 2 message bindings, you compile it using `colcon` from the workspace root:

```bash
# Sourcing ROS 2 environment
source /opt/ros/humble/setup.bash

# Build only the interfaces package to generate code bindings first
colcon build --packages-select vision_interfaces

# Source the installation
source install/setup.bash
```

## 🔍 Verification

Once compiled, you can verify that the messages are successfully generated and registered in the ROS 2 system:

```bash
ros2 interface show vision_interfaces/msg/FusedObjectArray
```
