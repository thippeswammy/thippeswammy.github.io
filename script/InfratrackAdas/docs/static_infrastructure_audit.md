# Static Infrastructure Audit — Full Design, Structure & Algorithm

**Module:** `infratrack_audit` | **Version:** 1.0 | **Updated:** 2026-05-17

> ✅ **Status (2026-05-19): CONFIRMED — Architecture Impressive & Approved.** All sections, algorithms, FSM transitions, confidence aggregation, and output schemas are confirmed as-is. No structural changes required. Additions from `06_module_specification.md` (SAM2 segmentation) and `07_coordinate_frames.md` (static map layer) complement this module without conflicting with the discrepancy engine or FSM logic.

---

## Overview

The Static Infrastructure Audit module answers one question per GPS location:

> **"Does what the camera sees match what the law and map say should be here?"**

It compares three knowledge sources against real-time camera perception:
1. **OSM Layer** — what is mapped on OpenStreetMap
2. **Municipal Rules Layer** — what signs/markings are legally required per zone type
3. **Zone Definitions Layer** — what geographic zone the vehicle is currently in

---

## 1. Knowledge Base Tree

```
knowledge_base/
├── osm_layer/
│   ├── road_network/
│   │   ├── highway tags          (motorway, trunk, primary, secondary, residential, service)
│   │   ├── maxspeed tags         (maxspeed=30, maxspeed=50, maxspeed:advisory=20)
│   │   ├── lanes tags            (lanes=2, lanes:forward=1, lanes:backward=1)
│   │   ├── oneway tags           (oneway=yes, oneway=-1)
│   │   ├── surface tags          (surface=asphalt, surface=concrete, surface=paved)
│   │   └── junction tags         (junction=roundabout, junction=traffic_signals)
│   │
│   ├── traffic_signs/
│   │   ├── mandatory signs       (highway=stop, highway=give_way)
│   │   ├── speed signs           (maxspeed=*, zone:maxspeed=*)
│   │   ├── warning signs         (traffic_sign=IN:W301 [speed_bump], hazard=*)
│   │   ├── informational signs   (destination=*, distance=*)
│   │   └── school/hospital zone  (school=yes, amenity=school proximity tags)
│   │
│   ├── physical_features/
│   │   ├── speed_bumps           (traffic_calming=bump / hump / cushion / table)
│   │   ├── pedestrian_crossings  (crossing=zebra / traffic_signals / uncontrolled)
│   │   ├── traffic_lights        (highway=traffic_signals)
│   │   ├── guardrails            (barrier=guard_rail)
│   │   └── road_markings         (marking=stop_line, marking=give_way_line)
│   │
│   └── zones/
│       ├── school_zones          (amenity=school, zone:maxspeed=school)
│       ├── hospital_zones        (amenity=hospital, amenity=clinic)
│       ├── residential_zones     (landuse=residential)
│       ├── commercial_zones      (landuse=commercial)
│       └── industrial_zones      (landuse=industrial)
│
├── municipal_rules_layer/
│   ├── zone_speed_rules/
│   │   ├── school_zone           → maxspeed=25 during 08:00–18:00 school days
│   │   ├── hospital_zone         → maxspeed=25 + no_horn + pedestrian_priority
│   │   ├── residential_zone      → maxspeed=30 or 40 depending on road class
│   │   ├── highway               → maxspeed=60–100 + mandatory_hard_shoulder
│   │   └── construction_zone     → maxspeed=20 + mandatory_worker_warning_signs
│   │
│   ├── mandatory_sign_rules/
│   │   ├── before_school         → school_zone_warning sign ≤ 100m before gate
│   │   ├── before_hospital       → hospital_zone_warning sign ≤ 50m before entrance
│   │   ├── speed_bump_approach   → speed_bump_warning sign ≤ 30m before bump
│   │   ├── roundabout_approach   → give_way sign at every arm
│   │   ├── junction_approach     → stop sign OR give_way depending on road class
│   │   └── pedestrian_crossing   → warning sign ≤ 50m before marking
│   │
│   ├── road_surface_standards/
│   │   ├── highway               → no potholes > 5cm depth; crack ≤ 15% area
│   │   ├── primary_road          → no potholes > 8cm depth; crack ≤ 25% area
│   │   ├── residential           → repair required if > 3 potholes per 10m
│   │   └── school/hospital zone  → highest standard; any defect = alert
│   │
│   └── data_format/
│       └── rules.yaml            (human-editable YAML; one file per city/region)
│
└── zone_definitions_layer/
    ├── zone_schema/
    │   ├── zone_id               (unique string, e.g., "BLR_SCHOOL_042")
    │   ├── zone_type             (SCHOOL | HOSPITAL | RESIDENTIAL | COMMERCIAL | HIGHWAY | CONSTRUCTION)
    │   ├── geometry              (GeoJSON Polygon in WGS84)
    │   ├── active_hours          (e.g., "08:00–18:00 Mon-Sat")
    │   ├── speed_limit           (km/h integer)
    │   ├── mandatory_signs[]     (list of required sign types)
    │   └── surface_standard      (HIGHEST | HIGH | MEDIUM | BASIC)
    │
    ├── zone_sources/
    │   ├── osm_derived           → auto-generated from OSM amenity tags + buffer polygon
    │   ├── manual_yaml           → hand-coded zones not in OSM (current approach)
    │   └── government_api        → future: ingest from city open data portals
    │
    └── zone_index/
        └── spatial_index         (R-tree / STRtree for fast GPS → zone lookup)
```

