# Three.js Interactive 3D Portfolio — thippeswammy.github.io

## Goal

Build a stunning, fully interactive **Three.js 3D galaxy world** as the landing page for `thippeswammy.github.io`. 50+ projects float as glowing nodes across 6 themed clusters, with beautiful structured info panels — all curated from the `.md` files (not raw markdown dumps). No build step, no npm, one self-contained `index.html` at the repo root.

---

## Confirmed Decisions

| Decision | Choice |
|---|---|
| Classic 2D view toggle | ❌ No — replaced entirely |
| Private repos | ✅ Show with 🔒 lock icon, use `.md` data for info panel |
| Sub-module `.md` files | 📝 Used as **context to write curated summaries only** — not shown as 3D satellites or tabs |
| Info panel content | 🎨 Structured, visually clean Three.js-styled panel — **not raw markdown render** |
| Navigation style | 🖱️ Click-to-zoom (planet → project → info panel) |
| Mobile fallback | ⏸️ Hold — desktop first |
| Output file location | 📄 Root `index.html` (not `dist/`) |
| `dist/` folder | Rename to `legacy/` (keep old 2D portfolio untouched inside) |

---

## File Structure

```
thippeswammy.github.io/           ← repo root
├── index.html                    ← NEW Three.js 3D portfolio (this file)
├── legacy/                       ← RENAMED from dist/ (old 2D portfolio)
│   ├── index.html
│   └── index.css
├── *.md                          ← Project .md files (served by GitHub Pages)
└── ... (other repo files)
```

> [!NOTE]
> `index.html` at root is what GitHub Pages serves for `thippeswammy.github.io`. No `.md` file fetching at runtime — all curated project data is **embedded** directly in the JS data constant inside `index.html`.

---

## 6 Cluster Design

The old categories are reorganized — "vehicle = robotics" logic applied:

| # | Cluster | Color | Emoji | Projects |
|---|---|---|---|---|
| 1 | **AI & Computer Vision** | `#3b82f6` electric blue | 🧠 | ADAS, AutoSegmentor, FaceRecognition, ImageProcessingCourse, Deep-Learning-Specialization |
| 2 | **Robotics & Autonomous Systems** | `#06b6d4` cyan | 🤖 | ORB_SLAM2/3, DROID_SLAM, DPVO, LaneMappingTool, Carla, ZED2i, ORB_SLAM3_ROS2, sdf_to_nav_mesh, rtab_ws, rtabmap, 3d_robot, VO2MAP, kitti-odom-eval, MultipleVo, my_bot |
| 3 | **Games** | `#a855f7` purple | 🎮 | Snake, TicTacToe (GUI+Text), Puzzle, Maze, Flappy Bird, DownShooter, ChainReaction, BallonBlast, BrickGame, SuperMario, CarRacing (Unity), AR-Cube-Drop |
| 4 | **Embedded & Hardware** | `#f97316` orange | ⚡ | Arduino, MatlabModels, EceProject, MBD-dSPACE, dSPACE |
| 5 | **Apps & Software** | `#22c55e` green | 📱 | JarvisControlSystem, SpeechCalculator, SmartCarParking, LoginSystem (x2), BasicMathCalc, NumberGuesser, HandCricket, SimpleContacts, MultiAppRunner, SecureAppLocker, CalculatorGuiApp, RoadTagByCameraGps |
| 6 | **Dev Tools & Research** | `#ec4899` pink | 🔧 | ROSDataRecorder, DataVisualizationTool, LidarScanSegment, my_mcp_project, NeetCodeProblems |

---

## Curated Project Data Model

Each project is stored as a structured JS object — curated from `.md` files, **not rendered raw**:

```js
{
  id: "AutoSegmentor",
  name: "AutoSegmentor",
  cluster: "ai_cv",
  tagline: "Auto-labeling ecosystem for AI datasets",   // 1 punchy line
  summary: "Integrates Meta's SAM2 with CoTracker to convert raw videos into structured YOLO datasets with minimal human input. Features a PyQt5 GUI, real-time mask propagation, and async GPU processing.",
  highlights: [                                           // 3-5 key points
    "SAM2 + CoTracker for pixel-perfect mask generation",
    "Interactive PyQt5 GUI with zoom, undo/redo, multi-class annotation",
    "Async GPU processing — UI stays responsive during inference",
    "One-click YOLO v8/v11 dataset export with augmentation"
  ],
  tech: ["Python", "PyTorch", "SAM2", "PyQt5", "CUDA"],  // tech tags
  language: "Python",
  stars: 0, forks: 0,
  github: "https://github.com/thippeswammy/AutoSegmentor",
  isPrivate: false
}
```

### Full Curated Data — All 50+ Projects

**AI & Computer Vision (Cluster 1)**

