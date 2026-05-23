# Data Sources & Knowledge Layer — Detailed Reference

**Section:** 3 of Master Plan | **File:** `docs/03_data_sources.md`

---

## ✅ CONFIRMED DATASET STRATEGY (Decision — 2026-05-19)

> **Primary datasets chosen:** **Virtual KITTI 2 (VKITTI2)** for synthetic, photo-realistic pre-labeled data  
> **AND** **KITTI Raw Data** (`https://www.cvlibs.net/datasets/kitti/raw_data.php`) for real-world sequences.
>
> **Reason:** The primary goal is to feed images into a Vision-Language Model (VLM) and/or advanced object detection network. These models require photorealistic, richly annotated image data — not Gazebo polygon meshes.
>
> **OSM data is still required** in this plan — it serves as the **ground truth knowledge layer** (expected sign positions, speed limits, zone definitions) that the discrepancy engine compares against detected perception output. OSM is used for query + audit logic, **not** as the image rendering source.

---

## 3.1 OSM Layer

### Downloading OSM Data
```bash
# Install osmium
sudo apt install osmium-tool

# Download .pbf for a city (example: Bangalore)
wget https://download.geofabrik.de/asia/india/southern-zone-latest.osm.pbf

# Clip to bounding box (speeds up all queries)
osmium extract --bbox=77.45,12.85,77.75,13.10 \
  southern-zone-latest.osm.pbf -o bangalore.osm.pbf

# Convert to GeoJSON for inspection
osmium export bangalore.osm.pbf -o bangalore.geojson
```

### Key OSM Tags Used by InfraTrack

| Tag | Values | Use |
|-----|--------|-----|
| `highway` | motorway, primary, residential, service | Road class → surface standard |
| `maxspeed` | 30, 50, 60, 80, 100 | Expected speed limit sign value |
| `traffic_calming` | bump, hump, cushion, table | Expected speed bump location |
| `crossing` | zebra, traffic_signals, uncontrolled | Expected pedestrian crossing |
| `highway=traffic_signals` | node tag | Expected traffic light location |
| `highway=stop` | node tag | Expected stop sign |
| `highway=give_way` | node tag | Expected give-way sign |
| `traffic_sign` | IN:W301, IN:R001, ... | India-specific sign codes |
| `amenity` | school, hospital, clinic | Zone trigger |
| `surface` | asphalt, concrete, unpaved | Road surface type expectation |
| `oneway` | yes, -1 | Wrong-way driving detection |
| `junction` | roundabout, traffic_signals | Mandatory give-way at roundabout arms |

### Python Access (pyrosm + osmnx)
```python
import pyrosm
import osmnx as ox

# Load OSM data
osm = pyrosm.OSM("bangalore.osm.pbf")

# Get road network
drive_net = osm.get_network(network_type="driving")

# Get POIs (schools, hospitals)
pois = osm.get_pois(custom_filter={"amenity": ["school", "hospital"]})

# Build routable networkx graph
G = ox.graph_from_place("Bengaluru, India", network_type="drive")
```

---

## 3.2 Municipal Rules Layer

### File Format: `config/rules.yaml`
```yaml
city: bangalore
version: "2026-01"

zones:
  school_zone:
    speed_limit_kmh: 25
    active_hours: "08:00-18:00"
    active_days: [Mon, Tue, Wed, Thu, Fri, Sat]
    mandatory_signs:
      - type: school_zone_warning
        placement: "≤100m before school gate"
        both_directions: true
      - type: speed_limit_25
        placement: "at school gate entry"
    surface_standard: HIGHEST
    no_horn: false

  hospital_zone:
    speed_limit_kmh: 25
    active_hours: "00:00-23:59"
    active_days: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    mandatory_signs:
      - type: hospital_zone_warning
        placement: "≤50m before entrance"
      - type: speed_limit_25
        placement: "at entrance"
      - type: no_horn
        placement: "at entrance"
    surface_standard: HIGHEST
    no_horn: true

speed_bump_rules:
  warning_sign_distance_m: 30
  mandatory: true
  sign_type: speed_bump_warning  # IN:W301

roundabout_rules:
  mandatory_give_way: true
  sign_at_every_arm: true

surface_standards:
  HIGHEST:
    max_pothole_depth_cm: 2
    max_crack_area_pct: 5
  HIGH:
    max_pothole_depth_cm: 5
    max_crack_area_pct: 15
  MEDIUM:
    max_pothole_depth_cm: 8
    max_crack_area_pct: 25
  BASIC:
    max_pothole_depth_cm: 15
    max_crack_area_pct: 40
```

---

## 3.3 Synthetic / Public Dataset Layer

### KITTI Dataset
- **URL:** https://www.cvlibs.net/datasets/kitti/
- **Used for:** VO evaluation, object detection, depth estimation
- **Sequences for InfraTrack dev:**
  - `odometry/`: sequences 00–10 for VO testing (`evo_ape` against ground truth)
  - `object/`: 2D/3D object annotations for detection mAP evaluation
  - `depth/`: stereo-derived depth ground truth for MiDaS validation
- **Calibration files:** already provided — use directly for TF2 setup

### nuScenes Dataset
- **URL:** https://www.nuscenes.org/
- **Used for:** Multi-object tracking (MOTA/MOTP), behavioral monitoring
- **Download:** `nuScenes-mini` (~4 GB) for development; full v1.0 (~300 GB) for eval
- **Python:** `pip install nuscenes-devkit`

