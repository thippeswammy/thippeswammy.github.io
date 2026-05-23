# InfraTrack ADAS — Master Project Plan

> **This is the master index.** Each section links to a detailed `.md` file in [`docs/`](./docs/).

## 📁 Documentation Tree

| File | Description |
|------|-------------|
| 📄 **[static_infrastructure_audit.md](./docs/static_infrastructure_audit.md)** | Full audit design — OSM+rules tree, algorithm, sign matching, FSM, output schemas |
| 📄 **[03_data_sources.md](./docs/03_data_sources.md)** | OSM download & tags, municipal rules YAML, KITTI/nuScenes datasets, Gazebo simulation |
| 📄 **[04_system_architecture.md](./docs/04_system_architecture.md)** | Full ROS 2 node graph, node responsibility table, launch file skeleton |
| 📄 **[05_temporal_knowledge_graph.md](./docs/05_temporal_knowledge_graph.md)** | TKG node/edge schema, NetworkX vs Neo4j, temporal fusion algorithm, drift correction |
| 📄 **[06_module_specification.md](./docs/06_module_specification.md)** | Per-model config, VRAM budget, ByteTrack, VLM prompt templates, install commands |
| 📄 **[07_coordinate_frames.md](./docs/07_coordinate_frames.md)** | TF2 frame tree, GPS anchor conversion code, 2D→3D projection code, KITTI calibration |
| 📄 **[08_failure_modes.md](./docs/08_failure_modes.md)** | 6 failure types, degraded mode state diagram, watchdog node implementation |
| 📄 **[09_development_roadmap.md](./docs/09_development_roadmap.md)** | Phase-by-phase tasks with exact commands and done-criteria |
| 📄 **[10_evaluation_metrics.md](./docs/10_evaluation_metrics.md)** | mAP, MOTA, ATE, Precision/Recall targets, evaluation commands, combined eval script |

**Version:** 2.0 | **Last Updated:** 2026-05-17 | **Status:** In Planning

---

## 1. Formal Project Objective

**InfraTrack ADAS** is a monocular-camera-first, offline-capable road intelligence system that performs three parallel jobs:

| Job | Description |
|-----|-------------|
| **Static Infrastructure Audit** | Compares *what should exist on this road* (from OSM + municipal rules + zone definitions) against *what the camera sees* (semantic segmentation + monocular depth). Flags missing signs, phantom signs ("ghost signage"), wrong signs, and zone violations. |
| **Road Quality Assessment** | Detects road surface defects (potholes, cracks, surface degradation) and assesses severity using VLM analysis, cross-referenced against municipal maintenance rules and zone standards. |
| **Dynamic Behavioral Monitoring** | Tracks every vehicle and pedestrian in the scene using multi-class object detection + a bounding-box tracker. Computes relative velocity, trajectory prediction, and flags anomalous driving behaviors. |

All three jobs feed into a **Temporal Knowledge Graph** — a time-indexed, graph-structured persistent register of all observed entities, their states, and their relationships. This graph grows over the duration of a drive and is the core data product of the system.

**Final Output:** A structured audit report (JSON + text) + a Google Maps-style visualization of the full route with all flagged infrastructure issues, delivered offline. Reports are intended for:
1. **Government / Municipal bodies** — for infrastructure maintenance and zone compliance
2. **OpenStreetMap** — to update missing or incorrect map data
3. **Google Maps** (future) — as a verified ground-truth correction feed

---

