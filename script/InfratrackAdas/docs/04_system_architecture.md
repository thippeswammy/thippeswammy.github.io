# System Architecture — Detailed Reference

**Section:** 4 of Master Plan | **File:** `docs/04_system_architecture.md`

> ✅ **Architecture Status (2026-05-19): CONFIRMED — No changes required.** All nodes, topics, and launch structure are approved as-is. The `static_map_publisher_node` (see `07_coordinate_frames.md`) is addable to the launch file as a standalone visualization utility without affecting perception or audit logic.

---

## Full ROS 2 Node Graph

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          INFRATRACK ADAS — ROS 2 NODES                    │
└───────────────────────────────────────────────────────────────────────────┘

[rosbag2 playback]
  │
  ├──/camera/image_raw ──────────────────────────────────────────────┐
  │                                                                   │
  ├──/fix (NavSatFix GPS) ──────────────────────────┐               │
  │                                                  │               │
  ├──/imu/data ─────────────────────────────────────┤               │
  │                                                  ▼               │
  │                                    [robot_localization/ekf_node] │
  │                                          │ /odometry/filtered    │
  │                                          │                       │
  │                         [rtabmap/rtabmap]◄──────────────────────┤
  │                                │ /tf (map→odom→base_link)        │
  │                                │ /rtabmap/mapData                │
  │                                                                   │
  │                      ┌────────┴────────────────────────────────┐ │
  │                      │         INFRATRACK PERCEPTION           │ │
  │                      │                                         │ │
  │                      │  [object_detector_node] ◄───────────────┘ │
  │  /camera/image_raw ──┤      │ /infratrack/detections              │
  │                      │      ▼                                      │
  │                      │  [bytetrack_node]                           │
  │                      │      │ /infratrack/tracks                   │
  │                      │                                             │
  │                      │  [segmentation_node] ◄────────────────────┘
  │  /camera/image_raw ──┤      │ /infratrack/seg_mask                 │
  │                      │      ▼                                      │
  │                      │  [road_quality_node]                        │
  │                      │      │ /infratrack/surface_defects          │
  │                      │                                             │
  │                      │  [depth_node] ◄────────────────────────────┘
  │  /camera/image_raw ──┤      │ /infratrack/depth_map                │
  │                      │      ▼                                      │
  │                      │  [projection_node]                          │
  │                      │    (subscribes: detections + depth + /tf)   │
  │                      │      │ /infratrack/detected_entities_3d     │
  │                      │                                             │
  │                      │  [ocr_node] ◄──────────────────────────────┘
  │                      │    (subscribes: detections + image_raw)     │
  │                      │      │ /infratrack/sign_texts               │
  │                      └─────────────────────────────────────────────┘
  │
  ├──/fix ──────────────────────────────────────────────────────────────┐
  │                                                       [expected_state_generator_node]
  │                                                             │ /infratrack/expected_entities
  │                                                             │
  │          /infratrack/detected_entities_3d                   │
  │          /infratrack/expected_entities ─────────────────────┤
  │          /infratrack/sign_texts ────────────────────────────┤
  │                                               [discrepancy_engine_node]
  │                                                 │ /infratrack/alerts
  │                                                 │ /infratrack/tkg_updates
  │                                                 │ /infratrack/osm_candidates
  │                                                 │
  │                                        [tkg_node] (subscribes to tkg_updates)
  │                                                 │ /infratrack/tkg_state
  │
  │                         /infratrack/alerts (event trigger)
  │                                               [vlm_async_node]
  │                                                 │ /infratrack/vlm_reports
  │
  │          /infratrack/tracks
  │          /infratrack/surface_defects
  │          /infratrack/alerts
  │          /infratrack/vlm_reports
  │          /infratrack/tkg_state ────────────────► [report_generator_node]
                                                        │ (on rosbag end)
                                                        ├── audit_report.json
                                                        ├── route_map.html
                                                        └── osm_candidates.geojson
```

---

## Node Responsibility Summary

| Node | Package | Role |
|------|---------|------|
| `object_detector_node` | infratrack_perception | YOLOv8n detection |
| `bytetrack_node` | infratrack_perception | Multi-object tracking |
| `segmentation_node` | infratrack_perception | SegFormer road/sign segmentation |
| `depth_node` | infratrack_perception | MiDaS monocular depth |
| `projection_node` | infratrack_perception | 2D→3D coordinate projection |
| `ocr_node` | infratrack_perception | EasyOCR on sign crops |
| `road_quality_node` | infratrack_audit | Surface defect assessment |
| `expected_state_generator_node` | infratrack_audit | OSM + rules → ExpectedEntityList |
| `discrepancy_engine_node` | infratrack_audit | Match, score, FSM transitions |
| `tkg_node` | infratrack_tkg | Temporal Knowledge Graph manager |
| `vlm_async_node` | infratrack_audit | Async Qwen-VL-2B event handler |
| `report_generator_node` | infratrack_viz | JSON + Folium map output |
| `infratrack_watchdog_node` | infratrack_audit | System health monitor |
| `rtabmap` | (external package) | SLAM: map→odom transform |
| `ekf_node` | robot_localization | GPS+IMU fusion |
| `static_map_publisher_node` | infratrack_viz | One-time OSM→RViz static map layer (road network, signs, zones, bumps) — latched MarkerArray |

---

## Launch File Structure

```python
# infratrack_bringup/launch/infratrack_offline.launch.py
# Designed for rosbag playback (offline mode)

from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import ExecuteProcess

def generate_launch_description():
    return LaunchDescription([
        # 1. SLAM
        Node(package='rtabmap_ros', executable='rtabmap',
             parameters=[{'subscribe_depth': False,
                          'subscribe_rgb': True,
                          'frame_id': 'base_link'}]),

        # 2. EKF Localization
        Node(package='robot_localization', executable='ekf_node',
             parameters=['config/ekf.yaml']),

        # 3. Perception stack
        Node(package='infratrack_perception', executable='object_detector_node',
             parameters=[{'confidence_threshold': 0.35}]),
        Node(package='infratrack_perception', executable='depth_node'),
        Node(package='infratrack_perception', executable='segmentation_node'),
        Node(package='infratrack_perception', executable='projection_node'),
        Node(package='infratrack_perception', executable='ocr_node'),
        Node(package='infratrack_perception', executable='bytetrack_node'),

        # 4. Audit stack
        Node(package='infratrack_audit', executable='expected_state_generator_node',
             parameters=[{'osm_path': 'osm/bangalore.osm.pbf',
                          'rules_path': 'config/rules.yaml'}]),
        Node(package='infratrack_audit', executable='discrepancy_engine_node'),
        Node(package='infratrack_audit', executable='road_quality_node'),
        Node(package='infratrack_audit', executable='vlm_async_node',
             parameters=[{'model_path': 'Qwen/Qwen-VL-Chat',
                          'load_4bit': True}]),

        # 5. TKG + output
        Node(package='infratrack_tkg', executable='tkg_node'),
        Node(package='infratrack_viz', executable='report_generator_node'),

        # 6. Watchdog
        Node(package='infratrack_audit', executable='infratrack_watchdog_node'),
    ])
```
