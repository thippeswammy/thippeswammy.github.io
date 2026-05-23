# Temporal Knowledge Graph — Detailed Reference

**Section:** 5 of Master Plan | **File:** `docs/05_temporal_knowledge_graph.md`

---

## Overview

The Temporal Knowledge Graph (TKG) is the core data structure of InfraTrack. Unlike a simple state machine (one thing at a time), the TKG handles:

- **Parallel events** — vehicle tracking + sign detection + road quality happening simultaneously
- **Fusion** — multiple sensor observations merged into one entity belief
- **History** — full time-indexed record of every observation and state change
- **Relationships** — entities linked by spatial proximity, temporal co-occurrence, and rule derivation

---

## Graph Schema

### Node Types

```
EntityNode (abstract parent)
├── InfrastructureNode
│   ├── id:             str         (unique, e.g. "infra_20260517_143022_001")
│   ├── entity_type:    str         (SIGN | SPEED_BUMP | CROSSING | SURFACE_DEFECT)
│   ├── sign_class:     str         (school_zone, stop, speed_bump_warning, ...)
│   ├── map_xyz:        (x,y,z)     (in map frame, updated each verification)
│   ├── confidence:     float       (aggregated confidence score)
│   ├── state:          State enum  (UNOBSERVED|CANDIDATE|VERIFIED|MISSING|GHOST|DEGRADED)
│   ├── first_seen_t:   float       (Unix timestamp)
│   ├── last_seen_t:    float
│   ├── frame_count:    int         (total frames where detected)
│   ├── absent_count:   int         (consecutive frames absent while in range)
│   └── vlm_report:     str | None  (VLM analysis text)
│
├── DynamicObjectNode
│   ├── id:             str         (e.g. "dyn_bytetrack_042")
│   ├── object_class:   str         (car | truck | pedestrian | cyclist | motorcycle)
│   ├── track_id:       int         (ByteTrack persistent ID)
│   ├── trajectory:     List[(x,y,z,t)]  (last 50 positions in map frame)
│   ├── velocity_ms:    float       (current speed in m/s)
│   ├── heading_deg:    float
│   ├── anomaly_score:  float       (0=normal, 1=highly anomalous)
│   └── anomaly_type:   str | None  (WRONG_WAY | SPEED_VIOLATION | ERRATIC | None)
│
└── RoadSegmentNode
    ├── osm_way_id:     int
    ├── highway_class:  str
    ├── speed_limit:    int
    ├── surface_type:   str
    ├── quality_score:  float       (0=destroyed, 1=perfect)
    └── active_zones:   List[str]   (zone IDs overlapping this segment)
```

### Edge Types

```
Edge                    Source → Target           Properties
─────────────────────────────────────────────────────────────────
LOCATED_AT              Entity → RoadSegment      { distance_m, frame_t }
EXPECTED_BY             Entity → OSM/RuleSource   { confidence_prior }
OBSERVED_AT_TIME        Entity → Timestamp        { frame_id, detection_conf }
CONFLICTS_WITH          Entity ↔ Entity           { conflict_type, confidence }
CO_OCCURS_WITH          Entity ↔ Entity           { frame_range, proximity_m }
APPROACHES              DynamicObj → Entity       { time_to_impact_s }
ZONE_CONTAINS           Zone → RoadSegment        { zone_type }
```

---

## Implementation Options

### ✅ Option A: NetworkX (Prototype — CONFIRMED, In Use)

> **✅ DECISION (2026-05-19): Option A (NetworkX) is the confirmed implementation for Phase 0–Phase 3.**
> Migrate to Option B (Neo4j) in Phase 4 only when the prototype is stable and querying requirements outgrow NetworkX.

```python
import networkx as nx
from dataclasses import dataclass, asdict
import json, time

class InfraTrackTKG:
    def __init__(self):
        self.G = nx.MultiDiGraph()
        self.entity_index = {}   # id → node data
        self.spatial_index = []  # list of (map_xyz, node_id) for nearest-neighbor

    def add_entity(self, node: InfrastructureNode):
        self.G.add_node(node.id, **asdict(node))
        self.entity_index[node.id] = node
        self.spatial_index.append((node.map_xyz, node.id))

    def add_edge(self, src_id: str, dst_id: str, edge_type: str, **props):
        self.G.add_edge(src_id, dst_id, edge_type=edge_type, **props)

    def update_state(self, node_id: str, new_state: str, timestamp: float):
        self.G.nodes[node_id]['state'] = new_state
        self.G.nodes[node_id]['last_seen_t'] = timestamp
        # Add temporal observation edge
        ts_node = f"ts_{timestamp:.3f}"
        self.G.add_node(ts_node, type='Timestamp', t=timestamp)
        self.add_edge(node_id, ts_node, 'OBSERVED_AT_TIME')

    def find_nearest(self, xyz, radius_m=15.0):
        """Find all entities within radius_m of xyz."""
        from scipy.spatial import cKDTree
        points = [p for p, _ in self.spatial_index]
        ids = [i for _, i in self.spatial_index]
        if not points: return []
        tree = cKDTree(points)
        idxs = tree.query_ball_point(xyz, r=radius_m)
        return [ids[i] for i in idxs]

    def export_json(self, path: str):
        data = nx.node_link_data(self.G)
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
```

