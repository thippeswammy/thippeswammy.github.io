# Coordinate Frame Convention — Reference

**Section:** 7 of Master Plan | **File:** `docs/07_coordinate_frames.md`

---

## Frame Tree

```
world (ENU — East-North-Up, GPS anchor at recording start)
  └── map (RTAB-Map SLAM origin = world frame at t=0)
        └── odom (VO-corrected; drifts from map over distance)
              └── base_link (vehicle center of mass / phone mounting point)
                    ├── camera_link (camera optical center)
                    │     └── camera_optical (rotated: Z=forward, X=right, Y=down)
                    └── imu_link (phone IMU sensor)
```

---

## Frame Authority

| Data Type | Primary Frame | Notes |
|-----------|--------------|-------|
| Infrastructure markers (signs, bumps) | `map` | Stored permanently; corrected by loop closure |
| Dynamic objects (vehicles, pedestrians) | `odom` → converted to `map` for storage | Tracked in odom; reported in map |
| OSM road network | `map` → converted from WGS84 via GPS anchor | One-time conversion at session start |
| VLM analysis results | Attached to entity's `map` frame position | |
| GPS raw fix | `world` (ENU) | Fused via robot_localization EKF |
| Raw detections (pixel) | `camera_optical` | Projected to map via TF2 chain |

---

## Static Transforms (publish once at startup)

```python
# In your launch file or a dedicated static_tf_publisher node
from geometry_msgs.msg import TransformStamped
from tf2_ros import StaticTransformBroadcaster
import math

# Camera mounted on dashboard, looking forward
# Offset: 0.3m forward, 0.1m up from base_link
# Rotation: camera looks forward (no rotation from base_link in this example)
camera_tf = TransformStamped()
camera_tf.header.frame_id = 'base_link'
camera_tf.child_frame_id = 'camera_link'
camera_tf.transform.translation.x = 0.30   # forward
camera_tf.transform.translation.y = 0.00   # center
camera_tf.transform.translation.z = 0.10   # up
camera_tf.transform.rotation.w = 1.0       # identity rotation

# IMU coincides with base_link (phone IS the base)
imu_tf = TransformStamped()
imu_tf.header.frame_id = 'base_link'
imu_tf.child_frame_id = 'imu_link'
imu_tf.transform.rotation.w = 1.0
```

---

## GPS Anchor: World → Map Conversion

At session start (first valid GPS fix), set the map origin:

```python
import pyproj

# Store anchor at session start
anchor_lat, anchor_lon = gps_fix.latitude, gps_fix.longitude

# ENU projection centered on anchor
proj = pyproj.Proj(proj='aeqd',  # Azimuthal Equidistant
                   lat_0=anchor_lat, lon_0=anchor_lon,
                   datum='WGS84', units='m')

def gps_to_map(lat, lon):
    """Convert GPS (WGS84) to map frame (ENU meters from anchor)."""
    x, y = proj(lon, lat)
    return (x, y, 0.0)

def map_to_gps(x, y):
    """Convert map frame (ENU meters) back to GPS."""
    lon, lat = proj(x, y, inverse=True)
    return (lat, lon)
```

---

## 2D→3D Projection Pipeline

```python
import numpy as np
import tf2_ros
import rclpy

def pixel_to_map_xyz(u, v, depth, camera_K, tf_buffer, timestamp):
    """
    Project a 2D detection (u,v) with known depth to map frame.

    Args:
        u, v:      pixel coordinates of detection center
        depth:     estimated depth in meters (from MiDaS + scale)
        camera_K:  3x3 intrinsic matrix [[fx,0,cx],[0,fy,cy],[0,0,1]]
        tf_buffer: tf2_ros.Buffer
        timestamp: rclpy.time.Time

    Returns:
        (x, y, z) in map frame, or None if transform unavailable
    """
    fx, fy = camera_K[0,0], camera_K[1,1]
    cx, cy = camera_K[0,2], camera_K[1,2]

    # Step 1: pixel → camera_optical frame
    x_cam = (u - cx) * depth / fx
    y_cam = (v - cy) * depth / fy
    z_cam = depth
    p_camera = np.array([x_cam, y_cam, z_cam, 1.0])

    # Step 2: camera_optical → map via TF2
    try:
        tf_msg = tf_buffer.lookup_transform(
            'map', 'camera_optical',
            timestamp,
            timeout=rclpy.duration.Duration(seconds=0.1)
        )
    except Exception as e:
        return None

    # Build 4x4 transform matrix from TF msg
    t = tf_msg.transform.translation
    q = tf_msg.transform.rotation
    T = quaternion_to_matrix(q.x, q.y, q.z, q.w)
    T[0:3, 3] = [t.x, t.y, t.z]

    p_map = T @ p_camera
    return tuple(p_map[:3])
```