---

## 2. Expected State Generator

Given the vehicle's current GPS position and heading, this module queries all three layers and produces an **ExpectedEntityList** — the ground truth for what should exist in the camera's field of view.

### 2.1 Input
```python
@dataclass
class VehicleState:
    lat: float          # WGS84 latitude
    lon: float          # WGS84 longitude
    heading_deg: float  # 0=North, 90=East
    speed_kmh: float
    timestamp: float    # Unix time
```

### 2.2 Query Pipeline
```
Step 1: Zone Lookup
  Input:  (lat, lon)
  Action: R-tree spatial query on zone_definitions_layer
  Output: List[ZoneDefinition] — all zones containing this GPS point

Step 2: OSM Way Lookup
  Input:  (lat, lon), heading
  Action: Map-match GPS to nearest OSM way using pyrosm + shapely
  Output: OSMWay — the current road segment with all its tags

Step 3: Expected Sign Lookup
  Input:  OSMWay + ZoneList
  Action: Walk forward along the route graph (lookahead = 150m)
          For each node/way in lookahead:
            → Query OSM for existing traffic_sign nodes
            → Query municipal_rules_layer for mandatory signs per zone type
          Merge and deduplicate
  Output: List[ExpectedSign]

Step 4: Expected Physical Feature Lookup
  Input:  OSMWay (lookahead 150m)
  Action: Query OSM for traffic_calming, crossing, traffic_signals nodes
  Output: List[ExpectedFeature]  (speed bumps, crossings, etc.)

Step 5: Surface Standard Lookup
  Input:  ZoneList + OSMWay.highway tag
  Action: Look up surface_standard from municipal_rules_layer
  Output: SurfaceStandard enum
```

### 2.3 Output Schema
```python
@dataclass
class ExpectedEntity:
    entity_id: str              # "osm_node_123456" or "rule_SCHOOL_sign_before_gate"
    entity_type: str            # SIGN | PHYSICAL_FEATURE | SURFACE_STANDARD
    sign_class: str             # e.g. "speed_bump_warning", "school_zone", "stop"
    expected_map_xyz: tuple     # (x, y, z) in map frame
    position_tolerance_m: float # how far from expected is still a match (e.g. 10m)
    confidence_prior: float     # OSM-sourced=0.8, rule-derived=0.95
    source: str                 # "osm" | "municipal_rule" | "both"
    active: bool                # False if outside active_hours
```

---

## 3. Perception Pipeline Tree

