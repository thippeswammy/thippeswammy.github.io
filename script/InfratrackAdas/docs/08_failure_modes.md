# Failure Modes & Degraded Operation — Reference

**Section:** 8 of Master Plan | **File:** `docs/08_failure_modes.md`

---

## Watchdog Node

A dedicated `infratrack_watchdog_node` monitors all subsystems and publishes a health topic:

```
/infratrack/system_health  (custom msg: SystemHealth)
  ├── camera_ok:       bool
  ├── gps_ok:          bool
  ├── slam_ok:         bool
  ├── vlm_ok:          bool
  └── degraded_reason: string
```

All other nodes subscribe to this topic and switch to degraded behavior when flagged.

---

## Failure Table

### F1 — Camera Feed Drop

| Item | Detail |
|------|--------|
| **Detection** | No `/camera/image_raw` message for > 2 seconds |
| **Degraded Action** | Disable `object_detector_node`, `depth_node`, `segmentation_node` |
| **TKG Action** | Freeze all entity states; set `state=DEGRADED`; record timestamp |
| **Recovery** | Camera topic resumes → wait 5 frames → resume normal operation |
| **Log** | `WARN: Camera feed lost at t=<timestamp>. All vision nodes paused.` |

### F2 — GPS Fix Lost

| Item | Detail |
|------|--------|
| **Detection** | `NavSatFix.status == STATUS_NO_FIX` for > 5 seconds |
| **Degraded Action** | Switch to **pure VO** (RTAB-Map `odom` frame only) |
| **TKG Action** | Expand `confidence_radius` of all markers by 2× per 100m driven |
| **Expected State Gen** | Paused; last known zone definitions stay active |
| **Recovery** | GPS fix resumes; re-anchor TKG using new GPS position |
| **Log** | `WARN: GPS fix lost. Switching to pure VO. Marker confidence expanding.` |

### F3 — SLAM / VO Divergence

| Item | Detail |
|------|--------|
| **Detection** | VO covariance trace > 5.0 m² OR loop-closure rejection rate > 80% |
| **Degraded Action** | Freeze `map` frame; use `odom`-only tracking |
| **TKG Action** | Mark all VERIFIED markers as `DEGRADED`; disable new CANDIDATE creation |
| **Alert** | Emit `SLAM_DIVERGED` system alert (high severity) |
| **Recovery** | Requires manual re-initialization of RTAB-Map |
| **Log** | `ERROR: SLAM diverged. Map frame frozen. Markers degraded.` |

### F4 — VLM Timeout

| Item | Detail |
|------|--------|
| **Detection** | VLM response not received within 30 seconds of trigger |
| **Degraded Action** | Skip VLM confirmation for this event |
| **TKG Action** | Mark triggering entity as `NEEDS_REVIEW` (not confirmed) |
| **Output** | Entity included in report with `vlm_report: "TIMEOUT - manual review required"` |
| **Recovery** | Automatic; next VLM trigger proceeds normally |
| **Log** | `WARN: VLM timeout for entity <id>. Marked for manual review.` |

### F5 — OCR Failure

| Item | Detail |
|------|--------|
| **Detection** | EasyOCR returns empty result or confidence < 0.3 on sign crop |
| **Degraded Action** | Skip landmark triangulation for this frame |
| **TKG Action** | No drift correction applied; VO drift continues growing |
| **Recovery** | Automatic; next readable sign triggers correction |
| **Log** | `INFO: OCR failed on sign crop. Skipping landmark correction.` |

### F6 — Out-of-Memory (VRAM)

| Item | Detail |
|------|--------|
| **Detection** | CUDA OOM exception in any perception node |
| **Degraded Action** | Reduce batch size to 1; disable SegFormer temporarily |
| **Alternative** | Offload SegFormer to CPU (slow but functional) |
| **Prevention** | Monitor with `nvidia-smi -l 1`; ensure no other GPU apps running |
| **Log** | `ERROR: CUDA OOM. Reducing to single-frame mode. SegFormer on CPU.` |

---

## Degraded Mode State Diagram

```
NORMAL ──────────────────────────────────────────► NORMAL
  │                                                   ▲
  ├── Camera Drop ──────► VISION_DEGRADED ────────────┤
  │                                                   │
  ├── GPS Lost ───────► LOCALIZATION_DEGRADED ────────┤
  │                                                   │
  ├── SLAM Diverge ───► MAP_FROZEN ───────────────────┤
  │                        (requires manual reset)    │
  │                                                   │
  ├── VLM Timeout ────► PARTIAL (auto-recover) ───────┤
  │                                                   │
  └── OOM ────────────► REDUCED_CAPACITY ─────────────┘
```

---

## Watchdog Implementation Sketch

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from sensor_msgs.msg import NavSatFix, Image

class WatchdogNode(Node):
    def __init__(self):
        super().__init__('infratrack_watchdog')
        self.last_camera_t = self.get_clock().now()
        self.last_gps_t = self.get_clock().now()
        self.camera_ok = True
        self.gps_ok = True

        self.create_subscription(Image, '/camera/image_raw',
            lambda m: setattr(self, 'last_camera_t', self.get_clock().now()), 10)
        self.create_subscription(NavSatFix, '/fix',
            self._gps_cb, 10)
        self.health_pub = self.create_publisher(String, '/infratrack/system_health', 10)
        self.create_timer(1.0, self._check_health)

    def _gps_cb(self, msg):
        from sensor_msgs.msg import NavSatStatus
        self.gps_ok = (msg.status.status >= NavSatStatus.STATUS_FIX)
        self.last_gps_t = self.get_clock().now()

    def _check_health(self):
        now = self.get_clock().now()
        cam_age = (now - self.last_camera_t).nanoseconds / 1e9
        if cam_age > 2.0:
            self.camera_ok = False
            self.get_logger().warn(f'Camera feed lost ({cam_age:.1f}s ago)')
        else:
            self.camera_ok = True

        status = 'OK' if (self.camera_ok and self.gps_ok) else 'DEGRADED'
        msg = String()
        msg.data = status
        self.health_pub.publish(msg)
```