---

## KITTI Camera Calibration (for dev phase)

KITTI provides `calib_cam_to_cam.txt`. Load it as:

```python
import numpy as np

def load_kitti_calib(calib_path):
    with open(calib_path) as f:
        lines = f.readlines()
    calib = {}
    for line in lines:
        key, *vals = line.strip().split()
        calib[key.rstrip(':')] = np.array([float(v) for v in vals])

    # Camera 2 (left gray) intrinsics
    P2 = calib['P2'].reshape(3, 4)
    K = P2[:3, :3]
    return K

K = load_kitti_calib('data_odometry_calib/sequences/00/calib.txt')
```

---

## Static Map Layer — One-Time OSM → RViz Map Generation

> **User Decision (2026-05-19):** Make this a one-time process — save to files — so RViz (or any visualization topic) can show road network + zones + speed bumpers + signs + any boards, etc.
>
> **Goal:** A **static, persistent navigation overlay** in RViz similar to Google Maps — showing:
> - 🟦 Road network (lines/polygons)
> - 🟡 Speed bumps (markers)
> - 🔴 Signs (traffic signs, warning signs)
> - 🟠 Zones (school, hospital — colored polygons)
> - 🟢 Pedestrian crossings
> - 🔵 Traffic lights
>
> This overlay is **static only** — it does not update at runtime. It is generated **once** from OSM data and saved to disk. On every session start, a single lightweight publisher node loads the file and republishes it as a `visualization_msgs/MarkerArray` on a latched ROS 2 topic. RViz subscribes to it and shows the full road infrastructure map permanently, helping you:
> - Visually verify SLAM pose against road network
> - Track model detections relative to known signs and bumps
> - Debug VLM alerts geographically
> - Monitor drift by watching vehicle position drift away from road centerlines

---

### Step 1: One-Time OSM → Map YAML/JSON Generator Script

**Run this once per area. Output is `static_map.yaml` + `static_map_markers.json`.**