```
perception_pipeline/
├── sign_detection/
│   ├── input:          RGB frame (camera_link)
│   ├── step_1_detect/
│   │   ├── model:      YOLOv8n (TensorRT, classes: all traffic sign types)
│   │   ├── output:     List[BBox2D + class_label + confidence]
│   │   └── filter:     confidence > 0.35 (lower than usual, VLM will re-verify)
│   │
│   ├── step_2_classify/
│   │   ├── model:      SegFormer-B0 (sign region crop → fine-grained class)
│   │   ├── classes:    speed_limit | school_zone | stop | give_way |
│   │   │               speed_bump_warning | pedestrian | no_horn | hospital
│   │   └── output:     refined_class + class_confidence
│   │
│   ├── step_3_ocr/
│   │   ├── trigger:    only for text-bearing sign classes (speed_limit, distance, info)
│   │   ├── model:      EasyOCR (English + local language)
│   │   ├── output:     text_content (e.g. "30", "School Ahead", "Bangalore 12 km")
│   │   └── use:        (a) speed limit value extraction
│   │                   (b) landmark triangulation for VO drift correction
│   │
│   └── step_4_3d_localize/
│       ├── depth:      MiDaS v2.1 small → per-pixel depth map
│       ├── project:    (u, v, depth) + camera intrinsics K → camera_frame (X,Y,Z)
│       ├── transform:  TF2: camera_frame → map_frame
│       └── output:     DetectedSign { map_xyz, class, text, confidence, timestamp }
│
├── road_surface_assessment/
│   ├── input:          RGB frame (road ROI — lower 40% of frame)
│   ├── step_1_segment/
│   │   ├── model:      SegFormer-B0 (road vs. defect classes)
│   │   ├── classes:    road_ok | pothole | crack | patch | debris | waterlogging
│   │   └── output:     per-pixel mask + defect_area_fraction
│   │
│   ├── step_2_severity/
│   │   ├── trigger:    defect_area_fraction > 0.05 (5% of road ROI)
│   │   ├── method:     depth map → estimate pothole depth from surface normal deviation
│   │   └── output:     SeverityScore { type, area_pct, est_depth_cm, map_xyz }
│   │
│   └── step_3_vlm_confirm/
│       ├── trigger:    SeverityScore.est_depth_cm > threshold (zone-dependent)
│       ├── async:      True (does not block main pipeline)
│       └── prompt:     "Rate the road damage severity (1-5) and describe the defect type."
│
└── physical_feature_detection/
    ├── speed_bump/
    │   ├── method_1:   IMU Z-axis high-pass filter (jolt signature > 0.5g)
    │   ├── method_2:   SegFormer detects transverse road texture change
    │   └── fuse:       both must agree → VERIFIED bump; one only → CANDIDATE
    │
    └── pedestrian_crossing/
        ├── method:     SegFormer detects zebra stripe pattern
        └── output:     map_xyz of crossing centerline
```

---

## 4. Matching & Discrepancy Engine — Full Algorithm

### 4.1 Spatial Match Algorithm

```
ALGORITHM: SpatialConfidenceMatch

INPUT:
  detected:  List[DetectedEntity]    (from perception pipeline)
  expected:  List[ExpectedEntity]    (from expected state generator)
  tolerance: float                   (from ExpectedEntity.position_tolerance_m)

FOR EACH expected_entity E in expected:
  candidates = []
  FOR EACH detected_entity D in detected:
    dist = euclidean_distance(D.map_xyz, E.expected_map_xyz)
    IF dist <= E.position_tolerance_m:
      type_match = semantic_type_match(D.class, E.sign_class)
      spatial_conf = 1.0 - (dist / E.position_tolerance_m)   # 1.0=exact, 0.0=edge
      confidence = spatial_conf * type_match * D.confidence
      candidates.append((D, confidence))

  IF candidates is empty:
    E.match_result = NO_MATCH
    E.match_confidence = 0.0
  ELSE:
    best = max(candidates, key=lambda x: x[1])
    E.match_result = MATCH
    E.match_confidence = best[1]
    mark best[0] as consumed  # prevent double-matching

# Detected entities NOT consumed = potential GHOST entities
ghosts = [D for D in detected if D not consumed]
```

### 4.2 Semantic Type Match Table

| Detected Class | Expected Class | Match Score |
|----------------|---------------|-------------|
| speed_bump_warning | speed_bump_warning | 1.00 |
| speed_bump_warning | school_zone | 0.60 (partial — school zones often have bumps) |
| school_zone | school_zone | 1.00 |
| stop | give_way | 0.20 (wrong sign type — flag as WRONG_SIGN) |
| speed_limit_30 | speed_limit_50 | 0.30 (wrong value — flag as WRONG_VALUE) |
| speed_limit_30 | speed_limit_30 | 1.00 |
| pedestrian_crossing | pedestrian_crossing | 1.00 |
| any | any (different class) | 0.10 |