## 2. Confirmed Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Camera | Monocular (phone) | No stereo available; use MiDaS/DepthAnything for depth |
| GPS | Phone GPS (~5–15m accuracy) | No external RTK; design OSM tolerance buffer accordingly |
| Processing mode | **Offline (rosbag first)** | Record data, process at desk; online mode is a future phase |
| Compute (local) | ASUS VivoBook, RTX 3050 4GB VRAM | Run as much as possible locally; heavy models → HPC |
| Compute (HPC) | A100 cluster | For large VLMs, global pose graph optimization |
| Dataset for dev/test | **KITTI + nuScenes** | Synthetic/public data first; phone recordings later |
| Synthetic environment | Free simulation engine (TBD) | Must build an OSM-equivalent world inside the engine |
| SLAM | RTAB-Map (monocular) | Handles map→odom transform; loop closure for drift |
| Path routing | Dijkstra on OSM graph | Using `pyrosm` + `networkx` on local OSM `.pbf` |
| VLM output | Structured JSON + text report | Severity score + natural language explanation |
| State tracking | Temporal Knowledge Graph | Replaces simple FSM; handles parallel, fused events |
| VO drift correction | GPS re-anchor + loop closure + **OCR/VLM landmark triangulation** | Read road signs ("X km to Town A") to correct drift |
| HPC transition | **On hold** | Will address after local pipeline is stable |

---

## 3. Data Sources & Knowledge Layer → [Full Detail: docs/03_data_sources.md](./docs/03_data_sources.md)

The system requires three data layers to reason about the road environment:

### 3.1 OSM Layer (OpenStreetMap)
- Download local `.pbf` file for the operational area
- Extract: road types, speed limits, school zones, hospital zones, pedestrian zones, roundabouts, stop lines
- Tool: `osmium`, `pyrosm`, `osmnx`
- Limitation: speed bumps and potholes are **rarely in OSM** → treated as high-value additions, not expected entries

### 3.2 Municipal Rules Layer
- Zone-based rules: school zones (speed ≤ 25 km/h), hospital zones (no horn), construction zones
- Sign placement rules: which signs are mandatory at which junction types
- Road surface standards: acceptable pothole severity by zone class
- This layer is currently **manual** (a lookup table / config YAML per city) → future: ingest from government open data APIs

### 3.3 Synthetic / Public Dataset Layer (Dev Phase)
- **KITTI** (monocular camera, GPS, IMU, LiDAR) — for object detection, VO, and depth testing
- **nuScenes** (multi-camera, LiDAR, radar, full 3D annotations) — for tracking and behavioral monitoring
- **CARLA Simulator** (free, open-source) — for synthetic world building with OSM-imported maps
  - CARLA can import real OSM maps via `odrviewer` → build a synthetic city that mirrors real OSM data
  - Record simulated rosbags with ground truth annotations
- Answer to your question: **Yes — KITTI and nuScenes are sufficient to implement and test the full pipeline** before using phone recordings

### 3.4 Custom Mobile Phone Dataset (Real-World Operational Data)
- **Sensor Logger Mobile Format**: High-frequency (~100 Hz) CSV recordings for Accelerometer, Gravity, Gyroscope, Orientation (Quaternion/Euler), and low-frequency (~1 Hz) GPS Location CSV files, paired with sequential `.jpg` camera frames inside a dedicated `Camera` folder.
- **Universal Packaging Script**: `dataset/infratrack_bag_packager.py` parses these raw logs, fuses sequential high-frequency IMU sensors, dynamically calculates GPS noise covariance matrices, and performs "True-Time Sequential Packing" to compile them chronologically into a standard ROS 2 Humbe-compatible `.db3` (sqlite3 backend) bag.

---

## 4. System Architecture → [Full Detail: docs/04_system_architecture.md](./docs/04_system_architecture.md)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA INGESTION LAYER                            │
│  [Rosbag2 Playback] ─── Camera / IMU / GPS ──> ROS 2 Topics            │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐
   │ SLAM / VO   │   │  GPS + IMU  │   │ OSM Data Layer  │
   │ RTAB-Map    │   │  EKF Fusion │   │ pyrosm +        │
   │ (monocular) │   │  robot_loc. │   │ networkx        │
   └──────┬──────┘   └──────┬──────┘   └────────┬────────┘
          │                 │                   │
          └────────┬────────┘                   │
                   ▼                            ▼
         ┌─────────────────┐         ┌─────────────────────┐
         │  TF2 Transform  │         │ Expected State Gen. │
         │  Tree (map →    │         │ (what SHOULD exist  │
         │  odom → camera) │         │  at this location?) │
         └────────┬────────┘         └──────────┬──────────┘
                  │                              │
     ┌────────────┼────────────────┐             │
     ▼            ▼                ▼             │
