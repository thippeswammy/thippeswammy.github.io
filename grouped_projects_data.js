// ═══════════════════════════════════════════════════════════════════
// projects_data.js  —  Complete Project Portfolio Data
// ═══════════════════════════════════════════════════════════════════

window.CLUSTERS = [
  { id: 'vision', label: 'AI & CV', full: 'AI & Computer Vision', color: 0x3b82f6, css: '#3b82f6', emoji: '👁️' },
  { id: 'robotics', label: 'ROBOTICS', full: 'Robotics & Autonomous Systems', color: 0x06b6d4, css: '#06b6d4', emoji: '🤖' },
  { id: 'embedded', label: 'EMBEDDED', full: 'Embedded & Hardware', color: 0xf97316, css: '#f97316', emoji: '🔌' },
  { id: 'software', label: 'SOFTWARE', full: 'Desktop Applications', color: 0x10b981, css: '#10b981', emoji: '💻' },
  { id: 'mobile', label: 'MOBILE & AR', full: 'Mobile & Augmented Reality', color: 0x8b5cf6, css: '#8b5cf6', emoji: '📱' },
  { id: 'games', label: 'GAMES', full: 'Games & Interactive', color: 0xd946ef, css: '#d946ef', emoji: '🎮' },
  { id: 'research', label: 'RESEARCH', full: 'Research & Dev Tools', color: 0xec4899, css: '#ec4899', emoji: '🔬' },
  { id: 'others', label: 'OTHERS', full: 'Miscellaneous & Sandbox', color: 0x64748b, css: '#64748b', emoji: '📂' },
];

window.PINNED_PROJECTS = [
  'autoseg',
  'jarviscontrolsystem',
  'lanemappingtool',
  'adas-for-indian-road-vehicle',
  'facerecognition',
  'mbd-dspace',
  'droid-slam',
];