### 4.3 Confidence Aggregation

```
FINAL_CONFIDENCE = weighted_average of:
  ├── spatial_confidence     weight=0.30   (how close to expected position)
  ├── semantic_confidence    weight=0.25   (how well class matches)
  ├── detection_confidence   weight=0.20   (YOLO confidence score)
  ├── multi_frame_consensus  weight=0.15   (seen in N consecutive frames)
  └── vlm_confirmation       weight=0.10   (async VLM verification, if triggered)

ALERT_THRESHOLD = 0.75  (configurable per zone type)
```

### 4.4 Discrepancy Classification

```
IF expected_entity.match_result == NO_MATCH:
  IF expected_entity has been in UNOBSERVED state for > 5 verified frames:
    → classify as MISSING_INFRASTRUCTURE
    → alert severity based on sign_class importance:
        CRITICAL:  stop, traffic_light, school_zone_boundary
        HIGH:      speed_bump_warning, give_way, pedestrian_crossing_warning
        MEDIUM:    informational, distance signs
        LOW:       decorative or advisory only

IF detected_entity is ghost (not in OSM, not in rules):
  → classify as GHOST_SIGNAGE
  → alert: "Unregistered sign detected — possible illegal signage or OSM gap"
  → add to OSM_EDIT_CANDIDATES with confidence score

IF match_result == MATCH but semantic_confidence < 0.5:
  → classify as WRONG_SIGN_TYPE (e.g., stop where give_way expected)
  → CRITICAL alert

IF match_result == MATCH but OCR value != expected value:
  → classify as WRONG_SIGN_VALUE (e.g., speed limit 50 where 30 expected)
  → HIGH alert
```

---

## 5. Entity State Machine (per infrastructure node)

```
States:
  UNOBSERVED  ──► CANDIDATE  ──► VERIFIED ──► MISSING
                     │               │
                     ▼               ▼
                 UNOBSERVED       GHOST
                 (timeout)      (not in OSM)
                                    │
                                    ▼
                                CONFIRMED_GHOST
                                (VLM verified)

Transitions & Conditions:
  UNOBSERVED → CANDIDATE:
    trigger:  GPS within (position_tolerance_m + 20m) of expected position
              AND at least 1 detection candidate within tolerance
    action:   create TKG node, start frame counter

  CANDIDATE → VERIFIED:
    trigger:  seen in ≥ 3 frames
              AND VO position variance < 0.5m²
              AND detection_confidence > 0.40
    action:   plant map marker, update TKG with LOCATED_AT edge

  CANDIDATE → UNOBSERVED (timeout):
    trigger:  > 10 frames with no detection matching candidate
    action:   remove candidate, log false detection event

  VERIFIED → MISSING:
    trigger:  GPS is within (position_tolerance_m) of expected position
              AND sign absent for ≥ 5 consecutive verified-zone frames
    action:   emit MISSING_INFRASTRUCTURE alert, update TKG state

  VERIFIED → GHOST:
    trigger:  VERIFIED entity has no matching ExpectedEntity within 15m
    action:   flag as ghost, trigger async VLM analysis

  GHOST → CONFIRMED_GHOST:
    trigger:  VLM confirms sign is real and readable
    action:   add to OSM_EDIT_CANDIDATES queue

  ANY → DEGRADED:
    trigger:  camera drop or SLAM diverge signal
    action:   freeze all states, log timestamp
```

---

## 6. Output Schema

### 6.1 Per-Alert JSON
```json
{
  "alert_id": "ALT_20260517_143022_001",
  "type": "MISSING_INFRASTRUCTURE",
  "severity": "HIGH",
  "sign_class": "speed_bump_warning",
  "expected_by": ["osm_node_987654", "rule_speed_bump_approach"],
  "map_xyz": [142.3, 87.6, 0.0],
  "gps": {"lat": 12.9716, "lon": 77.5946},
  "frame_first_missed": 1420,
  "frame_count_absent": 7,
  "confidence": 0.88,
  "vlm_report": "No warning sign detected in the 30m approach to speed bump. Surface shows a transverse bump at this location.",
  "osm_edit_candidate": true,
  "timestamp": "2026-05-17T14:30:22Z"
}
```