**Pros:** Pure Python, no install, easy to debug  
**Cons:** Not persistent across runs (save/load manually); no Cypher query language

**✅ Persistence Pattern (add to `InfraTrackTKG`):**
```python
import pickle

def save(self, path: str):
    """Save TKG to disk after each session."""
    with open(path, 'wb') as f:
        pickle.dump({'graph': self.G,
                     'entity_index': self.entity_index,
                     'spatial_index': self.spatial_index}, f)
    self.export_json(path.replace('.pkl', '.json'))  # human-readable copy

@classmethod
def load(cls, path: str) -> 'InfraTrackTKG':
    """Reload TKG from a previous session."""
    tkg = cls()
    with open(path, 'rb') as f:
        data = pickle.load(f)
    tkg.G = data['graph']
    tkg.entity_index = data['entity_index']
    tkg.spatial_index = data['spatial_index']
    return tkg
```

**Save/Load usage in ROS 2 node:**
```python
# On shutdown:
tkg.save('output/tkg_session_20260519.pkl')

# On startup (continue previous session):
tkg = InfraTrackTKG.load('output/tkg_session_20260519.pkl')
```

### Option B: Neo4j (Production — Future Phase 4 Target)

> **⚠️ NOTE (2026-05-19): Option B is preserved as the future production target. Do NOT implement this in Phase 0–3. Migrate only after NetworkX prototype is validated.**

```python
from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

def add_infrastructure_node(tx, node):
    tx.run("""
        MERGE (e:Infrastructure {id: $id})
        SET e += $props
    """, id=node.id, props=node.__dict__)

def find_missing_entities(tx):
    return tx.run("""
        MATCH (e:Infrastructure {state: 'MISSING'})
        RETURN e.id, e.sign_class, e.map_xyz, e.confidence
        ORDER BY e.confidence DESC
    """).data()
```

**Pros:** Full graph query language (Cypher), persistent, visualizable in Neo4j Browser  
**Cons:** Requires Docker to run locally; adds system complexity

### ✅ Decision: **Use NetworkX now (confirmed), migrate to Neo4j in Phase 4**

---

## Temporal Fusion Algorithm

When multiple detections of the same entity arrive over time, they must be fused:

```
ALGORITHM: TemporalFusion

Input: existing_node (from TKG), new_detection (from perception)

Step 1: Position Fusion (Kalman-style EMA)
  alpha = 0.3  # weight for new observation
  new_xyz = (1 - alpha) * existing_node.map_xyz + alpha * new_detection.map_xyz
  existing_node.map_xyz = new_xyz

Step 2: Confidence Update
  # Bayesian-style update
  prior = existing_node.confidence
  likelihood = new_detection.confidence
  posterior = (prior * likelihood) / (prior * likelihood + (1-prior)*(1-likelihood))
  existing_node.confidence = posterior

Step 3: Frame Count Update
  existing_node.frame_count += 1
  existing_node.last_seen_t = new_detection.timestamp
  existing_node.absent_count = 0  # reset since we just saw it

Step 4: State Transition Check (see FSM in static_infrastructure_audit.md)
  check_and_apply_transition(existing_node)
```

---

## VO Drift Correction via TKG

When OCR node detects a landmark sign (e.g., "Bangalore 12 km"):

```
1. Geocode destination: "Bangalore" → (lat=12.9716, lon=77.5946)
2. Expected sign position = 12,000m before city center along current road heading
3. Compute expected_map_xyz of the sign from GPS anchor
4. Actual detected map_xyz from SLAM/VO
5. Correction vector Δ = expected_map_xyz - detected_map_xyz
6. Apply Δ to ALL TKG nodes within 200m radius (spatial batch correction)
7. Log correction event to TKG as "DRIFT_CORRECTION" edge
```

---

## Visualization

The TKG can be exported at any time to:

```python
# Export for Folium map visualization
def export_to_geojson(tkg: InfraTrackTKG, output_path: str):
    features = []
    for node_id, data in tkg.G.nodes(data=True):
        if data.get('type') != 'Timestamp':
            xyz = data.get('map_xyz', [0,0,0])
            # Convert map_frame xyz to GPS (requires GPS anchor + rotation)
            lat, lon = map_to_gps(xyz)
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [lon, lat]},
                "properties": {
                    "id": node_id,
                    "state": data.get('state'),
                    "sign_class": data.get('sign_class'),
                    "confidence": data.get('confidence'),
                    "vlm_report": data.get('vlm_report', '')
                }
            })
    with open(output_path, 'w') as f:
        json.dump({"type": "FeatureCollection", "features": features}, f)
```