```python
#!/usr/bin/env python3
# infratrack_audit/scripts/generate_static_map.py
# Usage: python3 generate_static_map.py --osm karlsruhe_kitti.osm.pbf --anchor-lat 49.011 --anchor-lon 8.416
#
# OUTPUT: output/static_map_markers.json  (RViz MarkerArray data, pre-baked)
#         output/static_map.geojson        (GeoJSON for Folium web map)

import argparse
import json
import pyproj
import pyrosm
import shapely.geometry as sg

def build_static_map(osm_path: str, anchor_lat: float, anchor_lon: float, out_dir: str = 'output'):
    """One-time conversion: OSM PBF → static marker file."""
    import os; os.makedirs(out_dir, exist_ok=True)

    # ENU projection anchored to GPS start point
    proj = pyproj.Proj(proj='aeqd', lat_0=anchor_lat, lon_0=anchor_lon,
                       datum='WGS84', units='m')

    def gps_to_enu(lat, lon):
        x, y = proj(lon, lat)
        return float(x), float(y)

    osm = pyrosm.OSM(osm_path)
    markers = []
    marker_id = 0

    # ── 1. Road Network (LINE_STRIP markers) ──────────────────────────────────
    roads = osm.get_network(network_type='driving')
    if roads is not None:
        for _, row in roads.iterrows():
            geom = row.geometry
            if geom is None: continue
            if geom.geom_type == 'LineString':
                coords = [gps_to_enu(lat, lon) for lon, lat in geom.coords]
                markers.append({
                    'id': marker_id, 'type': 'road', 'ns': 'road_network',
                    'marker_type': 4,  # LINE_STRIP
                    'color': {'r': 0.4, 'g': 0.4, 'b': 0.9, 'a': 0.7},
                    'scale': 0.5,
                    'points': [{'x': x, 'y': y, 'z': 0.0} for x, y in coords],
                    'highway': row.get('highway', 'unknown'),
                })
                marker_id += 1

    # ── 2. Speed Bumps (CYLINDER markers) ──────────────────────────────────────
    # Get all nodes with traffic_calming tag
    import xml.etree.ElementTree as ET
    # pyrosm doesn't expose raw nodes easily; use osmium python bindings
    try:
        import osmium
        class SpeedBumpHandler(osmium.SimpleHandler):
            def __init__(self): super().__init__(); self.bumps = []
            def node(self, n):
                if n.tags.get('traffic_calming') in ('bump', 'hump', 'cushion', 'table'):
                    self.bumps.append((float(n.location.lat), float(n.location.lon),
                                       n.tags.get('traffic_calming', 'bump')))
        h = SpeedBumpHandler(); h.apply_file(osm_path)
        for lat, lon, ctype in h.bumps:
            x, y = gps_to_enu(lat, lon)
            markers.append({
                'id': marker_id, 'type': 'speed_bump', 'ns': 'speed_bumps',
                'marker_type': 3,  # CYLINDER
                'color': {'r': 1.0, 'g': 0.6, 'b': 0.0, 'a': 1.0},
                'scale': {'x': 2.0, 'y': 2.0, 'z': 0.15},
                'position': {'x': x, 'y': y, 'z': 0.075},
                'calming_type': ctype,
            })
            marker_id += 1
    except ImportError:
        print('WARNING: osmium-python not installed; skip speed bump extraction')
        print('Install: pip install osmium')

    # ── 3. Traffic Signs (ARROW / TEXT_VIEW_FACING markers) ───────────────────
    try:
        import osmium
        class SignHandler(osmium.SimpleHandler):
            SIGN_TAGS = {'highway': ['traffic_signals', 'stop', 'give_way'],
                         'traffic_sign': None, 'crossing': ['zebra', 'traffic_signals']}
            def __init__(self): super().__init__(); self.signs = []
            def node(self, n):
                for key, vals in self.SIGN_TAGS.items():
                    v = n.tags.get(key)
                    if v and (vals is None or v in vals):
                        self.signs.append((float(n.location.lat), float(n.location.lon),
                                           key, v))
                        break
        sh = SignHandler(); sh.apply_file(osm_path)
        sign_colors = {
            'traffic_signals': {'r': 1.0, 'g': 0.0, 'b': 0.0, 'a': 1.0},
            'stop':            {'r': 0.9, 'g': 0.1, 'b': 0.1, 'a': 1.0},
            'give_way':        {'r': 1.0, 'g': 0.5, 'b': 0.0, 'a': 1.0},
            'zebra':           {'r': 0.9, 'g': 0.9, 'b': 0.9, 'a': 1.0},
            'default':         {'r': 0.6, 'g': 0.6, 'b': 0.0, 'a': 1.0},
        }
        for lat, lon, key, val in sh.signs:
            x, y = gps_to_enu(lat, lon)
            color = sign_colors.get(val, sign_colors['default'])
            markers.append({
                'id': marker_id, 'type': 'sign', 'ns': 'traffic_signs',
                'marker_type': 9,  # TEXT_VIEW_FACING
                'color': color,
                'scale': {'z': 1.5},
                'position': {'x': x, 'y': y, 'z': 2.5},
                'text': f'{key}={val}',
                'tag_key': key, 'tag_val': val,
            })
            marker_id += 1
    except Exception: pass

    # ── 4. Zone Polygons (LINE_LIST or CUBE_LIST markers) ─────────────────────
    try:
        pois = osm.get_pois(custom_filter={'amenity': ['school', 'hospital', 'clinic']})
        zone_colors = {
            'school':   {'r': 0.2, 'g': 0.8, 'b': 0.2, 'a': 0.4},
            'hospital': {'r': 0.8, 'g': 0.2, 'b': 0.2, 'a': 0.4},
            'clinic':   {'r': 0.8, 'g': 0.5, 'b': 0.5, 'a': 0.4},
        }
        if pois is not None:
            for _, row in pois.iterrows():
                amenity = row.get('amenity', 'unknown')
                geom = row.geometry
                if geom is None: continue
                centroid = geom.centroid if hasattr(geom, 'centroid') else geom
                cx, cy = gps_to_enu(centroid.y, centroid.x)
                # Draw 100m radius zone circle approximation as 16-point polygon
                import math
                ring = [(cx + 100*math.cos(2*math.pi*i/16),
                         cy + 100*math.sin(2*math.pi*i/16)) for i in range(17)]
                markers.append({
                    'id': marker_id, 'type': 'zone', 'ns': 'zones',
                    'marker_type': 4,  # LINE_STRIP
                    'color': zone_colors.get(amenity, {'r': 0.5, 'g': 0.5, 'b': 0.5, 'a': 0.4}),
                    'scale': 0.3,
                    'points': [{'x': x, 'y': y, 'z': 0.1} for x, y in ring],
                    'amenity': amenity,
                    'name': str(row.get('name', '')),
                })
                marker_id += 1
    except Exception: pass

    # ── Save output ───────────────────────────────────────────────────────────
    out_path = f'{out_dir}/static_map_markers.json'
    with open(out_path, 'w') as f:
        json.dump({'anchor': {'lat': anchor_lat, 'lon': anchor_lon},
                   'frame_id': 'map',
                   'total_markers': len(markers),
                   'markers': markers}, f, indent=2)
    print(f'[StaticMap] Saved {len(markers)} markers → {out_path}')
    return out_path


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--osm', required=True)
    ap.add_argument('--anchor-lat', type=float, required=True)
    ap.add_argument('--anchor-lon', type=float, required=True)
    ap.add_argument('--out', default='output')
    args = ap.parse_args()
    build_static_map(args.osm, args.anchor_lat, args.anchor_lon, args.out)
```

