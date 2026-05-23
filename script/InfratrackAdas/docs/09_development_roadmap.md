# Development Roadmap — Detailed Reference

**Section:** 9 of Master Plan | **File:** `docs/09_development_roadmap.md`

---

## Roadmap Summary

```
Phase 0 ─► Phase 1 ─► Phase 2 ─► Phase 3 ─► Phase 4 ─► Phase 5 ─► Phase 6
Foundation  Perception  Spatial    VLM &      Output &   Phone     HPC
(Wk 1-2)   Core        Memory     Quality    Viz        Data      (Future)
            (Wk 3-5)   (Wk 6-8)   (Wk 9-11)  (Wk 12-14) (Wk 15+)
```

---

## Phase 0 — Foundation (Weeks 1–2)

### Goals
- All dependencies installed
- Datasets downloaded and verified
- Camera calibration done
- ROS 2 workspace building cleanly

### Tasks

#### Dataset Setup
```bash
# KITTI odometry (VO evaluation) - ~22 GB
wget https://s3.eu-central-1.amazonaws.com/avg-kitti/data_odometry_calib.zip
wget https://s3.eu-central-1.amazonaws.com/avg-kitti/data_odometry_gray.zip

# nuScenes mini (~4 GB) - register at nuscenes.org first
# Download via their AWS link after login

# Virtual KITTI 2 (~100 GB) - optional, for synthetic testing
# https://europe.naverlabs.com/research/computer-vision/proxy-virtual-worlds-vkitti-2/

# OSM data for test area
osmium extract --bbox=77.45,12.85,77.75,13.10 \
  india-latest.osm.pbf -o bangalore.osm.pbf
```

#### Camera Calibration
```bash
# For KITTI: use provided calib_cam_to_cam.txt
# For phone (Phase 5):
sudo apt install ros-humble-camera-calibration
ros2 run camera_calibration cameracalibrator \
  --size 9x6 --square 0.025 \
  --camera_name phone_cam \
  image:=/camera/image_raw
```

#### ROS 2 Workspace
```bash
mkdir -p ~/infratrack_ws/src
cd ~/infratrack_ws/src
# Create packages
ros2 pkg create infratrack_perception --build-type ament_python
ros2 pkg create infratrack_audit --build-type ament_python
ros2 pkg create infratrack_tkg --build-type ament_python
ros2 pkg create infratrack_viz --build-type ament_python

cd ~/infratrack_ws
colcon build --symlink-install
```

#### Dependencies
```bash
pip install pyrosm osmnx osmium networkx shapely \
            ultralytics easyocr evo \
            transformers bitsandbytes accelerate \
            folium geopandas pyproj
sudo apt install ros-humble-rtabmap-ros ros-humble-robot-localization \
                 ros-humble-tf2-tools ros-humble-tf2-geometry-msgs
```

**Phase 0 Done When:** `colcon build` succeeds, KITTI bag plays in RViz2, camera intrinsics saved.

---

## Phase 1 — Perception Core (Weeks 3–5)

### Goals
- YOLOv8n detecting cars/pedestrians on KITTI data
- SegFormer-B0 segmenting road surface
- MiDaS producing depth maps
- 2D→3D projection working (test with known object at known distance)
- ByteTrack IDs stable across 100+ frames

### Key Test: Projection Accuracy
```python
# Test: place a cone at exactly 5m in front of camera in Gazebo
# Measure detected distance vs. MiDaS estimated distance
# Target: error < 0.5m at 5m range, < 1.5m at 15m range
```

### Validation Commands
```bash
# Run on KITTI sequence 00
ros2 bag play kitti_seq00.db3 --rate 0.3   # slow playback for 4GB GPU
ros2 run infratrack_perception object_detector_node
ros2 run infratrack_perception depth_node
ros2 run infratrack_perception projection_node

# Check output
ros2 topic echo /infratrack/detections --once
ros2 topic echo /infratrack/depth_map --once
```

**Phase 1 Done When:** 3D projected positions of known objects are within 1.5m of ground truth.

---

## Phase 2 — Temporal Knowledge Graph (Weeks 6–8)

### Goals
- TKG ingesting detections and updating entity states
- OSM Expected State Generator producing ExpectedEntityList for each GPS tick
- State transitions: UNOBSERVED → CANDIDATE → VERIFIED working
- First MISSING alert firing correctly on a test case

### Test Case: Manually Remove a Stop Sign
```
1. Build a small Gazebo world with a stop sign
2. Record rosbag (sign visible)
3. Remove stop sign SDF model from world
4. Re-record rosbag (sign absent)
5. Run TKG on rosbag 2 with OSM that still expects the sign
6. Verify MISSING alert fires within 5 frames
```