### ✅ Virtual KITTI 2 (VKITTI2) — PRIMARY Synthetic Dataset (CONFIRMED)
- **URL:** https://europe.naverlabs.com/research/computer-vision/proxy-virtual-worlds-vkitti-2/
- **What it is:** Photo-realistic synthetic dataset cloned from KITTI with full GT labels
- **Advantages over CARLA:** Pre-recorded (no GPU needed to generate), ground truth depth + flow + segmentation
- **Download size:** ~100 GB (or use individual scene subsets ~5–15 GB)
- **Use:** Feed directly into YOLOv8 / SegFormer / MiDaS / VLM pipelines for evaluation and fine-tuning
- **Ground truth labels included:** Depth, optical flow, instance segmentation, object bounding boxes, camera poses
- **OSM pairing:** OSM is used as the audit knowledge layer (expected sign/bump locations). VKITTI2 provides the image sequence; OSM provides what *should* be there.

### ✅ KITTI Raw Data — PRIMARY Real-World Dataset (CONFIRMED)
- **URL:** https://www.cvlibs.net/datasets/kitti/raw_data.php
- **What it is:** Real driving sequences in Germany with stereo camera, Velodyne LiDAR, IMU, GPS
- **Use:** Real-world visual inputs for object detection model evaluation and VO testing
- **Sequences:** City (residential/urban), road (highway), campus, person (pedestrian)
- **Download tool:**
  ```bash
  # Download a specific raw sequence (e.g., 2011_09_26 drive 0001)
  wget https://s3.eu-central-1.amazonaws.com/avg-kitti/raw_data/2011_09_26_drive_0001/2011_09_26_drive_0001_sync.zip
  unzip 2011_09_26_drive_0001_sync.zip
  ```
- **OSM pairing:** KITTI raw sequences are GPS-tagged (Karlsruhe, Germany). Download OSM data for that bounding box to build the expected state layer:
  ```bash
  osmium extract --bbox=8.35,49.00,8.50,49.10 germany-latest.osm.pbf -o karlsruhe_kitti.osm.pbf
  ```

### Waymo Open Dataset (future)
- **URL:** https://waymo.com/open/
- **Used for:** High-quality 3D annotations for validation
- **Note:** Requires Google Cloud access; use only in HPC phase

---

## 3.4 Simulation Engine Decision

### CARLA (Requested → Requires ~8GB VRAM)
| Requirement | Your System | Status |
|-------------|-------------|--------|
| VRAM | 8–12 GB | ❌ RTX 3050 = 4GB |
| RAM | 16 GB | ✅ |
| CUDA | 11.x/12.x | ✅ |
| **Verdict** | | **Put on hold; run on HPC A100** |

### ⚠️ Gazebo + OSM World — KEPT WITH REMARK (Limited Use Only)

> **⚠️ ARCHITECTURAL REMARK (2026-05-19):**
> The primary goal of this pipeline is to feed images into a **Vision-Language Model (VLM)** or an **advanced object detection network** (YOLOv8, SegFormer, MiDaS, Qwen-VL). These models were trained on **photorealistic real-world images**. Relying solely on Gazebo with basic OSM mesh geometry to generate camera frames for these models will very likely produce:
> - Poor/zero detection results (domain gap between Gazebo textures and real road imagery)
> - Misleading evaluation metrics
> - Wasted development time debugging model failures that are actually a data quality problem
>
> **Therefore:** Gazebo + OSM world is **not recommended as the primary image data source** for VLM/detection model evaluation.
>
> **Gazebo IS still valid for:**
> - ROS 2 node integration testing (topic I/O, TF2 transforms, rosbag record/play)
> - SLAM / odometry pipeline testing (RTAB-Map, EKF)
> - Robot controller testing (separate from InfraTrack perception)
> - Publishing a synthetic `/fix` GPS stream and `/camera/image_raw` for pipeline smoke tests
>
> **Primary image data must come from:** VKITTI2, KITTI Raw, or phone-recorded rosbags.

You already use Gazebo. It runs on 4GB VRAM.

**Strategy (if using Gazebo for integration smoke tests only):**
1. Export OSM area as `.osm` XML
2. Convert to road mesh using `osm2world` or `osm2xodr`
3. Import into Gazebo as a custom world
4. Place signs, speed bumps, crossings as SDF models
5. Record rosbag from Gazebo camera with ground truth poses — use for TF2 + SLAM testing, NOT for VLM/detection model evaluation

**Tools:**
```bash
# Export OSM to SDF world (experimental)
pip install osm2world   # Java-based, outputs OBJ/COLLADA
# Then import COLLADA into Gazebo world

# Or: use lanelet2 for HD road map in Gazebo
sudo apt install ros-humble-lanelet2
```

**Limitation (ORIGINAL NOTE — preserved):** Gazebo world textures won't look as realistic as CARLA. But the geometry and ground truth are sufficient for pipeline testing.

**Updated Summary Table:**

| Data Source | Image Quality | GT Labels | VLM/Detection OK | OSM Pairing | Use Case |
|-------------|--------------|-----------|------------------|-------------|----------|
| VKITTI2 | ✅ Photorealistic | ✅ Full | ✅ Yes | ✅ Karlsruhe OSM | Primary eval |
| KITTI Raw | ✅ Real world | ✅ Calibrated | ✅ Yes | ✅ Karlsruhe OSM | Primary eval |
| Gazebo + OSM | ❌ Basic polygon | Partial | ❌ No (domain gap) | ✅ Any city | Integration only |
| CARLA | ✅ Photorealistic | ✅ Full | ✅ Yes | ✅ Any city | HPC phase only |