| Project | Tagline | Key Highlights | Tech |
|---|---|---|---|
| **AutoSegmentor** | Auto-labeling with SAM2 + CoTracker | SAM2 mask propagation, YOLO export, async GPU, PyQt5 GUI | Python, SAM2, PyTorch, CUDA |
| **ADAS-for-Indian-Road-Vehicle** | ADAS for Indian road conditions | YOLOv8-Seg, 45K+ images, 95%+ accuracy, real-time segmentation | Python, YOLOv8, OpenCV |
| **FaceRecognition** | Dual-engine face recognition system | One-shot dynamic tagging + YOLOv8 static detection, depth sensing | Python, YOLO, ZED2i |
| **ImageProcessingCourse** | Classic image processing techniques | Filtering, transforms, analysis from Duke/Coursera course | Python, OpenCV, NumPy |
| **Deep-Learning-Specialization** | Coursera DL specialization exercises | Neural networks, CNNs, RNNs, optimization | Python, TensorFlow |

**Robotics & Autonomous Systems (Cluster 2)**

| Project | Tagline | Key Highlights | Tech |
|---|---|---|---|
| **LaneMappingTool** | Lane graph mapping for autonomous vehicles | Graph-based lane network, B-spline smoothing, React+Flask web app, AV deployment | Python, React, Flask |
| **ORB_SLAM2** | Visual SLAM for monocular/stereo/RGB-D | Feature-based mapping, loop closure, real-time trajectory | C++, OpenCV, g2o |
| **ORB_SLAM3** | Multi-sensor visual-inertial SLAM | Monocular+stereo+IMU, multi-map, fisheye support, IEEE TRO 2021 | C++, Eigen, DBoW2 |
| **DROID_SLAM** | Deep visual SLAM, multi-GPU | Monocular/stereo/RGB-D, ARM64/Jetson support, real-time trajectory | Python, PyTorch |
| **DPVO** | Deep patch visual odometry | Lightweight VO re-implementation for real-world accuracy | C++, Python |
| **ORB_SLAM3_ROS2** | ORB-SLAM3 with ROS 2 integration | ROS 2 wrapper for SLAM pipeline | C++, ROS 2 |
| **ZED2i** | Stereo vision + data intelligence | ZED + RealSense sync, Mask R-CNN depth, Hungarian matching | Python, ZED SDK, PyTorch |
| **Carla** | CARLA simulator autonomous driving | Traffic generation, scenario control, vehicle behavior testing | Python, C++ |
| **sdf_to_nav_mesh** | SDF to navigation mesh converter | Gazebo SDF→.ply/.dae/.h5 with terrain metadata for AV stacks | Python, ROS 2 |
| **VO2MAP** | Visual odometry to map pipeline | Converts VO output to structured navigation maps | HTML, Python |
| **kitti-odom-eval** | KITTI odometry evaluation | Trajectory accuracy benchmarking against ground truth | Python |
| **3d_robot** | 3D robot simulation & control | ROS-based 3D robot model and control system | C++, ROS |
| **rtab_ws / rtabmap** | RTAB-Map SLAM workspace | RGB-D SLAM with loop closure and 3D mapping | C++, ROS |
| **my_bot** | ROS robot navigation bot | Autonomous navigation and control stack | Python, ROS |
| **MultipleVo** | Multiple visual odometry comparison | Benchmarks multiple VO pipelines on same dataset | HTML, Python |

**Games (Cluster 3)**

| Project | Tagline | Key Highlights | Tech |
|---|---|---|---|
| **Snake-GUI-game** | Classic Snake with Java Swing | Real-time game loop, collision detection, custom rendering | Java |
| **TicTacToeGUI** | AI-powered Tic Tac Toe | Strategy-driven AI, win-condition logic, event-driven GUI | Java |
| **Puzzle-game** | Number puzzle, 3×3 to 6×6 | Dynamic grid, randomized init, multiple grid sizes | Java |
| **Maze-game** | Maze with AI enemies | Enemy AI, speed boosts, level progression, 2D Greenfoot | Java |
| **Flappy-bird-game** | Flappy Bird clone | Classic obstacle navigation, score tracking | Java |
| **DownShooterGame** | Top-down 2D shooter | Enemy AI, boss battles, health system | Java |
| **ChainReactionGame** | Multiplayer chain-reaction strategy | Turn-based, propagation logic, grid state management | Java |
| **BallonBlastGame** | 2D balloon shooting | Projectile mechanics, scoring, multiple targets | Java |
| **BrickGame** | Brick breaker | Ball physics, paddle control, destruction | Java |
| **SuperMarioGame** | Greenfoot platformer | Flappy-Bird-style mechanics in Greenfoot | Java |
| **CarRacingUnity** | 3D car racing game | Unity, multiple vehicles, nav guidance, sound FX | Unity/C# |
| **AR-Cube-Drop** | AR cube placement | Unity ARFoundation, real-time spawning, AR scene capture | C#, Unity |