┌─────────┐ ┌──────────┐ ┌──────────────┐       │
│ Object  │ │ Semantic │ │  Monocular   │       │
│ Detect. │ │  Segm.   │ │    Depth     │       │
│ YOLOv8n │ │SegFormer │ │  MiDaS v2.1  │       │
└────┬────┘ └─────┬────┘ └──────┬───────┘       │
     │            │             │               │
     ▼            └──────┬──────┘               │
┌──────────┐             ▼                      │
│ByteTrack │    ┌─────────────────┐             │
│ Tracker  │    │ 3D Projection   │             │
│(dyn.obj) │    │ Node (tf2 +     │             │
└────┬─────┘    │ depth → map XYZ)│             │
     │          └────────┬────────┘             │
     │                   │                      │
     ▼                   ▼                      │
┌──────────────────────────────────────────────────────┐
│              TEMPORAL KNOWLEDGE GRAPH                 │
│  Nodes: Infrastructure markers, vehicles, pedestrians │
│  Edges: Spatial proximity, temporal co-occurrence,   │
│         OSM relation, state transitions               │
│  Time-indexed: full history of every observation     │
└──────────────────────┬───────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌─────────────┐ ┌────────┐ ┌──────────┐
   │  Discrepancy│ │  Road  │ │Behavioral│
   │  Detector   │ │Quality │ │  Alert   │
   │(OSM vs seen)│ │Assessor│ │  Engine  │
   └──────┬──────┘ └───┬────┘ └────┬─────┘
          │            │           │
          └────────────┼───────────┘
                       ▼ (event trigger, async)
              ┌─────────────────┐
              │    VLM Node     │
              │  Qwen-VL-2B     │
              │  (4-bit quant)  │
              │ → JSON output   │
              │ → Text report   │
              └────────┬────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │     OUTPUT & VISUALIZATION   │
        │  • JSON audit report         │
        │  • Route map (Folium/Leaflet) │
        │  • Google Maps-style overlay │
        │  • OSM edit candidates       │
        └──────────────────────────────┘