**Run once per OSM area:**
```bash
# For KITTI (Karlsruhe, Germany):
python3 infratrack_audit/scripts/generate_static_map.py \
    --osm output/karlsruhe_kitti.osm.pbf \
    --anchor-lat 49.011 --anchor-lon 8.416 \
    --out output/

# For Bangalore:
python3 infratrack_audit/scripts/generate_static_map.py \
    --osm osm/bangalore.osm.pbf \
    --anchor-lat 12.9716 --anchor-lon 77.5946 \
    --out output/
```

---

### Step 2: Static Map Publisher ROS 2 Node

This node loads the pre-baked JSON on startup and publishes a **latched** `MarkerArray` on `/infratrack/static_map_markers`. Latched means RViz receives the full map immediately upon subscribing — **even if the node started before RViz**.

```python
#!/usr/bin/env python3
# infratrack_viz/nodes/static_map_publisher_node.py
# Publishes a pre-baked static MarkerArray from static_map_markers.json
# One-time load, latched publish. No runtime updates.

import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, DurabilityPolicy, ReliabilityPolicy
from visualization_msgs.msg import MarkerArray, Marker
from geometry_msgs.msg import Point
from std_msgs.msg import ColorRGBA
import json, time

LATCHED_QOS = QoSProfile(
    depth=1,
    durability=DurabilityPolicy.TRANSIENT_LOCAL,  # latched
    reliability=ReliabilityPolicy.RELIABLE,
)

MARKER_TYPE_MAP = {
    3: Marker.CYLINDER,
    4: Marker.LINE_STRIP,
    9: Marker.TEXT_VIEW_FACING,
}

class StaticMapPublisher(Node):
    def __init__(self):
        super().__init__('static_map_publisher_node')
        self.declare_parameter('map_file', 'output/static_map_markers.json')
        self.declare_parameter('frame_id', 'map')

        map_file = self.get_parameter('map_file').value
        frame_id = self.get_parameter('frame_id').value

        self.pub = self.create_publisher(
            MarkerArray, '/infratrack/static_map_markers', LATCHED_QOS)

        self.get_logger().info(f'Loading static map: {map_file}')
        with open(map_file) as f:
            data = json.load(f)

        msg = MarkerArray()
        for m in data['markers']:
            marker = Marker()
            marker.header.frame_id = frame_id
            marker.header.stamp = self.get_clock().now().to_msg()
            marker.ns = m.get('ns', 'static_map')
            marker.id = m['id']
            marker.action = Marker.ADD
            marker.type = MARKER_TYPE_MAP.get(m.get('marker_type', 4), Marker.LINE_STRIP)

            # Color
            c = m.get('color', {'r':1,'g':1,'b':1,'a':1})
            marker.color = ColorRGBA(r=c['r'], g=c['g'], b=c['b'], a=c['a'])

            # Scale
            sc = m.get('scale', 0.5)
            if isinstance(sc, dict):
                marker.scale.x = sc.get('x', 0.5)
                marker.scale.y = sc.get('y', 0.5)
                marker.scale.z = sc.get('z', 0.5)
            else:
                marker.scale.x = marker.scale.y = marker.scale.z = float(sc)

            # Points (LINE_STRIP)
            for pt in m.get('points', []):
                p = Point(); p.x = pt['x']; p.y = pt['y']; p.z = pt.get('z', 0.0)
                marker.points.append(p)

            # Position (CYLINDER, TEXT)
            pos = m.get('position', {})
            marker.pose.position.x = pos.get('x', 0.0)
            marker.pose.position.y = pos.get('y', 0.0)
            marker.pose.position.z = pos.get('z', 0.0)
            marker.pose.orientation.w = 1.0

            # Text label
            marker.text = m.get('text', '')

            # Lifetime: 0 = forever (static markers never expire)
            marker.lifetime.sec = 0

            msg.markers.append(marker)

        self.pub.publish(msg)
        self.get_logger().info(
            f'[StaticMap] Published {len(msg.markers)} static markers on /infratrack/static_map_markers (latched)')


def main(args=None):
    rclpy.init(args=args)
    node = StaticMapPublisher()
    rclpy.spin(node)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

---

### Step 3: RViz Configuration

Add these displays to your `.rviz` config file (or via RViz GUI → Add → By Topic):

```yaml
# In your infratrack.rviz file — add these Displays:
Displays:
  # 1. Fixed Frame must be 'map' for static markers to align with SLAM
  - Class: rviz_common/TF
    Name: TF
    Enabled: true

  # 2. Static Infrastructure Map (Road Network + Signs + Zones + Bumps)
  - Class: rviz_common/MarkerArray
    Name: Static Infrastructure Map
    Enabled: true
    Topic:
      Value: /infratrack/static_map_markers
      Depth: 1
      QoS: TRANSIENT_LOCAL   # <-- must match publisher latched QoS
    Namespaces:
      road_network: true
      speed_bumps:  true
      traffic_signs: true
      zones:        true

  # 3. Dynamic detections (perception output — runtime)
  - Class: rviz_common/MarkerArray
    Name: Detected Objects (Runtime)
    Topic:
      Value: /infratrack/semantic_map_markers
      Depth: 5

  # 4. SLAM Map
  - Class: rviz_common/Map
    Name: RTAB-Map Occupancy Grid
    Topic:
      Value: /rtabmap/grid_map

  # 5. Vehicle path
  - Class: rviz_common/Path
    Name: Vehicle Trajectory
    Topic:
      Value: /infratrack/vehicle_path

  # 6. VLM Alert text markers
  - Class: rviz_common/MarkerArray
    Name: VLM Alerts
    Topic:
      Value: /infratrack/vlm_alert_markers