### OSM Expected State Test
```python
# unit test: given GPS at known intersection, check correct sign is expected
def test_expected_state_at_school():
    gen = ExpectedStateGenerator("bangalore.osm.pbf", "rules.yaml")
    state = gen.query(lat=12.9716, lon=77.5946, heading=90.0)
    school_signs = [e for e in state if 'school' in e.sign_class]
    assert len(school_signs) > 0, "School zone warning expected near school"
```

**Phase 2 Done When:** TKG correctly transitions states on synthetic Gazebo data; MISSING alert fires reliably.

---

## Phase 3 — VLM & Road Quality (Weeks 9–11)

### Goals
- Qwen-VL-2B responding to event triggers (not per-frame)
- VLM output parsed into structured JSON reliably
- Road quality severity correlated with human ratings (r ≥ 0.70)

### VLM Latency Test
```bash
# Time a single VLM inference
python -c "
import time
from infratrack_audit.vlm_node import VLMNode
node = VLMNode()
start = time.time()
result = node.analyze_discrepancy(image_path='test.jpg', expected_sign='school_zone')
print(f'Latency: {time.time()-start:.2f}s')
print(result)
"
# Target: < 5 seconds on RTX 3050 with 4-bit quant
```

### Road Quality Annotation Workflow
```
1. Play rosbag at 0.1x speed
2. Pause at every defect → save frame + manual severity rating (1-5)
3. Store in CSV: frame_id, lat, lon, human_severity
4. Run VLM on same frames
5. Compute Pearson r(VLM score, human score)
```

**Phase 3 Done When:** VLM responds in < 5s and produces valid JSON; road quality correlation r ≥ 0.70.

---

## Phase 4 — Output & Visualization (Weeks 12–14)

### Goals
- Full JSON audit report generated from TKG at end of rosbag
- Folium HTML map showing all flagged locations
- OSM edit GeoJSON file ready for submission

### Folium Map Code Skeleton
```python
import folium
import json

def generate_route_map(tkg_geojson: str, gps_track: list, output_html: str):
    # Center map on route midpoint
    mid_lat = sum(p[0] for p in gps_track) / len(gps_track)
    mid_lon = sum(p[1] for p in gps_track) / len(gps_track)
    m = folium.Map(location=[mid_lat, mid_lon], zoom_start=15,
                   tiles='OpenStreetMap')

    # Draw GPS route
    folium.PolyLine(gps_track, color='blue', weight=3, opacity=0.7).add_to(m)

    # Add alert markers
    COLOR_MAP = {
        'MISSING': 'red', 'GHOST': 'orange',
        'VERIFIED': 'green', 'DAMAGED_ROAD': 'darkred'
    }
    with open(tkg_geojson) as f:
        data = json.load(f)
    for feat in data['features']:
        props = feat['properties']
        state = props.get('state', 'VERIFIED')
        lat, lon = feat['geometry']['coordinates'][1], feat['geometry']['coordinates'][0]
        popup = folium.Popup(
            f"<b>{props['sign_class']}</b><br>"
            f"State: {state}<br>"
            f"Confidence: {props['confidence']:.2f}<br>"
            f"{props.get('vlm_report', '')}",
            max_width=300
        )
        folium.Marker([lat, lon], popup=popup,
                      icon=folium.Icon(color=COLOR_MAP.get(state, 'blue'))).add_to(m)
    m.save(output_html)
    print(f"Map saved: {output_html}")
```

**Phase 4 Done When:** End-to-end rosbag → Folium map works on KITTI + Gazebo data.

---

## Phase 5 — Phone Data & Real World (Weeks 15+)

### Phone Streaming Setup Options

| Method | App | Latency | Quality |
|--------|-----|---------|---------|
| Wi-Fi ROS2 stream | `ROS2 Camera` (Android) | Low | Medium |
| Record + transfer | `Open Camera` (Android) | None (offline) | High |
| IP Webcam | `IP Webcam` (Android) | Medium | Medium |

**Recommended (offline approach):**
```bash
# On phone: record video + sensor log with "Sensor Logger" app
# Transfer to laptop
# Convert to rosbag2 using:
pip install rosbags
# custom script to pack video + IMU CSV → rosbag2
```

**Phase 5 Done When:** One real road recording produces a valid Folium audit map.

---

## Phase 6 — HPC Transition (Future / On Hold)

Steps documented in `docs/03_data_sources.md` (CARLA section) and the analysis artifact.  
Prerequisite: Local pipeline fully validated through Phase 5.