```

---

## 5. Temporal Knowledge Graph → [Full Detail: docs/05_temporal_knowledge_graph.md](./docs/05_temporal_knowledge_graph.md)

The state machine in v1.0 is replaced by a **Temporal Knowledge Graph (TKG)**. This handles the reality that multiple things happen simultaneously, need to be fused, and evolve over time.

### Graph Structure
- **Nodes:** Every detected entity gets a node
  - Infrastructure: `{id, type, map_xyz, confidence, state, first_seen_t, last_seen_t}`
  - Vehicle/Pedestrian: `{id, class, track_id, trajectory[], velocity, anomaly_score}`
  - Road Segment: `{osm_way_id, zone_type, expected_signs[], quality_score}`
- **Edges:**
  - `LOCATED_AT` (entity → road segment)
  - `EXPECTED_BY` (entity → OSM rule)
  - `OBSERVED_AT_TIME` (entity → timestamp)
  - `CONFLICTS_WITH` (detected entity ↔ OSM expected entity)
  - `CO_OCCURS_WITH` (two entities seen in same frame cluster)

### Entity State (per infrastructure node)
```
UNOBSERVED  → GPS puts us near an OSM-expected object but not yet seen
CANDIDATE   → Detected once; confidence < 0.5
VERIFIED    → Detected ≥3 times, VO-consistent position (Δ < 0.5m), confidence ≥ 0.7
GHOST       → Consistently detected but NOT in OSM (phantom sign)
MISSING     → OSM says must exist; VERIFIED absence over ≥5 frames
DAMAGED     → Detected + VLM confirms physical damage
DEGRADED    → Sensor failure; node frozen
```

### VO Drift Correction via Landmark Triangulation
When a road sign with readable text is detected:
1. **OCR Node** extracts text (e.g., "Bangalore 12 km")
2. Known destination coordinates are geocoded → expected GPS position of the sign
3. This gives a correction vector: `Δ(observed_GPS, expected_GPS)`
4. The TKG applies this correction to all nearby markers (within radius R)
5. Combined with RTAB-Map loop closure → multi-source drift correction

---

## 6. Module Specification → [Full Detail: docs/06_module_specification.md](./docs/06_module_specification.md)

### 6.1 Perception Modules (Local — RTX 3050)

| Module | Model | VRAM | Input | Output |
|--------|-------|------|-------|--------|
| Object Detection | YOLOv8n (TensorRT) | ~0.8 GB | RGB frame | BBoxes + classes |
| Semantic Segmentation | SegFormer-B0 | ~0.5 GB | RGB frame | Per-pixel class mask |
| Monocular Depth | MiDaS v2.1 small | ~0.3 GB | RGB frame | Dense depth map |
| OCR (sign text) | EasyOCR / TrOCR-small | ~0.2 GB | Cropped sign ROI | Text string |
| VLM (local) | Qwen-VL-2B (4-bit) | ~1.5 GB | Image + prompt | JSON + text |
| **Total** | | ~3.3 GB | | |

> **Note:** All modules run sequentially on rosbag playback (not simultaneously). On HPC, swap YOLOv8n → YOLOv8l, SegFormer-B0 → B5, VLM → Qwen-VL-7B or LLaVA-13B.

### 6.2 SLAM & Localization

- **RTAB-Map** (monocular mode): Provides `map → odom` transform + loop closure
- **robot_localization** (EKF): Fuses VO output + phone GPS (with 5–15m noise model)
- **Confidence radius per marker:** Starts at 2m, grows at 0.5m per 100m traveled since last GPS anchor

### 6.3 OSM Routing (Path Reference)

- Download `.pbf` file for operational area
- Build road graph with `pyrosm` → `networkx` DiGraph
- **Dijkstra** on graph for global reference path from start GPS coordinate
- The path is used as a *reference* for map-matching, not turn-by-turn navigation
- No destination needed — path follows the GPS track of the recording

### 6.4 VLM Event Triggers (Async, Offline)

VLM is **never** called per-frame. It is triggered by the TKG on these events:

| Trigger | VLM Prompt Type |
|---------|-----------------|
| `DISCREPANCY` state entered | "Is this sign [image] consistent with what OSM expects here?" |
| Road surface segmented as damaged | "Rate the severity of this road damage (1–5) and describe the defect." |
| `GHOST` state entered | "What is this sign [image] and does it appear official or unofficial?" |
| Anomalous vehicle behavior flagged | "Describe the driving behavior of the vehicle in [image]. Any violations?" |

### 6.5 Output & Visualization

- **JSON Report:** Per road segment, per entity, with severity, GPS coordinates, state, VLM text
- **Route Map (Folium):** Interactive HTML map (like Google Maps) overlaid with:
  - Green pins: verified infrastructure matching OSM
  - Red pins: missing infrastructure
  - Orange pins: ghost/phantom signage
  - Blue heat-map: road quality score along the route
  - Purple markers: behavioral anomalies
- **OSM Edit Candidates:** GeoJSON file of new features to submit to OSM

---

## 7. Coordinate Frame Convention → [Full Detail: docs/07_coordinate_frames.md](./docs/07_coordinate_frames.md)

```
world (ENU — East-North-Up, GPS anchor at recording start)
  └── map (RTAB-Map SLAM origin)
        └── odom (VO-corrected, drifts from map over distance)
              └── base_link (vehicle center of mass)
                    ├── camera_link (camera optical center)
                    └── imu_link (phone IMU)