```

---

### Step 4: Launch Integration

Add the static map publisher to the main launch file so it starts automatically:

```python
# In infratrack_bringup/launch/infratrack_offline.launch.py — add:

Node(
    package='infratrack_viz',
    executable='static_map_publisher_node',
    name='static_map_publisher',
    parameters=[{
        'map_file': 'output/static_map_markers.json',
        'frame_id': 'map',
    }],
    # This node starts and publishes once — safe to run before rosbag
),
```

---

### Static Map Layer Summary

```
ONE-TIME SETUP (run offline, save to disk)
──────────────────────────────────────────
[OSM .pbf file]
    │
    ▼ generate_static_map.py
    │   ├── Road network      → LINE_STRIP markers (blue)
    │   ├── Speed bumps       → CYLINDER markers (orange)
    │   ├── Traffic signs     → TEXT markers (red/yellow)
    │   └── Zones             → LINE_STRIP polygon (green/red)
    │
    ▼
[output/static_map_markers.json]     ← saved once, reused every session


SESSION STARTUP (every rosbag playback)
────────────────────────────────────────
[static_map_publisher_node]
    │  loads JSON → publishes MarkerArray (LATCHED)
    ▼
/infratrack/static_map_markers  ──► [RViz]
                                      │
                                      ├── Road network overlay
                                      ├── Expected sign positions
                                      ├── Zone boundaries
                                      └── Speed bump locations
                                          (all persistent, never expire)

RUNTIME (during rosbag playback)
─────────────────────────────────
[Perception + VLM nodes]
    │
    ├── /infratrack/semantic_map_markers  → detected objects
    ├── /infratrack/vlm_alert_markers    → VLM analysis text overlays
    └── /tf (map→odom→base_link)         → vehicle pose

 Result: Google Maps-like navigation overlay in RViz
 • Static layer: road network + expected signs (from OSM)
 • Dynamic layer: what the model actually detected
 • Drift visible: vehicle track deviates from road center → SLAM issue
 • Missing sign visible: expected sign marker present, no detection nearby
```

---

### Required Dependencies

```bash
# Python dependencies for generate_static_map.py:
pip install pyrosm osmium pyproj shapely

# ROS 2 packages (already in workspace):
# visualization_msgs, geometry_msgs, std_msgs — all standard

# RViz2 (already installed with ROS 2 Humble):
sudo apt install ros-humble-rviz2
```

> **⚠️ REMARK:** The static map frame (`frame_id: 'map'`) must be the **same frame published by RTAB-Map SLAM**. If RTAB-Map hasn't started yet or the map frame is not yet broadcasting, RViz will show "No transform from [map] to [Fixed Frame]". This is expected — start RTAB-Map first, then static markers will snap into place. Static markers are anchored to the GPS ENU origin set at `anchor_lat`/`anchor_lon` — this must match the `gps_to_map()` anchor used by the `expected_state_generator_node`.
