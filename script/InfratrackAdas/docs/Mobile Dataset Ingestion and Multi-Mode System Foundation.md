# Implementation Plan — Mobile Dataset Ingestion and Multi-Mode System Foundation

We will establish a plan to ingest and synchronize the mobile phone dataset (`Tb_Ciercle-2026-05-15_08-37-04`) into a universal ROS 2 rosbag, define standard input modes (`mobile`, `kitti_real`, `kitti_synthetic`), and initialize the workspace environment.

## User Review Required

Documenting key architectural decisions and assumptions:
- **Bag Format Choice:** We will design a Python packaging script (`infratrack_bag_packager.py`) that uses the `rosbag2_py` library (standard in ROS 2 Humble) to pack the CSV and camera JPEGs into standard ROS 2 rosbag format. If any ROS 2 library constraints arise, it will fallback gracefully to directly writing to a SQLite3 `.db3` file using the standard `rosbag2` SQLite storage schema.
- **IMU and GPS Frequencies:** The accelerometer, gyroscope, and orientation tables are recorded at high frequency (~100 Hz), whereas GPS (`Location.csv`) is logged at low frequency (~1 Hz). The packager script will act as a chronological scheduler ("True-Time Sequential Packing"), ordering every single message by its timestamp before writing it, ensuring optimal playback compatibility without lag or frame drops.
- **Unified Modes Configuration:** We will define a `mode` parameter in the system architecture to handle differences between `mobile`, `kitti_real`, and `kitti_synthetic`. In `mobile` mode, the projection node will dynamically adjust to monocular depth estimations (MiDaS/DepthAnything) and use the phone's coordinate frames in the TF2 frame tree.

> [!IMPORTANT]
> To verify and run the packaged rosbag, standard ROS 2 Humble commands will be used. Ensure your ROS 2 environment is sourced before running these commands in the next execution phase.

---

## Open Questions

> [!NOTE]
> There are no major blockers, but please confirm the following preferences if you have any:
> 1. **Image Format in Bag:** Do you prefer compiling frames into `/camera/image_raw` as standard uncompressed images (`sensor_msgs/msg/Image`), or `/camera/image_raw/compressed` (`sensor_msgs/msg/CompressedImage`)? Compressed format keeps the database file size extremely lightweight (~15MB vs ~150MB) and prevents disk bottlenecks on local RTX 3050 GPUs.
> 2. **GPS Accuracy Bounds:** Your collected GPS data shows an average `horizontalAccuracy` between 3.7m and 20.4m. We will configure a dynamic covariance matrix in `/fix` topic based on these accuracy columns to prevent the EKF node from drifting during low-satellite-lock segments.

---

## Proposed Changes

### Workspace Packaging & Sync Component

#### [NEW] [infratrack_bag_packager.py](file:///home/thippe/workspaces/ws/InfratrackAdas/dataset/infratrack_bag_packager.py)
Creates a Python utility script to parse the Sensor Logger raw CSV files and camera JPG frames, synchronizing them chronologically and packing them into a ROS 2 Humbe-compatible `.db3` (sqlite3 backend) or `.mcap` rosbag.
- **Fuses Sensors:** Reads `Accelerometer.csv`, `Gyroscope.csv`, and `Orientation.csv` to compile unified `sensor_msgs/msg/Imu` messages.
- **GPS Fixes:** Maps `Location.csv` rows to `sensor_msgs/msg/NavSatFix` messages, using dynamic horizontal accuracy values for covariance.
- **Camera Frames:** Maps sequential milliseconds JPEG filenames to `sensor_msgs/msg/CompressedImage` or `sensor_msgs/msg/Image`.
- **Chronological Sorting:** Implements "True-Time Sequential Packing" to keep data synchronized regardless of source rates.

#### [MODIFY] [project.md](file:///home/thippe/workspaces/ws/InfratrackAdas/project.md)
Updates the Master Project Plan to include documentation of the mobile dataset structure, the packaging pipeline, and the input mode definition.

#### [NEW] [infratrack_ws/src](file:///home/thippe/workspaces/ws/InfratrackAdas/infratrack_ws/src)
Initializes the ROS 2 workspace structure:
- `infratrack_perception/`: YOLOv8 detection, SegFormer segmentation, MiDaS depth nodes.
- `infratrack_audit/`: Discrepancy detector and async VLM nodes.
- `infratrack_tkg/`: Temporal Knowledge Graph nodes.
- `infratrack_viz/`: Folium route mapper and visualization nodes.

---

## Verification Plan

### Automated Tests
- Run `infratrack_bag_packager.py` pointing to `Tb_Ciercle-2026-05-15_08-37-04` directory.
- Verify that a valid ROS 2 bag is generated in the output directory.
- Run `ros2 bag info <bag_name>` to verify that topics (`/fix`, `/imu/data`, `/camera/image_raw`) are successfully created and populated.
- Play the bag using `ros2 bag play <bag_name> --rate 1.0` and monitor topic statistics using `ros2 topic hz` and `ros2 topic echo`.

### Manual Verification
- Render raw topic metrics to verify sequential frame synchronization and timestamp consistency.
