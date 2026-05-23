# Module Specification — Detailed Reference

**Section:** 6 of Master Plan | **File:** `docs/06_module_specification.md`

---

## VRAM Budget (RTX 3050, 4 GB)

All modules run **sequentially** during rosbag playback (not simultaneously):

| Module | Model | VRAM | Runs |
|--------|-------|------|------|
| Object Detection | YOLOv8n (TensorRT FP16) | ~0.8 GB | Every frame |
| Semantic Segmentation | SegFormer-B0 | ~0.5 GB | Every frame |
| Monocular Depth | MiDaS v2.1 small | ~0.3 GB | Every frame |
| OCR | EasyOCR (CPU fallback OK) | ~0.2 GB | On sign crop ROIs |
| VLM | Qwen-VL-2B (4-bit GGUF) | ~1.5 GB | Event-triggered only |
| **Peak (VLM active)** | | **~3.3 GB** | |

---

## Module 1: Object Detection Node

**Package:** `infratrack_perception`  
**Node name:** `object_detector_node`  
**Model:** YOLOv8n (fine-tuned or vanilla)

```python
# Classes detected (COCO + custom traffic sign classes)
DETECTION_CLASSES = [
    # Vehicles
    'car', 'truck', 'bus', 'motorcycle', 'bicycle',
    # Vulnerable road users
    'person', 'rider',
    # Infrastructure (custom fine-tune)
    'traffic_sign', 'traffic_light', 'speed_bump', 'barrier', 'cone'
]

# TensorRT export (run once)
# yolo export model=yolov8n.pt format=engine device=0 half=True
```

**Key parameters:**
```yaml
confidence_threshold: 0.35   # lower = more candidates for VLM to verify
iou_threshold: 0.45
input_size: 640              # px
device: cuda:0
```

**Subscriptions:** `/camera/image_raw`  
**Publications:** `/infratrack/detections` (`Detection2DArray`)

---

## Module 2: Semantic Segmentation Node

**Model:** SegFormer-B0 (HuggingFace `nvidia/segformer-b0-finetuned-cityscapes-512-1024`)

**Classes used:**

| Cityscapes Class | InfraTrack Use |
|-----------------|----------------|
| road | Road ROI for surface assessment |
| sidewalk | Pedestrian zone detection |
| traffic sign | Sign region mask |
| traffic light | Traffic light presence |
| building | Context for urban/rural classifier |
| vegetation | Context |

**Custom fine-tune classes (Phase 3):**
- `pothole` — not in Cityscapes; fine-tune on IDD (Indian Driving Dataset)
- `crack` — surface defect
- `patch` — repaired area (quality indicator)
- `speed_bump` — transverse structure

**Install:**
```bash
pip install transformers torch torchvision
# Model downloads automatically from HuggingFace on first run (~50 MB)
```

### 🔬 Optional: SAM2 / SAM3-Lite as Segmentation Backbone

> **User Decision (2026-05-19): Can we use SAM2 or SAM3 (light model)?**
>
> **Answer: Yes — with the following guidance:**

#### SAM2 (Segment Anything Model 2 — Meta)
- **Repo:** https://github.com/facebookresearch/segment-anything-2
- **Model sizes:** SAM2-tiny (~38M params), SAM2-small (~46M), SAM2-base (~80M), SAM2-large (~225M)
- **VRAM (tiny/small):** ~0.8–1.2 GB — fits in 4GB budget
- **Strengths:** Zero-shot instance segmentation with prompts (point / bbox / text). No class-specific fine-tuning needed for new object types.
- **Use in InfraTrack:**
  - Segment road defects (potholes, cracks) using bbox prompt from YOLO detection output
  - Segment sign regions for improved crop quality before OCR/VLM
  - Zero-shot — works without IDD fine-tune (great for prototyping Phase 1–2)
- **Install:**
  ```bash
  pip install git+https://github.com/facebookresearch/segment-anything-2.git
  # Download checkpoint (tiny = ~155 MB)
  wget https://dl.fbaipublicfiles.com/segment_anything_2/sam2_hiera_tiny.pt
  ```