### 6.2 OSM Edit Candidate GeoJSON
```json
{
  "type": "Feature",
  "geometry": { "type": "Point", "coordinates": [77.5946, 12.9716] },
  "properties": {
    "action": "add",
    "tags": {
      "highway": "speed_bump",
      "traffic_sign": "IN:W301",
      "infratrack:confidence": 0.88,
      "infratrack:verified_frames": 7,
      "infratrack:session": "session_20260517"
    }
  }
}
```

---

## 7. Data Files & Directory Layout

```
infratrack_audit/
├── config/
│   ├── rules.yaml                  ← municipal rules (editable per city)
│   ├── zones/
│   │   ├── bangalore_zones.geojson
│   │   └── <city>_zones.geojson
│   ├── alert_thresholds.yaml       ← confidence thresholds per sign class
│   └── sign_taxonomy.yaml          ← canonical sign class list
│
├── osm/
│   ├── <area>.osm.pbf              ← downloaded with osmium
│   ├── road_graph.gpickle          ← pre-built networkx graph
│   └── expected_state_cache/       ← pre-computed ExpectedEntityLists per grid tile
│
├── nodes/
│   ├── expected_state_generator.py ← ROS 2 node: GPS → ExpectedEntityList
│   ├── perception_fusion.py        ← ROS 2 node: fuses detection + depth + TF2
│   ├── discrepancy_engine.py       ← ROS 2 node: match + classify + FSM
│   ├── ocr_node.py                 ← ROS 2 node: sign text extraction
│   └── vlm_async_node.py          ← ROS 2 node: async VLM event handler
│
├── msgs/
│   ├── ExpectedEntity.msg
│   ├── DetectedEntity.msg
│   ├── DiscrepancyAlert.msg
│   └── OSMEditCandidate.msg
│
└── tests/
    ├── test_spatial_match.py       ← unit test: matching algorithm
    ├── test_fsm_transitions.py     ← unit test: state machine
    └── test_confidence_scoring.py  ← unit test: confidence aggregation
```

---

## 8. ROS 2 Topic Graph

```
/camera/image_raw
    │
    ├──► [sign_detection_node]
    │         ├── /infratrack/detected_signs   (DetectedEntity[])
    │         └── /infratrack/sign_crops       (Image[])
    │
    ├──► [road_surface_node]
    │         └── /infratrack/surface_defects  (SeverityScore[])
    │
    └──► [depth_node]
              └── /infratrack/depth_map        (Image)

/fix  (GPS)  +  /tf  (TF2 transforms)
    │
    └──► [expected_state_generator_node]
              └── /infratrack/expected_entities (ExpectedEntity[])

/infratrack/detected_signs  +  /infratrack/expected_entities
    │
    └──► [discrepancy_engine_node]
              ├── /infratrack/alerts           (DiscrepancyAlert[])
              ├── /infratrack/tkg_updates      (TKGUpdate[])
              └── /infratrack/osm_candidates   (OSMEditCandidate[])

/infratrack/alerts  [event trigger]
    │
    └──► [vlm_async_node]
              └── /infratrack/vlm_reports      (VLMReport[])
```

---

## 9. Key Design Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| Tolerance buffer on OSM match (10–20m) | Phone GPS drifts 5–15m; OSM data can be off by 5m |
| Multi-frame confirmation (≥3 frames) before VERIFIED | Eliminates single-frame false detections |
| VLM called async, never per-frame | Qwen-VL-2B takes ~2s; blocking would stall the pipeline |
| Municipal rules in YAML (not DB) | Human-editable; no database setup required for prototype |
| Lower YOLO threshold (0.35) | VLM re-verifies; better to have false candidates than miss real signs |
| VO drift correction via OCR landmarks | Compensates GPS inaccuracy using known geographic text on signs |
| Surface standard is zone-dependent | School zone defects are CRITICAL; highway cracks may be LOW severity |