**Embedded & Hardware (Cluster 4)**

| Project | Tagline | Key Highlights | Tech |
|---|---|---|---|
| **Arduino** | Embedded systems collection | Obstacle avoidance, CAN bus, face tracking, IoT water management | C++, Arduino |
| **MatlabModels** | MATLAB/Simulink automotive models | SIL/HIL workflows, Arduino/RPi/STM32/dSPACE integration | MATLAB, Simulink |
| **MBD-dSPACE** | dSPACE SCALEXIO vehicle control | No physical ECU, signal loopback, SIL+HIL validation | MATLAB, Simulink, dSPACE |
| **EceProject** | ECE engineering workspace | Arduino systems, stereo camera, IoT with ESP8266/RPi | Python, C++ |

**Apps & Software (Cluster 5)**

| Project | Tagline | Key Highlights | Tech |
|---|---|---|---|
| **JarvisControlSystem** | J.A.R.V.I.S. AI desktop agent | LLM orchestrator, A* UI navigation, Telegram remote, DAG memory | Python, Ollama |
| **SmartCarParkingSystem** | Real-time smart parking app | Firebase real-time DB, Google Maps, IoT sensors, payment gateway | Android, Firebase |
| **SpeechCalculator** | Voice-enabled math calculator | Android speech recognition, custom expression parser | Java, Android |
| **RoadTagByCameraGps** | Road tagging with camera+GPS | GPS-tagged road data collection via mobile | Kotlin, Android |
| **LoginSystemWithAdvanceGUI** | Advanced Java auth system | Event-driven login/registration, modular GUI | Java |
| **TicTacToeGUI** | Already in Games cluster | — | — |
| **NeetCodeProblems** | Coding problem solutions | NeetCode roadmap solutions in Java | Java |

**Dev Tools & Research (Cluster 6)**

| Project | Tagline | Key Highlights | Tech |
|---|---|---|---|
| **ROSDataRecorder** | ROS data recording & comparison | Synchronized sensor log recording, comparison walkthrough | Python, ROS |
| **DataVisualizationEditingTool** | Interactive data visualization editor | Custom plotting and annotation tools | Python |
| **LidarScanSegment** | LiDAR point cloud segmentation | Scan-level segmentation for autonomous perception | Python |
| **my_mcp_project** | MCP protocol project | Model context protocol tooling | Python |

---

## 3D Scene Architecture

```
Three.js Scene
├── Galaxy Background (5,000 star particles, subtle nebula color)
├── Central Sun (profile avatar texture, bloom glow, slow rotation)
├── 6 Cluster Planets (colored spheres, orbital paths, labels)
│   └── Project Nodes (15-20 smaller spheres per cluster, glow on hover)
├── Orbit Rings (dashed torus geometry per cluster)
├── UI Overlay (HTML, position:fixed over canvas)
│   ├── Top Bar: Avatar + Name + GitHub link + Search
│   ├── Cluster Filter Pills (top-right)
│   ├── Project Info Panel (right-side drawer — slides in on click)
│   └── Back / Deselect hint (bottom center)
```

### Info Panel — Structured Visual Layout

When a project node is clicked, a **glassmorphism side panel** slides in showing:

```
┌─────────────────────────────────┐
│  🧠  AutoSegmentor              │
│  Auto-labeling with SAM2        │
├─────────────────────────────────┤
│  Integrates Meta's SAM2 with    │
│  CoTracker to auto-generate     │
│  YOLO datasets from video...    │
├─────────────────────────────────┤
│  ● SAM2 + CoTracker propagation │
│  ● Interactive PyQt5 GUI        │
│  ● Async GPU processing         │
│  ● One-click YOLO export        │
├─────────────────────────────────┤
│  [Python] [SAM2] [CUDA] [PyQt5] │
├─────────────────────────────────┤
│  ⭐ 0   🍴 0   🔓 Public        │
│  [→ View on GitHub]             │
└─────────────────────────────────┘
```

- No raw markdown. No scrolling text walls.
- Tags rendered as colored chips (matching cluster color)
- Private repos show 🔒 instead of GitHub link

---

## Interaction Flow

```
[Page Load]
    → Particle starfield fades in
    → Sun sphere appears at center (profile photo texture)
    → 6 planets orbit out with staggered GSAP animation
    → Project nodes populate around planets
    → Auto-slow camera rotation begins

[Hover Planet]
    → Planet scale 1.0 → 1.1, emissive glow increases
    → Floating label shows: "🤖 Robotics & Autonomous — 15 projects"

[Click Planet]
    → Camera GSAP tween zooms into cluster
    → Other clusters dim (opacity 0.2)
    → Projects spread further apart for visibility

[Hover Project Node]
    → Node pulses (scale animation)
    → Tooltip: name + language badge

[Click Project Node]
    → Camera zooms to node
    → Right-side info panel slides in (CSS transform translateX)
    → Panel shows: tagline, summary, highlights, tech tags, stats, GitHub link

[Click Background / ESC]
    → Camera zooms back out to full galaxy view
    → Info panel slides out
    → All clusters re-illuminate
```