```

**Authoritative frame per data type:**
- Infrastructure markers → stored in `map` frame
- Dynamic object tracks → tracked in `odom` frame, reported in `map` frame
- OSM data → converted to `map` frame via GPS anchor + Dijkstra path alignment
- VLM analysis → associated with `map` frame coordinates of the trigger entity

---

## 8. Failure / Degraded Mode Table → [Full Detail: docs/08_failure_modes.md](./docs/08_failure_modes.md)

| Failure | Detection | Degraded Behavior |
|---------|-----------|-------------------|
| Camera feed drops | No `/image_raw` for >2s | Disable vision nodes; freeze all TKG nodes at last state |
| GPS fix lost | `NavSatFix` status = NO_FIX | Switch to pure VO; expand all marker confidence radii by 2× |
| SLAM diverges | VO covariance > threshold | Freeze `map` frame; use `odom` only; log `SLAM_DIVERGED` event |
| VLM timeout | VLM response > 30s | Skip VLM confirmation; mark entity as `NEEDS_REVIEW`; continue |
| OCR fails on sign | No text detected in ROI | Skip landmark triangulation; rely on GPS+loop closure only |

---

## 9. Development Roadmap → [Full Detail: docs/09_development_roadmap.md](./docs/09_development_roadmap.md)

### ✅ Phase 0 — Foundation (Weeks 1–2)
- [ ] Download KITTI raw dataset (monocular sequence) for development
- [ ] Download nuScenes mini split for tracking development
- [ ] Set up CARLA Simulator with an OSM-imported test map
  - Import a real OSM area into CARLA using `odr_map` tools
  - Record synthetic rosbag from CARLA with ground truth labels
- [ ] Camera intrinsic calibration using ChArUco board
  - For KITTI: use provided calibration files
  - For phone (future): run `camera_calibration` ROS 2 package
- [ ] IMU noise model calibration using `imu_utils`
- [ ] Download OSM `.pbf` for the test area (matching KITTI/CARLA location)
- [ ] Set up `robot_localization` EKF node (GPS + IMU fusion)
- [ ] Define TF2 frame tree and publish static transforms

### 🔲 Phase 1 — Perception Core (Weeks 3–5)
- [ ] Deploy YOLOv8n with TensorRT on KITTI sequences
  - Validate detection on vehicles, pedestrians, road signs
- [ ] Deploy SegFormer-B0 for road surface + sign segmentation
- [ ] Deploy MiDaS v2.1 small for monocular depth
- [ ] Implement 2D → 3D projection node (camera pixel → map XYZ)
  - Uses depth map + camera intrinsics + TF2 transform
- [ ] Deploy ByteTrack for multi-object tracking on nuScenes sequences
- [ ] Validate tracking MOTA against nuScenes ground truth

### 🔲 Phase 2 — Temporal Knowledge Graph (Weeks 6–8)
- [ ] Design TKG schema (Neo4j or NetworkX for prototyping)
- [ ] Implement TKG ingestion node (subscribes to detection + projection outputs)
- [ ] Implement OSM Expected State loader (reads `.pbf`, builds expected entity list per GPS region)
- [ ] Implement state transitions (UNOBSERVED → CANDIDATE → VERIFIED → MISSING/GHOST)
- [ ] Implement confidence radius growth model for VO drift
- [ ] Implement OCR node (EasyOCR) + landmark triangulation correction

### 🔲 Phase 3 — VLM & Road Quality (Weeks 9–11)
- [ ] Deploy Qwen-VL-2B (4-bit quantized) locally
- [ ] Implement async VLM event handler (triggered by TKG events)
- [ ] Design prompt templates for each trigger type
- [ ] Implement road quality assessment pipeline
  - Segment road surface → extract damage regions → VLM severity rating
- [ ] Validate VLM JSON output schema

### 🔲 Phase 4 — Output & Visualization (Weeks 12–14)
- [ ] Implement JSON report generator (from TKG final state)
- [ ] Implement Folium-based route map (Google Maps-style interactive HTML)
  - Color-coded pins per entity state
  - Heat-map layer for road quality score
  - Clickable markers → VLM report popup
- [ ] Generate OSM edit candidate GeoJSON
- [ ] End-to-end test on full KITTI sequence (drive → report → map)
- [ ] End-to-end test on CARLA synthetic sequence (with ground truth comparison)

### 🔲 Phase 5 — Phone Data & Real World (Weeks 15–18)
- [ ] Set up phone camera streaming to ROS 2 over Wi-Fi (or record + transfer)
  - Candidate apps: `ROS2 Camera` (Android), `Sensor Logger`, `PhonePi`
- [ ] Recalibrate camera intrinsics for specific phone model
- [ ] Record test rosbag on a known local road
- [ ] Run full pipeline on phone recording
- [ ] Compare output against manual ground truth observation

### 🔲 Phase 6 — HPC Transition (Future)
- On hold until local pipeline is fully validated
- Steps documented in the analysis artifact (conversation `3ad2a757`)

---

## 10. Evaluation Metrics → [Full Detail: docs/10_evaluation_metrics.md](./docs/10_evaluation_metrics.md)

| Component | Metric | Tool / Dataset |
|-----------|--------|----------------|
| Object Detection | mAP@0.5 | KITTI object benchmark |
| Multi-Object Tracking | MOTA, MOTP, IDs | nuScenes tracking eval kit |
| VO Accuracy | ATE (Absolute Trajectory Error), RPE | `evo` package on KITTI odometry |
| Depth Estimation | AbsRel, RMSE | KITTI depth benchmark |
| Infrastructure Detection | Precision / Recall (vs OSM ground truth) | Custom annotated test sequence |
| Road Quality | Severity correlation (VLM vs manual) | Manual annotation on test sequence |
| End-to-End | Missing infra recall, False positive rate | CARLA synthetic with GT labels |

---

## 11. Open Technical Questions (Tracking)

| # | Question | Status |
|---|----------|--------|
| Q1 | **CARLA requires 8GB VRAM — cannot run on RTX 3050.** Alternative: **Gazebo + OSM world import** (already used by you). See [docs/03_data_sources.md](./docs/03_data_sources.md) for setup steps. CARLA on hold for HPC. | ✅ Decided |
| Q2 | Which phone model for Phase 5 recordings? (determines IMU noise model) | 🔲 Open |
| Q3 | Which city for initial real-world test? (determines OSM data quality for that area) | 🔲 Open |
| Q4 | Municipal rules data source? (manual YAML vs. open government API) | 🔲 Open |
| Q5 | TKG backend: NetworkX (simple, Python) vs. Neo4j (full graph DB, complex)? | 🔲 Open |
| Q6 | OCR model: EasyOCR (simple) vs. TrOCR (more accurate, more VRAM)? | 🔲 Open |

---

## 12. Key Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Middleware | ROS 2 Humble | Nodes, topics, tf2, rosbag2 |
| SLAM | RTAB-Map (monocular) | Loop closure + map→odom |
| GPS Fusion | robot_localization EKF | GPS + IMU → filtered odom |
| Detection | YOLOv8n + TensorRT | 4GB VRAM friendly |
| Segmentation | SegFormer-B0 | Road + sign segmentation |
| Depth | MiDaS v2.1 small | Monocular depth estimation |
| Tracking | ByteTrack | Fast, occlusion-robust |
| OCR | EasyOCR | Sign text for drift correction |
| VLM (local) | Qwen-VL-2B (4-bit) | ~1.5GB VRAM after quant |
| VLM (HPC) | Qwen-VL-7B / LLaVA-13B | Full precision on A100 |
| OSM | pyrosm + osmium + osmnx | Graph building + routing |
| Routing | networkx Dijkstra | On local OSM graph |
| Knowledge Graph | NetworkX (proto) / Neo4j (prod) | Temporal entity tracking |
| Simulation | CARLA + OSM import | Synthetic rosbag generation |
| Visualization | Folium (Python) | Interactive route map |
| Evaluation | evo, nuScenes devkit, KITTI eval | Quantitative benchmarks |
| Containerization | Docker (local) → Apptainer (HPC, future) | On hold |