window.MASTER_PROJECTS = [

  // ── AI & COMPUTER VISION ────────────────────────────────────────────────────────────────
  {
    id: 'adas_road_perception_suite',
    name: 'Advanced Driver Assistance Systems (ADAS) & Road Perception',
    cluster: 'vision',
    tagline: 'Automated road segmentation, offline infrastructure auditing, and multi-task perception pipelines',
    summary: 'A comprehensive road perception and infrastructure auditing ecosystem. Integrates monocular SLAM (RTAB-Map), YOLOv8 instance detection, and SegFormer segmentation to build a Temporal Knowledge Graph (TKG) for offline municipal audits, alongside high-speed U-Net and HybridNets lane tracking pipelines.',
    highlights: [
      'Offline road infrastructure auditing and road quality assessment using local VLM reasoning (Qwen-VL-2B)',
      'Time-indexed Temporal Knowledge Graph (TKG) for spatial-temporal entity tracking and VO drift correction',
      'YOLOv8-Seg instance segmentation trained on 45,000+ custom Indian road images',
      'Flagship ONNX HybridNets model running at 60+ FPS via CUDA acceleration'
    ],
    tech: ['CUDA', 'Computer Vision', 'NetworkX', 'ONNX Runtime', 'OpenCV', 'PyTorch', 'Python', 'Qwen-VL', 'ROS 2', 'RTAB-Map', 'SAM2', 'TensorFlow', 'YOLOv8'],
    github: 'https://github.com/thippeswammy/ADAS-for-Indian-Road-Vehicle',
    repositories: [
      { name: 'adas_for_indian_road_vehicle', role: 'YOLOv8-Seg Road Segmentation & Instance Tracking', github: 'https://github.com/thippeswammy/ADAS-for-Indian-Road-Vehicle' },
      { name: 'infratrackadas', role: 'Offline Monocular ADAS Road Audit & Temporal Knowledge Graph Pipeline', github: 'https://github.com/thippeswammy/InfratrackAdas' },
      { name: 'lanelinesdetection', role: 'Traditional CV & Deep Learning Lane Detection comparative suite', github: 'https://github.com/thippeswammy/LaneLinesDetection' }
    ],
    isPrivate: false,
    status: 'active',
    team: 'solo',
    platform: ['CUDA', 'Linux', 'ROS 2']
  },

  {
    id: 'autosegmentor_master',
    name: 'AutoSegmentor',
    cluster: 'vision',
    tagline: 'State-of-the-art AI auto-labeling and video segmentation dataset creation suite',
    summary: 'An end-to-end AI-powered auto-labeling and segmentation ecosystem. Integrates Meta AI\'s SAM2 and CoTracker within an asynchronous, multi-threaded PyQt5 desktop interface to propagate annotations and export fully augmented YOLO-compatible datasets.',
    highlights: [
      'Meta SAM2 temporal mask propagation across video frame sequences',
      'CoTracker keypoint and optical flow tracking for precise pose estimation',
      'Responsive, multi-threaded PyQt5 UI canvas with dynamic foreground/background annotations',
      'YOLOv8/v11 custom dataset builder with copy-paste data augmentations'
    ],
    tech: ['Python', 'PyQt5', 'PyTorch', 'SAM2', 'CoTracker', 'CUDA', 'YOLOv8', 'OpenCV'],
    github: 'https://github.com/thippeswammy/AutoSegmentor',
    repositories: [
      { name: 'autoseg', role: 'Interactive PyQt5 SAM2 Video Auto-Labeling Desktop Suite', github: 'https://github.com/thippeswammy/AutoSegmentor' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['Windows', 'Linux', 'CUDA']
  },

  {
    id: 'facerecognition_master',
    name: 'FaceRecognition',
    cluster: 'vision',
    tagline: 'High-fidelity face recognition and automated tagging pipelines',
    summary: 'A comprehensive real-time face recognition and automatic tagging suite. Leverages static and dynamic YOLO pipelines with custom CNN feature extractors, complete with full multi-threaded architectural walkthroughs.',
    highlights: [
      'Automated tagging engine with dynamic face database updates',
      'Static YOLO models optimized for high-density crowds',
      'Multi-threaded python architecture pipeline processing',
      'Millisecond-level inference and retrieval logs validation'
    ],
    tech: ['Intel RealSense SDK', 'OpenCV', 'PyTorch', 'Python', 'YOLOv8', 'dlib', 'face_recognition'],
    github: 'https://github.com/thippeswammy/FaceRecognition',
    repositories: [
      { name: 'facerecognition', role: 'Face Recognition and Dynamic Auto-Tagging System', github: 'https://github.com/thippeswammy/FaceRecognition' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['Linux', 'Raspberry Pi', 'Windows']
  },

  {
    id: 'zed2i_stereo_vision_ecosystem',
    name: 'ZED2i Advanced Stereo Vision Ecosystem',
    cluster: 'vision',
    tagline: 'Professional spatial data acquisition and deep learning depth estimation',
    summary: 'A professional-grade ecosystem for StereoLabs ZED2i and Intel RealSense integration. Bridges raw spatial sensor acquisition with high-level AI perception, featuring deep learning depth estimation and synchronized multi-camera recording.',
    highlights: [
      'Synchronized multi-camera recording (ZED + RealSense D435i)',
      'Deep learning-based depth estimation (Mask R-CNN ResNet50)',
      'Hungarian Matching and millimeter-level depth filtering',
      'High-Frequency IMU & spatial sensor data logging'
    ],
    tech: ['Intel RealSense SDK', 'OpenCV', 'PyTorch', 'Python', 'ZED SDK'],
    github: 'https://github.com/thippeswammy/ZED2i',
    repositories: [
      { name: 'zed2i', role: 'ZED2i & RealSense Synchronized Stereo Acquisition Suite', github: 'https://github.com/thippeswammy/ZED2i' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: []
  },


  // ── ROBOTICS & AUTONOMOUS SYSTEMS ────────────────────────────────────────────────────────────────
  {
    id: '3d_vehicle_navigation_ecosystem',
    name: '3D Vehicle SLAM & Autonomous Navigation Ecosystem',
    cluster: 'robotics',
    tagline: 'GPU-accelerated elevation mapping and navigation mesh generation for mobile robots',
    summary: 'A sophisticated 3D robotic navigation ecosystem. Integrates Gazebo SDF simulation geometry extraction with GPU-accelerated terrain mapping (CuPy) and Visibility Cleanup pipelines to generate high-resolution navigation meshes (.ply, .dae, .h5) for legged and wheeled robots.',
    highlights: [
      'GPU-Accelerated Elevation Mapping using CuPy and CUDA',
      'Gazebo SDF World to PLY/DAE/H5 Navigation Mesh conversion pipeline',
      'Visibility Cleanup, Artifact Removal, and Plane Segmentation filters',
      'Learning-based Traversability Filters for uneven environments'
    ],
    tech: ['C++', 'CUDA', 'CuPy', 'Gazebo', 'PCD', 'Python', 'ROS', 'ROS 2', 'SLAM', 'h5py', 'shapely', 'trimesh'],
    github: 'https://github.com/thippeswammy/3d_robot',
    repositories: [
      { name: '3d_robot', role: '3D SLAM, Terrain Analysis, and Simulation Workbench', github: 'https://github.com/thippeswammy/3d_robot' },
      { name: 'elevation_mapping_cupy', role: 'GPU-Accelerated Elevation Mapping using CuPy', github: 'https://github.com/thippeswammy/elevation_mapping_cupy' },
      { name: 'sdf_to_nav_mesh', role: 'SDF World to ROS 2 Navigation Mesh Converter', github: 'https://github.com/thippeswammy/sdf_to_nav_mesh' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['CUDA', 'ROS', 'ROS 2', 'ROS 2 Humble', 'Ubuntu', 'Ubuntu 22.04']
  },

  {
    id: 'dpvo_ecosystem',
    name: 'Deep Patch Visual Odometry (DPVO)',
    cluster: 'robotics',
    tagline: 'Deep Patch Visual Odometry and Visual SLAM',
    summary: 'A deep learning-based visual odometry and SLAM system that estimates trajectories and dense point clouds from monocular video sequences. Features loop closure backends and Pangolin visualizer integration.',
    highlights: [
      'Deep Patch Visual Odometry (DPVO) learning engine',
      'Pangolin Viewer for real-time Monocular trajectory visualization',
      'Dense Point Cloud estimation from monocular feeds',
      'Classical loop-closure backend integration'
    ],
    tech: ['C++', 'CUDA', 'Pangolin', 'PyTorch', 'Python', 'SLAM'],
    github: 'https://github.com/thippeswammy/DPVO',
    repositories: [
      { name: 'dpvo', role: 'Deep Patch Visual Odometry Core Engine', github: 'https://github.com/thippeswammy/DPVO' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['CUDA 11/12', 'Ubuntu 20/22']
  },

  {
    id: 'droid_slam_ecosystem',
    name: 'DROID-SLAM: Deep Visual SLAM Ecosystem',
    cluster: 'robotics',
    tagline: 'Deep Visual SLAM for Monocular, Stereo, and RGB-D cameras',
    summary: 'A state-of-the-art deep learning-based visual SLAM system utilizing dense bundle adjustment and learned features, achieving extreme trajectory estimation accuracy across monocular, stereo, and RGB-D setups.',
    highlights: [
      'Deep learning-based Visual SLAM with dense bundle adjustment',
      'Supports monocular, stereo, and RGB-D camera systems',
      'Asynchronous and multi-GPU parallel inference optimization',
      'Evaluated and validated on TartanAir, EuRoC, TUM-RGBD, and ETH3D datasets'
    ],
    tech: ['CUDA', 'Deep Learning', 'PyTorch', 'Python', 'SLAM'],
    github: 'https://github.com/thippeswammy/DROID_slam',
    repositories: [
      { name: 'droid_slam', role: 'DROID-SLAM Deep Visual SLAM Engine', github: 'https://github.com/thippeswammy/DROID_slam' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['CUDA', 'Ubuntu']
  },

  {
    id: 'lanemappingtool_master',
    name: 'LaneMappingTool',
    cluster: 'robotics',
    tagline: 'Lane graph mapping and visualization for autonomous vehicles',
    summary: 'Transforms noisy recorded vehicle paths into structured graph-based lane networks with B-spline smoothing, junction logic, and an interactive React+Flask web dashboard, deploying directly to autonomous vehicle stacks.',
    highlights: [
      'Graph-based lane network representation (nodes + edges)',
      'High-fidelity B-Spline path smoothing and junction analysis',
      'Interactive React + Vite frontend and Flask REST backend',
      'Deploys to AV stacks via optimized pickle exports'
    ],
    tech: ['adas', 'autonomous-driving', 'chart.js', 'flask', 'python', 'react'],
    github: 'https://github.com/thippeswammy/LaneMappingTool',
    repositories: [
      { name: 'lanemappingtool', role: 'Lane Graph Mapping Tool & React/Flask Dashboard', github: 'https://github.com/thippeswammy/LaneMappingTool' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['Linux', 'Web', 'Windows']
  },

  {
    id: 'orb_slam_evaluation_suite',
    name: 'ORB-SLAM & Trajectory Evaluation Suite',
    cluster: 'robotics',
    tagline: 'Highly optimized Visual SLAM pipelines and benchmark evaluation toolkit',
    summary: 'A complete visual odometry and SLAM suite leveraging ORB-SLAM2 and ORB-SLAM3. Features camera integration, ROS 2 workspace deployment, and an enhanced evaluation toolbox supporting multiple pose formats (KITTI, TUM) and automatic timestamp alignment.',
    highlights: [
      'Visual SLAM support for Monocular, Stereo, and RGB-D cameras',
      'ROS 2 Humble integration for ORB-SLAM3 state estimation',
      'Robust parsing of multiple pose formats and automatic timestamp normalization',
      'Evaluation of trajectory drift across alignments like 7DoF, 6DoF, and scale'
    ],
    tech: ['C++', 'Eigen3', 'NumPy', 'ORB_SLAM3', 'OpenCV', 'Pandas', 'Pangolin', 'Plotly', 'PyYAML', 'Python', 'ROS', 'ROS2', 'SLAM', 'SciPy'],
    github: 'https://github.com/thippeswammy/ORB_SLAM2',
    repositories: [
      { name: 'orb_slam2', role: 'ORB-SLAM2 Monocular, Stereo, and RGB-D SLAM', github: 'https://github.com/thippeswammy/ORB_SLAM2' },
      { name: 'orb_slam3', role: 'ORB-SLAM3 State-of-the-Art Visual-Inertial SLAM', github: 'https://github.com/thippeswammy/ORB_SLAM3' },
      { name: 'orb_slam3_ros2', role: 'ROS 2 Humble Wrapper for ORB-SLAM3', github: 'https://github.com/thippeswammy/ORB_SLAM3_ROS2' },
      { name: 'kitti-odom-eval', role: 'KITTI Odometry Trajectory Evaluation Toolbox', github: 'https://github.com/thippeswammy/kitti-odom-eval' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['ROS', 'ROS2', 'Ubuntu 14.04', 'Ubuntu 16.04', 'Ubuntu 18.04', 'Ubuntu 20.04']
  },

  {
    id: 'rtabmap_slam_suite',
    name: 'RTAB-Map Spatial Mapping & SLAM Suite',
    cluster: 'robotics',
    tagline: 'Real-Time Appearance-Based Mapping ecosystem for 3D LiDAR & RGB-D SLAM',
    summary: 'A unified professional ecosystem centered around RTAB-Map SLAM. Combines the core C++ library, custom ROS 1 & ROS 2 wrapper integration, and workspace-level evaluation platforms analyzing feature descriptors and loop-closure matching on public datasets.',
    highlights: [
      'RGB-D, Stereo and Lidar Graph-Based SLAM',
      'Incremental appearance-based loop closure detection',
      'Evaluated feature descriptors (ORB, SIFT, KAZE, SuperPoint) and matchers (SuperGlue) on KITTI Sequence 09',
      'ROS 1 & ROS 2 robot and navigation stack integration'
    ],
    tech: ['C++', 'Docker', 'ROS', 'ROS 1', 'ROS 2', 'RTAB-Map', 'SLAM'],
    github: 'https://github.com/thippeswammy/rtabmap',
    repositories: [
      { name: 'rtabmap', role: 'Core SLAM C++ Library & Standalone App', github: 'https://github.com/thippeswammy/rtabmap' },
      { name: 'rtabmap_ros', role: 'ROS/ROS 2 Sensor & Robot Wrapper Integration', github: 'https://github.com/thippeswammy/rtabmap_ros' },
      { name: 'rtab_ws', role: 'KITTI Sequence 09 Trajectory Accuracy Evaluation Workbench', github: 'https://github.com/thippeswammy/rtab_ws' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['Linux', 'ROS', 'ROS 2', 'Ubuntu', 'Windows']
  },

  {
    id: 'semantic_robot_perception_master',
    name: 'Autonomous Mobile Robot Vision & Semantic Mapping Stack',
    cluster: 'robotics',
    tagline: 'ROS 2 mobile robot navigation stack with real-time 3D spatial semantic mapping',
    summary: 'A complete ROS 2 Humble & Gazebo simulation stack for differential drive robots. Combines physical physics stabilization and autonomous Nav2 navigation with a real-time 3D spatial semantic mapping suite that projects YOLO-World detections and LiDAR lasers into persistent RViz markers.',
    highlights: [
      'Autonomous SLAM navigation and wheel controller physics stabilization in Gazebo',
      'Open-vocabulary object recognition using YOLO-World and centroid tracking',
      'Camera-LiDAR inverse depth projection for 3D marker generation',
      'Dynamic persistent database of spatial obstacles with heading and confidence indicators'
    ],
    tech: ['C++', 'Python', 'ROS 2 Humble', 'Gazebo', 'YOLO-World', 'SLAM', 'LiDAR', 'RViz'],
    github: 'https://github.com/thippeswammy/semantic-robot-perception',
    repositories: [
      { name: 'semantic-robot-perception', role: 'Complete ROS 2 Autonomous Robot Perception & Navigation Stack', github: 'https://github.com/thippeswammy/semantic-robot-perception' },
      { name: 'my_bot', role: 'Stabilized robot URDF model and Nav2 parameters configuration', github: 'https://github.com/thippeswammy/my_bot' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['ROS 2 Humble', 'Linux']
  },


  // ── EMBEDDED & HARDWARE ────────────────────────────────────────────────────────────────
  {
    id: 'embedded_microcontroller_systems',
    name: 'Embedded Microcontroller & IoT Systems',
    cluster: 'embedded',
    tagline: 'Arduino and microcontroller workspace spanning CAN communication, tracking, and smart IoT',
    summary: 'A comprehensive collection of embedded projects combining microcontroller hardware (Arduino, ESP8266, STM32, Raspberry Pi) with sensors, actuator loops, gesture triggers, and computer vision models.',
    highlights: [
      'Arduino CAN Bus nodes for physical network communications',
      'Smart IoT systems including Water Managers and LCD nodes',
      'Computer Vision integration (YOLOv8 face/fire tracking) with microcontrollers',
      'Gesture Recognition and serial hardware control loops via Python'
    ],
    tech: ['Arduino', 'C++', 'Computer Vision', 'Embedded Systems', 'Hardware', 'Python', 'YOLOv8'],
    github: 'https://github.com/thippeswammy/Arduino',
    repositories: [
      { name: 'arduino', role: 'Arduino physical hardware project collections', github: 'https://github.com/thippeswammy/Arduino' },
      { name: 'eceproject', role: 'Electronics and Computer Engineering physical workspace', github: 'https://github.com/thippeswammy/EceProject' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['Arduino', 'ESP8266', 'Raspberry Pi']
  },

  {
    id: 'model_based_automotive_design',
    name: 'Model-Based Design & Real-Time Automotive Simulation',
    cluster: 'embedded',
    tagline: 'Model-Based Design, Vehicle Behavioral Modeling, and HIL dSPACE projects',
    summary: 'A comprehensive workspace for Model-Based Design (MBD) and hardware simulation of automotive systems. Features dSPACE hardware integration, Simulink vehicle behavioral modeling, and CARLA autonomous simulation scripts.',
    highlights: [
      'Model-Based Design (MBD) workflow using MATLAB and Simulink',
      'Automotive behavioral modeling (steering, braking, custom dashboard components)',
      'dSPACE real-time Hardware-in-the-Loop (HIL) concepts integration',
      'CARLA Simulator Python API workspace for autonomous vehicle controls'
    ],
    tech: ['Arduino', 'CARLA', 'MATLAB', 'Python', 'Raspberry Pi', 'STM32', 'Simulink', 'dSPACE'],
    github: 'https://github.com/thippeswammy/MBD-dSPACE',
    repositories: [
      { name: 'mbd_dspace', role: 'MBD and Vehicle Controller dSPACE workspace', github: 'https://github.com/thippeswammy/MBD-dSPACE' },
      { name: 'matlabmodels', role: 'MATLAB/Simulink automotive behavioral models', github: 'https://github.com/thippeswammy/MatlabModels' },
      { name: 'dspace', role: 'dSPACE hardware-in-the-loop simulation models', github: 'https://github.com/thippeswammy/dSPACE' },
      { name: 'carla', role: 'CARLA Simulator Python API Autonomous driving script workspace', github: 'https://github.com/thippeswammy/Carla' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: []
  },


  // ── MOBILE & AUGMENTED REALITY ────────────────────────────────────────────────────────────────
  {
    id: 'mobile_applications_ar',
    name: 'Mobile Applications & Augmented Reality Suite',
    cluster: 'mobile',
    tagline: 'Android utilities, real-time geolocation systems, and Unity AR experiences',
    summary: 'A diverse portfolio of mobile-first engineering, ranging from real-time smart car parking systems and voice-activated Android utility applications to Unity ARFoundation spatial placement engines.',
    highlights: [
      'Real-time smart car parking reservation engine using Firebase Firestore and Google Maps API',
      'Voice-controlled speech recognition calculator deployed to Google Play Store',
      'Unity ARFoundation dynamic color-cube placement and scene capture application'
    ],
    tech: ['Java', 'Android Studio', 'Firebase Firestore', 'Firebase Auth', 'Google Maps API', 'IoT', 'C#', 'Unity', 'ARFoundation'],
    github: 'https://github.com/thippeswammy/SmartParking',
    repositories: [
      { name: 'connect2park', role: 'Smart Car Parking Real-Time Android App', github: 'https://github.com/thippeswammy/SmartParking' },
      { name: 'speechcalculator', role: 'Voice-Activated Speech Calculator Android App', github: 'https://github.com/thippeswammy/SpeechCalculator' },
      { name: 'ar_cube_drop', role: 'Unity ARFoundation Mobile Cube Placement', github: 'https://github.com/thippeswammy/AR-Cube-Drop' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['Android', 'iOS']
  },


  // ── DESKTOP APPLICATIONS & SOFTWARE ────────────────────────────────────────────────────────────────
  {
    id: 'datavisualizationeditingtool_master',
    name: 'DataVisualizationEditingTool',
    cluster: 'software',
    tagline: 'NumPy-based trajectory data visualization and editing workbench',
    summary: 'A specialized tool designed to visualize, clean, and edit NumPy (.npy) dataset sequences for autonomous systems, featuring interactive plot boundaries, manual coordinate overrides, and export formats.',
    highlights: [
      'Interactive plotting and trajectory visualization of NumPy arrays',
      'Manual coordinate overrides and segment cleaning boundaries',
      'Optimized batch exports for training pipelines',
      'Designed for autonomous vehicle road data curation'
    ],
    tech: ['Matplotlib', 'NumPy', 'Python'],
    github: 'https://github.com/thippeswammy/DataVisualizationEditingTool',
    repositories: [
      { name: 'datavisualizationeditingtool', role: 'NumPy Data Visualization & Editing Workbench', github: 'https://github.com/thippeswammy/DataVisualizationEditingTool' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['Linux', 'Windows']
  },

  {
    id: 'jarvis_assistant_ecosystem',
    name: 'Jarvis Intelligent Virtual Assistant Ecosystem',
    cluster: 'software',
    tagline: 'Self-aware, state-persistent autonomous desktop agent driven by local LLMs',
    summary: 'An advanced virtual assistant inspired by J.A.R.V.I.S. Built on the v2.1 \'Iron Man\' Architecture, it decouples cognitive intent from physical execution using local LLMs (Ollama) and State-Aware Delta Navigation (Look-Before-You-Leap).',
    highlights: [
      'Orchestrator brain with continuous Verification loops',
      'Powered by local LLMs (Ollama, gemma3) and RAG pipelines',
      'Self-learning semantic macro storage in a Graph DB',
      'Five-layer persistent memory model and Telegram API control'
    ],
    tech: ['Graph DB', 'LLM', 'Ollama', 'Python', 'RAG', 'Telegram API'],
    github: 'https://github.com/thippeswammy/JarvisControlSystem',
    repositories: [
      { name: 'jarviscontrolsystem', role: 'Jarvis Virtual Assistant Orchestrator Engine', github: 'https://github.com/thippeswammy/JarvisControlSystem' }
    ],
    isPrivate: false,
    status: 'ongoing',
    team: 'solo',
    platform: ['Windows']
  },

  {
    id: 'java_swing_desktop_utilities',
    name: 'Java Swing Desktop Utility Applications',
    cluster: 'software',
    tagline: 'Desktop Swing tools ranging from speech calculators to interactive grid puzzles',
    summary: 'A compilation of intuitive Java Swing utilities developed in NetBeans and IntelliJ. Spans arithmetic apps, voice-activated speech calculators, secure contact managers, and interactive grid game boards.',
    highlights: [
      'Speech Calculator with speech-to-text voice recognition control',
      'Contact Manager with search, edit, and storage templates',
      'Grid Puzzles (3x3 to 6x6) with randomized placement and hints',
      'Tic-Tac-Toe GUI boards programmed with winning AI search heuristics',
      'Classic Snake Game with Swing graphics loop and Timer control'
    ],
    tech: ['IntelliJ IDEA', 'Java', 'Java GUI', 'Java Swing', 'NetBeans', 'Swing'],
    github: 'https://github.com/thippeswammy/BasicMathCalculatorApp',
    repositories: [
      { name: 'basicmathcalculatorapp', role: 'Simple Java Swing arithmetic calculator', github: 'https://github.com/thippeswammy/BasicMathCalculatorApp' },
      { name: 'calculatorguiapp', role: 'NetBeans GUI-based arithmetic calculator', github: 'https://github.com/thippeswammy/CalculatorGuiApp' },
      { name: 'simplecontactsmanager', role: 'Swing Contacts storage utility', github: 'https://github.com/thippeswammy/SimpleContactsManager' },
      { name: 'puzzle_game', role: 'Interactive randomized grid puzzle game', github: 'https://github.com/thippeswammy/Puzzle-game' },
      { name: 'tictactoegui', role: 'Tic-Tac-Toe GUI with advanced AI search opponent', github: 'https://github.com/thippeswammy/TicTacToeGUI' },
      { name: 'handcricketgame', role: 'Gesture-based digital hand cricket match', github: 'https://github.com/thippeswammy/HandCricketGame' },
      { name: 'textbasedtictactoe', role: 'Console-based Tic-Tac-Toe vs heuristic AI', github: 'https://github.com/thippeswammy/TextBasedTicTacToe' },
      { name: 'snake_gui_game', role: 'Classic Swing GUI Snake Game', github: 'https://github.com/thippeswammy/Snake-GUI-game' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['Android', 'Console', 'Linux', 'Windows', 'macOS']
  },

  {
    id: 'swing_security_auth_systems',
    name: 'Swing-Based User Authentication & Security Systems',
    cluster: 'software',
    tagline: 'Secure user authentication templates, app lockers, and app runners in Java',
    summary: 'A suite of security and access control applications developed in Java. Spans simple GUI login portals, advanced encrypted user authentication templates, sandbox lockers, and login-controlled application runners.',
    highlights: [
      'Secure user authentication templates with Swing interfaces',
      'Login-controlled application runner restricting desktop access',
      'Secure App Locker sandbox concepts',
      'Developed using NetBeans and IntelliJ IDEA structures'
    ],
    tech: ['IntelliJ IDEA', 'Java', 'Java GUI', 'Java Swing', 'NetBeans'],
    github: 'https://github.com/thippeswammy/LoginSystemWithGUI',
    repositories: [
      { name: 'loginsystemwithgui', role: 'Java Swing User Authentication Portal', github: 'https://github.com/thippeswammy/LoginSystemWithGUI' },
      { name: 'loginsystemwithadvancegui', role: 'Advanced Java Swing Login System', github: 'https://github.com/thippeswammy/LoginSystemWithAdvanceGUI' },
      { name: 'multiapprunnerloginauth', role: 'Login-Controlled Application Runner', github: 'https://github.com/thippeswammy/MultiAppRunnerLoginAuth' },
      { name: 'secureapplocker', role: 'Java Secure App Locker template', github: 'https://github.com/thippeswammy/SecureAppLocker' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['Linux', 'Windows', 'macOS']
  },


  // ── GAMES & INTERACTIVE ────────────────────────────────────────────────────────────────
  {
    id: 'interactive_arcade_games',
    name: 'Arcade, Mobile & Unity Interactive Games',
    cluster: 'games',
    tagline: 'Nostalgic 2D Greenfoot arcade cabinets, Unity 3D racing, and AR interactive placements',
    summary: 'A complete collections of interactive games and visual simulations. Spans nostalgic 2D Greenfoot Java game engines, high-speed 3D Unity vehicle physics models, and mobile augmented reality (AR) cube placements.',
    highlights: [
      'High-speed 3D Car Racing game developed in Unity with custom physics',
      'Mobile AR Foundation interactive cube placement dashboard',
      'Classic platformer gameplay inspired by Super Mario with Greenfoot physics',
      'Flappy Bird clone and Maze-navigating speed adventure boards',
      'Doggo down-shooter and balloon-popping arcade systems',
      'Strategic multiplayer grid matching and chain reaction gameplay'
    ],
    tech: ['3D Graphics', 'C#', 'Greenfoot', 'Java', 'NetBeans', 'Unity'],
    github: 'https://github.com/thippeswammy/SuperMarioGame',
    repositories: [
      { name: 'supermariogame', role: 'Classic side-scrolling platformer arcade', github: 'https://github.com/thippeswammy/SuperMarioGame' },
      { name: 'flappy_bird_game', role: 'Nostalgic Flappy Bird arcade game', github: 'https://github.com/thippeswammy/Flappy-bird-game' },
      { name: 'maze_game', role: 'Grid maze speed adventure arcade', github: 'https://github.com/thippeswammy/Maze-game' },
      { name: 'downshootergame', role: 'Doggo down-shooter arcade', github: 'https://github.com/thippeswammy/DownShooterGame' },
      { name: 'ballonblastgame', role: 'Balloon-popping speed arcade', github: 'https://github.com/thippeswammy/BallonBlastGame' },
      { name: 'brickgame', role: 'Classic brick breaker game', github: 'https://github.com/thippeswammy/BrickGame' },
      { name: 'chainreactiongame', role: 'Multiplayer chain reaction strategic board game', github: 'https://github.com/thippeswammy/ChainReactionGame' },
      { name: '3d_car_racing_game', role: 'Unity 3D Car Racing Game Engine & Physics', github: 'https://github.com/thippeswammy/3D-Car-racing-game' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: ['Android', 'Linux', 'Windows', 'iOS', 'macOS']
  },


  // ── DEV TOOLS & RESEARCH ────────────────────────────────────────────────────────────────
  {
    id: 'ai_specializations_academic_courses',
    name: 'AI Specializations & Competitive Programming Courses',
    cluster: 'research',
    tagline: 'Practical deep learning implementations, image processing, and DSA coding mastery',
    summary: 'A research and learning hub containing practical implementations from the Deep Learning Specialization, advanced image processing modules, automated testing sandboxes, and DSA interview preparation.',
    highlights: [
      'Vectorized Deep Neural Networks built from scratch in NumPy',
      'CNN image classification pipelines and RNN/LSTM/GRU temporal modeling',
      'Optimized DSA competitive programming solutions in Java and Kotlin',
      'Custom-annotated image processing and automated script sandboxes'
    ],
    tech: ['Algorithms', 'Data Structures', 'Image Processing', 'Java', 'Jupyter Notebook', 'Keras', 'Kotlin', 'NumPy', 'Python', 'TensorFlow'],
    github: 'https://github.com/thippeswammy/Deep-Learning-Specialization',
    repositories: [
      { name: 'deep_learning_specialization', role: 'Deep Learning Specialization implementations & optimization', github: 'https://github.com/thippeswammy/Deep-Learning-Specialization' },
      { name: 'neetcodeproblems', role: 'Optimized Java & Kotlin LeetCode solutions', github: 'https://github.com/thippeswammy/NeetCodeProblems' },
      { name: 'imageprocessingcourse', role: 'Image Processing academic course modules', github: 'https://github.com/thippeswammy/ImageProcessingCourse' },
      { name: 'numberguessergame', role: 'Java number guessing sandbox', github: 'https://github.com/thippeswammy/NumberGuesserGame' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: []
  },


  // ── MISCELLANEOUS & SANDBOX ────────────────────────────────────────────────────────────────
  {
    id: 'multiplevo_hidden',
    name: 'MultipleVo',
    cluster: 'others',
    tagline: 'Multiple Visual Odometry workspace',
    summary: 'Multiple Visual Odometry workspace.',
    highlights: [

    ],
    tech: ['Computer Vision', 'Deep Learning', 'OpenCV', 'Python', 'Visual Odometry'],
    github: 'https://github.com/thippeswammy/MultipleVo',
    isHidden: true,
    repositories: [
      { name: 'multiplevo', role: 'Multiple Visual Odometry', github: 'https://github.com/thippeswammy/MultipleVo' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: []
  },

  {
    id: 'vo2map_hidden',
    name: 'VO2MAP',
    cluster: 'others',
    tagline: 'VO2MAP Project',
    summary: 'Visual Odometry to Map (VO2MAP) project.',
    highlights: [

    ],
    tech: [],
    github: 'https://github.com/thippeswammy/VO2MAP',
    isHidden: true,
    repositories: [
      { name: 'vo2map', role: 'Visual Odometry to Map', github: 'https://github.com/thippeswammy/VO2MAP' }
    ],
    isPrivate: false,
    status: 'completed',
    team: 'solo',
    platform: []
  }
];