---

## Visual Design System

### Color Palette
```
Background:       #030712  (deep space black)
Star particles:   #e2e8f0, #94a3b8, #6366f1  (white/blue/violet mix)
Sun glow:         #fbbf24  (warm gold)
Cluster 1 AI:     #3b82f6  (electric blue)
Cluster 2 Robot:  #06b6d4  (cyan)
Cluster 3 Games:  #a855f7  (purple)
Cluster 4 HW:     #f97316  (orange)
Cluster 5 Apps:   #22c55e  (green)
Cluster 6 Tools:  #ec4899  (pink)

Glass panel BG:   rgba(10, 18, 38, 0.85)
Glass border:     rgba(255,255,255,0.08)
Glass blur:       backdrop-filter: blur(24px)

Text primary:     #f8fafc
Text secondary:   #94a3b8
```

### Typography (Google Fonts)
- **Orbitron** — headings, project names, cluster labels (futuristic sci-fi feel)
- **Inter** — body text, descriptions, stats

### CDN Dependencies (no build step)
```html
<!-- Three.js via importmap -->
<script type="importmap">
  { "imports": {
      "three": "https://esm.sh/three@0.158.0",
      "three/addons/": "https://esm.sh/three@0.158.0/examples/jsm/"
  }}
</script>
<!-- GSAP for camera tweens -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
```

---

## Implementation Phases

### Phase 1 — Data Layer
- [x] Extract and curate all 50+ project entries from `.md` files + `dist/index.html`
- [x] Group into 6 clusters
- [x] Write curated tagline, summary, highlights, tech tags per project
- [ ] Encode into `PROJECTS` and `CLUSTERS` JS constants inside `index.html`

### Phase 2 — File Setup
- [ ] Rename `dist/` → `legacy/` in repo
- [ ] Create `index.html` at repo root

### Phase 3 — Three.js Scene
- [ ] Scene, perspective camera, WebGL renderer (full viewport)
- [ ] 5,000-star particle system with subtle nebula coloring
- [ ] Central sun sphere (MeshStandardMaterial + PointLight, avatar texture)
- [ ] 6 cluster planet spheres with orbital torus rings
- [ ] Project node spheres (1 per project, arranged in cluster orbit)
- [ ] Labels (CSS2DRenderer or canvas texture) for planets

### Phase 4 — Interaction
- [ ] OrbitControls for drag/zoom
- [ ] Raycaster for hover detection (planet, node)
- [ ] GSAP camera tweens: galaxy → cluster → node
- [ ] Hover: emissive glow change, scale pulse
- [ ] Cluster isolation: dim other clusters on click
- [ ] ESC / background click resets view

### Phase 5 — UI Overlay
- [ ] Top bar: avatar, name, GitHub link, search input
- [ ] Cluster filter pills (click to jump to cluster)
- [ ] Info panel component (right drawer, glassmorphism)
  - [ ] Tagline + summary section
  - [ ] Highlights list with bullet dots (cluster-color)
  - [ ] Tech tag chips
  - [ ] Stars / forks / private badge
  - [ ] GitHub link button (or 🔒 for private)
- [ ] Search: filters visible nodes by name/tech in real time
- [ ] Loading screen (brief, fades out into scene)

### Phase 6 — Polish
- [ ] Shooting star particle emitter (random, occasional)
- [ ] Sun pulsing glow animation
- [ ] Planet slow self-rotation
- [ ] Project node gentle float animation (sine wave Y offset)
- [ ] Smooth panel enter/exit transitions
- [ ] Responsive: panel goes to bottom drawer on narrower screens

---

## Verification Plan

### Build Check
```bash
# Serve from repo root (no build needed)
cd /home/thippe/workspaces/NonProjects/thippeswammy.github.io
python3 -m http.server 8080
# Open http://localhost:8080
```

### Test Checklist
- [ ] Three.js scene renders, no console errors
- [ ] All 6 cluster planets visible and orbiting
- [ ] Hover glow works on at least 3 planets + 5 project nodes
- [ ] Click-to-zoom works: galaxy → cluster → project
- [ ] Info panel opens with correct curated data
- [ ] Private repo shows 🔒, no broken GitHub link
- [ ] Search filters nodes correctly
- [ ] ESC / background click resets camera
- [ ] GitHub Pages URL `thippeswammy.github.io` serves the new `index.html`
