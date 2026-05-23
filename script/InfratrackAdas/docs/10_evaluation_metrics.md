# Evaluation Metrics — Detailed Reference

**Section:** 10 of Master Plan | **File:** `docs/10_evaluation_metrics.md`

---

## Overview

Every module has a quantitative target. We evaluate on public datasets **first**, then on phone recordings once the pipeline is stable.

---

## 10.1 Object Detection — mAP@0.5

**Tool:** KITTI Object Benchmark + Ultralytics validation CLI  
**Dataset:** KITTI `object/training/` (7,481 labeled frames)

```bash
# Run YOLOv8 evaluation on KITTI
yolo val model=yolov8n.pt data=kitti.yaml imgsz=640 conf=0.35 iou=0.5
```

**Targets:**

| Class | Target mAP@0.5 | Baseline (YOLOv8n) |
|-------|---------------|-------------------|
| Car | ≥ 0.85 | ~0.88 |
| Pedestrian | ≥ 0.70 | ~0.72 |
| Cyclist | ≥ 0.65 | ~0.68 |
| Traffic Sign | ≥ 0.60 | custom fine-tune needed |

**Failure Criterion:** mAP < 0.50 on any safety-critical class → model must be retrained or replaced.

---

## 10.2 Multi-Object Tracking — MOTA / MOTP

**Tool:** nuScenes tracking evaluation kit  
**Dataset:** nuScenes mini (10 scenes, 400 frames each)

```bash
pip install nuscenes-devkit
python -m nuscenes.eval.tracking.evaluate \
  --result_path results/tracking_output.json \
  --output_dir results/eval/ \
  --eval_set mini_val \
  --dataroot data/nuscenes/
```

**Metrics:**

| Metric | Description | Target |
|--------|-------------|--------|
| MOTA | Multi-Object Tracking Accuracy (penalizes FP, FN, ID switches) | ≥ 0.45 |
| MOTP | Multi-Object Tracking Precision (localization accuracy) | ≥ 0.70 |
| IDs | Number of identity switches | ≤ 50 per sequence |
| MT% | Mostly Tracked (> 80% of lifespan tracked) | ≥ 60% |
| ML% | Mostly Lost (< 20% of lifespan tracked) | ≤ 15% |

---

## 10.3 Visual Odometry Accuracy — ATE / RPE

**Tool:** `evo` Python package  
**Dataset:** KITTI Odometry sequences 00–10 (ground truth GPS trajectories provided)

```bash
pip install evo

# Absolute Trajectory Error
evo_ape kitti ground_truth.txt estimated_traj.txt \
  --align --correct_scale --plot --save_results results/ate.zip

# Relative Pose Error (per 100m segment)
evo_rpe kitti ground_truth.txt estimated_traj.txt \
  --delta 100 --delta_unit m --align --plot
```

**Targets:**

| Metric | Description | Target |
|--------|-------------|--------|
| ATE RMSE | RMS of absolute position error over full sequence | ≤ 5m per 100m driven |
| RPE trans | Translation drift per 100m segment | ≤ 2% (2m per 100m) |
| RPE rot | Rotation drift | ≤ 1°/100m |

**Drift Bound Check:** At 500m driven, ATE should be ≤ 25m. If higher, GPS re-anchor frequency must increase.

---

## 10.4 Depth Estimation — AbsRel / RMSE

**Tool:** Custom eval script against KITTI depth benchmark  
**Dataset:** KITTI Eigen split (officially used for monocular depth evaluation)

```python
# Standard metrics (from Eigen et al. 2014)
abs_rel = mean(|gt - pred| / gt)   # target: < 0.10
rmse    = sqrt(mean((gt - pred)²)) # target: < 4.0 m
```

**Targets for MiDaS v2.1 small (scale-invariant):**

| Metric | Target | MiDaS v2.1 baseline |
|--------|--------|---------------------|
| AbsRel | ≤ 0.12 | ~0.11 |
| RMSE | ≤ 4.5m | ~4.2m |
| δ<1.25 | ≥ 0.85 | ~0.88 |

**Note:** MiDaS outputs relative depth (no absolute scale). Scale is recovered from either:
- SLAM point cloud nearest surface intersection
- IMU height estimation (camera height above ground is known)

---

## 10.5 Infrastructure Detection — Precision / Recall

**Tool:** Custom annotated test sequence (manual ground truth)  
**Dataset:** Phone rosbag of a known road (Phase 5) OR KITTI sequence with manually labeled signs

**Annotation format:** GeoJSON with known sign positions → compare against InfraTrack's VERIFIED markers.

| Metric | Description | Target |
|--------|-------------|--------|
| Precision | Of all flagged MISSING entities, how many are actually missing? | ≥ 0.80 |
| Recall | Of all truly missing entities, how many did we catch? | ≥ 0.70 |
| F1 | Harmonic mean | ≥ 0.75 |
| False Positive Rate | Alerts fired on correct infrastructure | ≤ 0.15 |

**Why Recall > Precision target?** Missing a real safety hazard (false negative) is worse than one extra alert.

---

## 10.6 Road Quality Assessment

**Tool:** Manual annotation of test rosbag frames  
**Ground Truth:** Human rater scores severity 1–5 for each defect region

| Metric | Description | Target |
|--------|-------------|--------|
| Severity Correlation | Pearson r between VLM score and human score | ≥ 0.75 |
| Defect Detection Rate | Fraction of real defects detected by SegFormer | ≥ 0.70 |
| False Alarm Rate | Clean road segments flagged as damaged | ≤ 0.10 |

---

## 10.7 End-to-End System — Missing Infra Recall

**Tool:** Gazebo synthetic world (known ground truth) + custom eval script  
**Method:**
1. Build Gazebo world with deliberate missing signs (e.g., remove speed_bump_warning at 3 locations)
2. Drive the route, record rosbag
3. Run full InfraTrack pipeline
4. Compare alerts vs. ground truth removals

| Metric | Target |
|--------|--------|
| End-to-end missing sign recall | ≥ 0.80 |
| End-to-end false positive rate | ≤ 0.20 |
| Alert latency (frames from first miss to alert) | ≤ 15 frames |

---

## 10.8 Running All Evals (Combined Script)

```bash
# eval/run_all_evals.sh
#!/bin/bash
set -e

echo "=== 1. Object Detection ==="
yolo val model=weights/yolov8n_infratrack.pt data=config/kitti.yaml --save-json

echo "=== 2. VO Accuracy ==="
evo_ape kitti data/kitti/gt/00.txt results/vo/sequence_00.txt \
  --align --correct_scale --save_results results/eval/ate_seq00.zip

echo "=== 3. Depth Evaluation ==="
python eval/eval_depth.py --pred results/depth/ --gt data/kitti/depth_gt/

echo "=== 4. Tracking ==="
python -m nuscenes.eval.tracking.evaluate \
  --result_path results/tracking.json \
  --output_dir results/eval/tracking/ \
  --eval_set mini_val --dataroot data/nuscenes/

echo "=== 5. Infrastructure Detection ==="
python eval/eval_infrastructure.py \
  --tkg results/tkg_final.pkl \
  --gt data/annotations/test_road_gt.geojson

echo "=== All evals complete. See results/eval/ ==="
```