- **Usage (bbox-prompted segmentation):**
  ```python
  from sam2.build_sam import build_sam2
  from sam2.sam2_image_predictor import SAM2ImagePredictor
  import torch

  sam2 = build_sam2('sam2_hiera_tiny.yaml', 'sam2_hiera_tiny.pt', device='cuda')
  predictor = SAM2ImagePredictor(sam2)

  def segment_roi(image_rgb, bbox_xyxy):
      predictor.set_image(image_rgb)
      masks, scores, _ = predictor.predict(
          box=bbox_xyxy,
          multimask_output=False
      )
      return masks[0]  # binary mask, same shape as image
  ```

#### SAM3 / LightSAM (Light Models)
> **Note on naming:** There is no official "SAM3" as of 2026-05-19. The light alternatives to SAM2 are:
> - **SAM2-tiny** — smallest official SAM2 variant (~155 MB checkpoint)
> - **MobileSAM** — distilled lightweight SAM (https://github.com/ChaoningZhang/MobileSAM), ~9 MB
> - **EfficientSAM** — ~20 MB, optimized for edge devices
> - **NanoSAM** — NVIDIA's TensorRT-optimized SAM for Jetson/embedded
>
> **Recommended light option: MobileSAM** (fits in 4GB, fastest inference ~40ms/frame)

```bash
pip install mobile_sam
# Checkpoint: ~38 MB
wget https://github.com/ChaoningZhang/MobileSAM/raw/master/weights/mobile_sam.pt
```

```python
from mobile_sam import sam_model_registry, SamPredictor

mobile_sam = sam_model_registry['vit_t'](checkpoint='mobile_sam.pt')
mobile_sam.cuda().eval()
predictor = SamPredictor(mobile_sam)

def segment_sign_crop(image_rgb, bbox):
    predictor.set_image(image_rgb)
    masks, _, _ = predictor.predict(
        box=bbox,
        multimask_output=False
    )
    return masks[0]
```

#### ✅ SAM vs. SegFormer Decision Guide

| Model | VRAM | Speed | Fine-tune Needed | Zero-shot | Best For |
|-------|------|-------|-----------------|-----------|----------|
| SegFormer-B0 | ~0.5 GB | Fast | Yes (for potholes) | No | Semantic road segmentation |
| SAM2-tiny | ~0.8 GB | Medium | No | Yes | Instance seg, novel defects |
| MobileSAM | ~0.3 GB | Fast | No | Yes | Light prototype, sign crops |
| EfficientSAM | ~0.4 GB | Fast | No | Yes | Edge-friendly alternative |

> **⚠️ REMARK:** SegFormer-B0 remains the **primary segmentation model** in this architecture (Module 2) because it provides pixel-level semantic labels (road/pothole/crack/patch) needed by the road quality scoring algorithm. SAM2/MobileSAM **complement** SegFormer — they can be used as:
> 1. A bbox-to-mask refinement step after YOLO detection (better crop quality for VLM)
> 2. A zero-shot fallback when no fine-tuned SegFormer is available
> 3. A parallelizable module in Phase 2 once VRAM headroom is validated
>
> **Do not replace SegFormer with SAM silently — both serve different roles.**



**Model:** MiDaS v2.1 small (`midas_v21_small_256`)

**Output:** Relative inverse depth map (values in [0,1]). Scale is recovered using:
1. **RTAB-Map point cloud:** find nearest LiDAR/SLAM point for the detected bbox center
2. **Ground plane assumption:** camera height above road is fixed → use homography for road-level objects

```python
import torch
import cv2

model_type = "MiDaS_small"
midas = torch.hub.load("intel-isl/MiDaS", model_type)
midas.eval().cuda()

transforms = torch.hub.load("intel-isl/MiDaS", "transforms").small_transform

def estimate_depth(frame_bgr):
    img = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    input_batch = transforms(img).cuda()
    with torch.no_grad():
        prediction = midas(input_batch)
        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1), size=img.shape[:2],
            mode="bicubic", align_corners=False,
        ).squeeze().cpu().numpy()
    return prediction  # relative depth, needs scale
```

---

## Module 4: ByteTrack Multi-Object Tracker

**Repo:** https://github.com/ifzhang/ByteTrack  
**Input:** YOLOv8 detections (bboxes + scores)  
**Output:** Persistent track IDs + smoothed bbox

```bash
pip install lapx   # required for ByteTrack assignment
```

**Velocity Estimation:**
```python
# Given track trajectory in map frame (x,y positions over time)
def estimate_velocity(trajectory: list, dt: float) -> float:
    if len(trajectory) < 2: return 0.0
    dx = trajectory[-1][0] - trajectory[-2][0]
    dy = trajectory[-1][1] - trajectory[-2][1]
    return (dx**2 + dy**2)**0.5 / dt  # m/s

# Anomaly thresholds
ANOMALIES = {
    'speed_violation': lambda v, limit: v > limit * 1.2,  # 20% over limit
    'wrong_way': lambda heading, road_heading: abs(heading - road_heading) > 150,
    'parked': lambda v, t_stopped: v < 0.5 and t_stopped > 30,  # 30 sec
    'erratic': lambda accel: abs(accel) > 4.0,  # m/s² sudden change
}
```

---

## Module 5: OCR Node (Sign Text Extraction)

**Model:** EasyOCR  
**Trigger:** Only fires on crops from `traffic_sign` detections

```python
import easyocr
reader = easyocr.Reader(['en', 'kn'])  # English + Kannada for Bangalore

def extract_sign_text(sign_crop):
    results = reader.readtext(sign_crop)
    texts = [text for (_, text, conf) in results if conf > 0.5]
    return ' '.join(texts)

# Landmark pattern matching
import re
KM_PATTERN = re.compile(r'(\w[\w\s]+)\s+(\d+)\s*km', re.IGNORECASE)

def extract_landmark(text):
    m = KM_PATTERN.search(text)
    if m:
        return {'destination': m.group(1).strip(), 'distance_km': int(m.group(2))}
    return None
```

---

## Module 6: VLM Async Node (Qwen-VL-2B)

**Model:** `Qwen/Qwen-VL-Chat` (2B, 4-bit quantized via `bitsandbytes`)  
**Trigger:** Event messages on `/infratrack/vlm_trigger` topic  
**Output:** Structured JSON + text on `/infratrack/vlm_reports`

**Prompt Templates:**

```python
PROMPTS = {
    'DISCREPANCY': (
        "You are a road safety inspector. Look at this image carefully. "
        "The system expects a '{expected_sign}' sign near this location. "
        "1. Is such a sign visible? (yes/no) "
        "2. If not, describe what you see instead. "
        "3. Confidence (0.0-1.0). "
        "Respond in JSON: {{\"sign_present\": bool, \"description\": str, \"confidence\": float}}"
    ),
    'ROAD_QUALITY': (
        "You are a road maintenance engineer. Look at this road surface image. "
        "1. Rate the damage severity from 1 (perfect) to 5 (destroyed). "
        "2. Describe the defect type (pothole, crack, patch, etc.). "
        "3. Estimate the approximate size. "
        "Respond in JSON: {{\"severity\": int, \"defect_type\": str, \"size_estimate\": str, \"description\": str}}"
    ),
    'GHOST_SIGN': (
        "Look at this road sign. "
        "1. What does this sign say or depict? "
        "2. Is it an official government road sign? (yes/no/unclear) "
        "3. Is it in good condition? "
        "Respond in JSON: {{\"sign_content\": str, \"is_official\": str, \"condition\": str}}"
    ),
    'BEHAVIOR': (
        "Look at this traffic scene. A vehicle has been flagged for anomalous behavior. "
        "1. Describe the driving behavior you observe. "
        "2. Does anything appear dangerous or illegal? "
        "Respond in JSON: {{\"behavior_description\": str, \"appears_dangerous\": bool}}"
    )
}
```

**Install (4-bit quantization):**
```bash
pip install transformers bitsandbytes accelerate
# Model will auto-download on first run (~4 GB, cached after)
```
