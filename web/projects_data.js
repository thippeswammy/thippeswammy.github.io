// ═══════════════════════════════════════════════════════════════════
// projects_data.js  —  Complete Project Portfolio Data
// ═══════════════════════════════════════════════════════════════════

window.CLUSTERS = [
  { id:'vision',        label:'AI & CV',      full:'AI & Computer Vision',          color:0x3b82f6, css:'#3b82f6', emoji:'👁️' },
  { id:'robotics',     label:'ROBOTICS',     full:'Robotics & Autonomous Systems', color:0x06b6d4, css:'#06b6d4', emoji:'🤖' },
  { id:'embedded',     label:'EMBEDDED',     full:'Embedded & Hardware',           color:0xf97316, css:'#f97316', emoji:'🔌' },
  { id:'software',     label:'SOFTWARE',     full:'Desktop Applications',          color:0x10b981, css:'#10b981', emoji:'💻' },
  { id:'mobile',       label:'MOBILE & AR',  full:'Mobile & Augmented Reality',    color:0x8b5cf6, css:'#8b5cf6', emoji:'📱' },
  { id:'games',        label:'GAMES',        full:'Games & Interactive',           color:0xd946ef, css:'#d946ef', emoji:'🎮' },
  { id:'research',     label:'RESEARCH',     full:'Research & Dev Tools',          color:0xec4899, css:'#ec4899', emoji:'🔬' },
  { id:'others',       label:'OTHERS',       full:'Miscellaneous & Sandbox',       color:0x64748b, css:'#64748b', emoji:'📂' },
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

window.PROJECTS = [

  // ── ROBOTICS ────────────────────────────────────────────────────────────────
  { id:'lanemappingtool', cluster:'robotics', name:'LaneMappingTool', lang:'Python',
    tagline:'End-to-end lane mapping and refinement system for autonomous...',
    summary:'Transforms noisy paths into structured graph-based networks with spline smoothing and junction logic for real-world autonomous deployment.',
    tech:['adas','autonomous-driving','data-visualization','flask'],
    github:'https://github.com/thippeswammy/LaneMappingTool', isPrivate:false },

  { id:'my_bot', cluster:'robotics', name:'my_bot', lang:'Python',
    tagline:'Automated utility bot.',
    summary:'Sandbox for automation and scripting tests.',
    tech:['python','automation'],
    github:'https://github.com/thippeswammy/my_bot', isPrivate:false },

  { id:'3d_robot', cluster:'robotics', name:'3d_robot', lang:'C++',
    tagline:'3D Robot modeling and kinematic simulation.',
    summary:'Workspace for developing kinematic control logic and 3D robotic visualizations.',
    tech:['cpp','robotics'],
    github:'https://github.com/thippeswammy/3d_robot', isPrivate:false },

  { id:'sdf-to-nav-mesh', cluster:'robotics', name:'sdf_to_nav_mesh', lang:'Python',
    tagline:'ROS 2 tool for converting Gazebo SDF files into nav meshes.',
    summary:'Generates structured .ply and .h5 outputs with geometric metadata for seamless integration with mesh-based navigation pipelines.',
    tech:['3d-geometry','autonomous-systems','gazebo','mesh-navigation'],
    github:'https://github.com/thippeswammy/sdf_to_nav_mesh', isPrivate:false },

  { id:'rtab_ws', cluster:'robotics', name:'rtab_ws', lang:'Python',
    tagline:'Workspace for RTAB-Map experiments and sensor fusion.',
    summary:'Integrated environment for testing multi-sensor mapping configurations.',
    tech:['python','ros2','slam'],
    github:'https://github.com/thippeswammy/rtab_ws', isPrivate:false },

  { id:'orb-slam2', cluster:'robotics', name:'ORB_SLAM2', lang:'C++',
    tagline:'Classic ORB-SLAM2 implementation for monocular/stereo/RGB-D.',
    summary:'Real-time SLAM library for feature-based mapping and tracking.',
    tech:['cpp','slam','computer-vision'],
    github:'https://github.com/thippeswammy/ORB_SLAM2', isPrivate:false },

  { id:'orb-slam3', cluster:'robotics', name:'ORB_SLAM3', lang:'C++',
    tagline:'Visual-Inertial SLAM with multiple map merging.',
    summary:'Advanced SLAM system providing robust tracking in large or challenging environments.',
    tech:['cpp','slam','vins'],
    github:'https://github.com/thippeswammy/ORB_SLAM3', isPrivate:false },

  { id:'orb-slam3-ros2', cluster:'robotics', name:'ORB_SLAM3_ROS2', lang:'C++',
    tagline:'ORB-SLAM3 integration for the ROS 2 ecosystem.',
    summary:'Robust visual SLAM supporting Monocular, Stereo, and RGB-D cameras with IMU integration for real-time trajectory estimation.',
    tech:['cpp','ros2','slam','visual-odometry'],
    github:'https://github.com/thippeswammy/ORB_SLAM3_ROS2', isPrivate:false },

  { id:'droid-slam', cluster:'vision', name:'DROID_slam', lang:'Python',
    tagline:'Deep visual SLAM with multi-GPU support.',
    summary:'Extended DROID-SLAM implementation for mono, stereo, and RGB-D with ARM64 Jetson support.',
    tech:['deep-learning','slam','jetson'],
    github:'https://github.com/thippeswammy/DROID_slam', isPrivate:false },

  { id:'dpvo', cluster:'robotics', name:'DPVO', lang:'C++',
    tagline:'Deep Patch Visual Odometry re-implementation.',
    summary:'Performance-focused implementation of DPVO for monocular and stereo camera setups with multi-GPU inference.',
    tech:['cpp','pytorch','visual-odometry'],
    github:'https://github.com/thippeswammy/DPVO', isPrivate:false },

  { id:'kitti-odom-eval', cluster:'robotics', name:'kitti-odom-eval', lang:'Python',
    tagline:'Evaluation Toolbox for KITTI Odometry benchmarks.',
    summary:'Parses and evaluates SLAM trajectories with automatic timestamp normalization and error metric calculation.',
    tech:['python','slam','data-analysis'],
    github:'https://github.com/thippeswammy/kitti-odom-eval', isPrivate:false },

  // ── AI & COMPUTER VISION ────────────────────────────────────────────────────────────────
  { id:'jarviscontrolsystem', cluster:'vision', name:'JarvisControlSystem', lang:'Python',
    tagline:'Autonomous AI agent with semantic macro learning.',
    summary:'A Windows agent using LLMs and computer vision to navigate UI, learning "reflexes" to automate physical system tasks.',
    tech:['ai','autonomous-agent','llm','automation'],
    github:'https://github.com/thippeswammy/JarvisControlSystem', isPrivate:false },

  { id:'adas-for-indian-road-vehicle', cluster:'vision', name:'ADAS-for-Indian-Road-Vehicle', lang:'Python',
    tagline:'YOLOv8 road segmentation for Indian driving scenarios.',
    summary:'Instance segmentation of vehicles and pedestrians with real-time inference and superpixel refinement.',
    tech:['adas','yolov8','computer-vision'],
    github:'https://github.com/thippeswammy/ADAS-for-Indian-Road-Vehicle', isPrivate:false },

  { id:'facerecognition', cluster:'vision', name:'FaceRecognition', lang:'Python',
    tagline:'Dual-engine Face Recognition with depth sensing.',
    summary:'Secure identification system using Intel RealSense depth filtering and one-shot learning for real-time auto-tagging.',
    tech:['computer-vision','deep-learning','realsense'],
    github:'https://github.com/thippeswammy/FaceRecognition', isPrivate:false },

  { id:'supergluepretrainednetwork', cluster:'vision', name:'SuperGlueNetwork', lang:'Python',
    tagline:'Feature matching with Graph Neural Networks.',
    summary:'High-accuracy point matching in challenging lighting and perspective conditions.',
    tech:['pytorch','gnn','computer-vision'],
    github:'https://github.com/thippeswammy/SuperGluePretrainedNetwork', isPrivate:false },

  { id:'ros2-depth-anything-v3-trt', cluster:'vision', name:'ros2-depth-anything-v3-trt', lang:'C++',
    tagline:'TensorRT Monocular Depth estimation node.',
    summary:'Real-time metric depth and point cloud generation from single camera feeds using Depth Anything V3.',
    tech:['cpp','tensorrt','ros2','depth-estimation'],
    github:'https://github.com/thippeswammy/ros2-depth-anything-v3-trt', isPrivate:false },

  { id:'carla', cluster:'vision', name:'Carla', lang:'Python',
    tagline:'Autonomous driving simulation and scenario testing.',
    summary:'Experimentation with vehicle perception and path planning in high-fidelity virtual environments.',
    tech:['autonomous-driving','simulation','python'],
    github:'https://github.com/thippeswammy/Carla', isPrivate:false },

  { id:'zed2i', cluster:'vision', name:'ZED2i', lang:'Notebook',
    tagline:'ZED2i stereo camera data collection and tracking.',
    summary:'Optimized pipeline for synchronized depth data handling and positional tracking.',
    tech:['stereo-vision','depth-estimation','multithreading'],
    github:'https://github.com/thippeswammy/ZED2i', isPrivate:false },

  // ── EMBEDDED & HARDWARE ────────────────────────────────────────────────────────────────
  { id:'matlabmodels', cluster:'embedded', name:'MatlabModels', lang:'Simulink',
    tagline:'Automotive behavioral modeling and hardware integration.',
    summary:'Simulink models for sensor interfacing and real-time control on Arduino, STM32, and Raspberry Pi.',
    tech:['matlab','simulink','arduino','control-systems'],
    github:'https://github.com/thippeswammy/MatlabModels', isPrivate:false },

  { id:'mbd-dspace', cluster:'embedded', name:'MBD-dSPACE', lang:'LiveScript',
    tagline:'dSPACE SCALEXIO vehicle control system.',
    summary:'Model-based design for automotive control logic, utilizing SIL and HIL validation workflows.',
    tech:['dspace','automotive','embedded'],
    github:'https://github.com/thippeswammy/MBD-dSPACE', isPrivate:false },

  { id:'arduino', cluster:'embedded', name:'Arduino', lang:'C++',
    tagline:'Collection of embedded robotics and automation projects.',
    summary:'Includes obstacle avoidance cars, CAN communication, and IoT sensor systems.',
    tech:['cpp','arduino','can-bus','iot'],
    github:'https://github.com/thippeswammy/Arduino', isPrivate:false },

    // ── SOFTWARE (DESKTOP APPLICATIONS) ────────────────────────────────────────────────────────────────
  { id:'secureapplocker', cluster:'software', name:'SecureAppLocker', lang:'Java',
    tagline:'Secure application launcher with login authentication.',
    summary:'Java-based tool restricting access to protected applications through system-level validation.',
    tech:['java','swing','security'],
    github:'https://github.com/thippeswammy/SecureAppLocker', isPrivate:false },

  { id:'loginsystemwithadvancegui', cluster:'software', name:'LoginSystemAdvanced', lang:'Java',
    tagline:'Advanced Java Swing authentication system.',
    summary:'Desktop framework featuring modular design, input validation, and scalable UI workflows.',
    tech:['java','swing','gui-design'],
    github:'https://github.com/thippeswammy/LoginSystemWithAdvanceGUI', isPrivate:false },

  { id:'loginsystemwithgui', cluster:'software', name:'LoginSystemBasic', lang:'Java',
    tagline:'Standard Java authentication system.',
    summary:'Implements user login logic and event-driven interaction for desktop applications.',
    tech:['java','swing','authentication'],
    github:'https://github.com/thippeswammy/LoginSystemWithGUI', isPrivate:false },

  { id:'simplecontactsmanager', cluster:'software', name:'SimpleContactsManager', lang:'Java',
    tagline:'Desktop contact and messaging management system.',
    summary:'Console/GUI hybrid for CRUD operations on personal records and messages.',
    tech:['java','data-management','desktop-app'],
    github:'https://github.com/thippeswammy/SimpleContactsManager', isPrivate:false },

  { id:'multiapprunnerloginauth', cluster:'software', name:'MultiAppRunner', lang:'Java',
    tagline:'Authenticated central hub for launching multiple Java tools.',
    summary:'Access control layer for a suite of desktop tools and games.',
    tech:['java','authentication','launcher'],
    github:'https://github.com/thippeswammy/MultiAppRunnerLoginAuth', isPrivate:false },

  { id:'calculatorguiapp', cluster:'software', name:'CalculatorGUI', lang:'Java',
    tagline:'Feature-rich desktop calculator with modular logic.',
    summary:'Built with NetBeans, supporting complex arithmetic with reusable backend logic.',
    tech:['java','swing','calculator'],
    github:'https://github.com/thippeswammy/CalculatorGuiApp', isPrivate:false },

  { id:'basicmathcalculatorapp', cluster:'software', name:'BasicCalculator', lang:'Java',
    tagline:'Lightweight arithmetic desktop tool.',
    summary:'Focuses on simple input handling and arithmetic logic execution.',
    tech:['java','swing','beginner-project'],
    github:'https://github.com/thippeswammy/BasicMathCalculatorApp', isPrivate:false },

  // ── MOBILE & AR ────────────────────────────────────────────────────────────────
  { id:'ar-cube-drop', cluster:'mobile', name:'AR-Cube-Drop', lang:'C#',
    tagline:'Unity ARFoundation app for spatial placement.',
    summary:'Augmented Reality app for mobile devices that spans objects and captures scene metadata.',
    tech:['unity','arfoundation','augmented-reality'],
    github:'https://github.com/thippeswammy/AR-Cube-Drop', isPrivate:false },

  { id:'speechcalculator', cluster:'mobile', name:'SpeechCalculator', lang:'Java',
    tagline:'Voice-enabled Android math parser.',
    summary:'Converts spoken expressions into executable logic via custom parsing algorithms.',
    tech:['android','java','speech-recognition'],
    github:'https://github.com/thippeswammy/SpeechCalculator', isPrivate:false },

  { id:'roadtagbycameragps', cluster:'mobile', name:'RoadTagByCameraGps', lang:'Kotlin',
    tagline:'Android utility for road infrastructure monitoring.',
    summary:'Logs road features with synchronized GPS and high-resolution camera tagging.',
    tech:['android','kotlin','gps','infrastructure'],
    github:'https://github.com/thippeswammy/RoadTagByCameraGps', isPrivate:false },

  // ── GAMES ────────────────────────────────────────────────────────────────
  { id:'3d-car-racing-game', cluster:'games', name:'3D Racing Game', lang:'C#',
    tagline:'Unity-based racing simulator with dynamic environments.',
    summary:'Features multiple vehicles, sound management, and adaptive UI scaling.',
    tech:['unity','csharp','3d-graphics'],
    github:'https://github.com/thippeswammy/3D-Car-racing-game', isPrivate:false },

  { id:'chainreactiongame', cluster:'games', name:'ChainReaction', lang:'Java',
    tagline:'Strategic multiplayer game with propagation logic.',
    summary:'Implements chain-reaction physics and turn-based state management in Greenfoot.',
    tech:['java','greenfoot','algorithms'],
    github:'https://github.com/thippeswammy/ChainReactionGame', isPrivate:false },

  { id:'puzzle-game', cluster:'games', name:'NumberPuzzle', lang:'Java',
    tagline:'Dynamic grid-based puzzle game.',
    summary:'Supports grids up to 6x6 with randomized initialization and move validation.',
    tech:['java','swing','algorithms'],
    github:'https://github.com/thippeswammy/Puzzle-game', isPrivate:false },

  { id:'maze-game', cluster:'games', name:'MazeSurvival', lang:'Java',
    tagline:'2D maze game with enemy AI and level progression.',
    summary:'Demonstrates object-oriented collision handling and dynamic game states.',
    tech:['java','greenfoot','game-ai'],
    github:'https://github.com/thippeswammy/Maze-game', isPrivate:false },

  { id:'snake-gui-game', cluster:'games', name:'SnakeGUI', lang:'Java',
    tagline:'Classic Snake with real-time game loop logic.',
    summary:'Features collision detection and custom rendering in Swing.',
    tech:['java','swing','game-loop'],
    github:'https://github.com/thippeswammy/Snake-GUI-game', isPrivate:false },

  { id:'tictactoegui', cluster:'games', name:'TicTacToeAI', lang:'Java',
    tagline:'Tic-Tac-Toe featuring strategy-driven AI.',
    summary:'Uses game state evaluation algorithms for competitive single-player modes.',
    tech:['java','swing','game-logic'],
    github:'https://github.com/thippeswammy/TicTacToeGUI', isPrivate:false },

  { id:'supermariogame', cluster:'games', name:'MarioClone', lang:'Java',
    tagline:'Classic arcade mechanics in Greenfoot.',
    summary:'Focuses on obstacle navigation and smooth 2D gameplay physics.',
    tech:['java','greenfoot','2d-game'],
    github:'https://github.com/thippeswammy/SuperMarioGame', isPrivate:false },

  { id:'brickgame', cluster:'games', name:'BrickBreaker', lang:'Java',
    tagline:'Physics-based 2D brick destruction game.',
    summary:'Features ball physics and paddle control interaction.',
    tech:['java','greenfoot','physics'],
    github:'https://github.com/thippeswammy/BrickGame', isPrivate:false },

  { id:'flappy-bird-game', cluster:'games', name:'FlappyBird', lang:'Java',
    tagline:'Obstacle navigation and score tracking clone.',
    summary:'Simple interactive gameplay focusing on timing and score persistence.',
    tech:['java','greenfoot'],
    github:'https://github.com/thippeswammy/Flappy-bird-game', isPrivate:false },

  { id:'ballonblastgame', cluster:'games', name:'BalloonBlast', lang:'Java',
    tagline:'2D projectile shooting game.',
    summary:'Interactive gameplay with multiple targets and scoring systems.',
    tech:['java','greenfoot'],
    github:'https://github.com/thippeswammy/BallonBlastGame', isPrivate:false },

  { id:'downshootergame', cluster:'games', name:'TopDownShooter', lang:'Java',
    tagline:'Action game with enemy AI and boss battles.',
    summary:'Implements health systems and score-based level triggers.',
    tech:['java','greenfoot'],
    github:'https://github.com/thippeswammy/DownShooterGame', isPrivate:false },

  { id:'handcricketgame', cluster:'games', name:'HandCricket', lang:'Java',
    tagline:'Digital simulation of the classic school game.',
    summary:'Uses user-input driven mechanics and score tracking logic.',
    tech:['java','console-app','game-logic'],
    github:'https://github.com/thippeswammy/HandCricketGame', isPrivate:false },

  { id:'textbasedtictactoe', cluster:'games', name:'TextTicTacToe', lang:'Java',
    tagline:'Console-based strategy game.',
    summary:'Includes AI modes and difficulty levels without a GUI.',
    tech:['java','console-app'],
    github:'https://github.com/thippeswammy/TextBasedTicTacToe', isPrivate:false },

  { id:'numberguessergame', cluster:'games', name:'NumberGuesser', lang:'Java',
    tagline:'AI-driven number guessing challenge.',
    summary:'Interactive competitive logic with multiple difficulty levels.',
    tech:['java','console-app'],
    github:'https://github.com/thippeswammy/NumberGuesserGame', isPrivate:false },

  // ── RESEARCH & LEARNING ────────────────────────────────────────────────────────────────
  { id:'deep-learning-specialization', cluster:'research', name:'DL-Specialization', lang:'Notebook',
    tagline:'Neural Networks and Deep Learning course workspace.',
    summary:'Includes implementations of CNNs, RNNs, and optimization strategies.',
    tech:['deep-learning','neural-networks'],
    github:'https://github.com/thippeswammy/Deep-Learning-Specialization', isPrivate:false },

  { id:'imageprocessingcourse', cluster:'research', name:'ImageProcessing', lang:'Python',
    tagline:'Implementation of core Digital Image Processing concepts.',
    summary:'Covers filtering, transformations, and morphological analysis using OpenCV.',
    tech:['opencv','python','computer-vision'],
    github:'https://github.com/thippeswammy/ImageProcessingCourse', isPrivate:false },

  { id:'neetcodeproblems', cluster:'research', name:'NeetCodeProblems', lang:'Java',
    tagline:'Algorithmic problem-solving repository.',
    summary:'Solutions to data structure and algorithmic challenges for interview prep.',
    tech:['dsa','java','algorithms'],
    github:'https://github.com/thippeswammy/NeetCodeProblems', isPrivate:false },

  { id:'vo2map', cluster:'research', name:'VO2MAP', lang:'HTML',
    tagline:'Research on Visual Odometry to Map registration.',
    summary:'Theoretical workspace for mapping VO data onto global maps.',
    tech:['mapping','slam','research'],
    github:'https://github.com/thippeswammy/VO2MAP', isPrivate:false },

  { id:'multiplevo', cluster:'research', name:'MultipleVo', lang:'HTML',
    tagline:'Comparative analysis of multiple VO algorithms.',
    summary:'Sandbox for evaluating performance across different odometry implementations.',
    tech:['visual-odometry','computer-vision'],
    github:'https://github.com/thippeswammy/MultipleVo', isPrivate:false },


  // ── OTHERS ────────────────────────────────────────────────────────────────

  { id:'thippeswammy.github.io', cluster:'others', name:'Portfolio Website', lang:'HTML',
    tagline:'My technical portfolio and project showcase.',
    summary:'The very site you are viewing, built for responsive project discovery.',
    tech:['html','css','javascript'],
    github:'https://github.com/thippeswammy/thippeswammy.github.io', isPrivate:false },

  { id:'my_mcp_project', cluster:'others', name:'MCP Experiment', lang:'Python',
    tagline:'Model Context Protocol implementation testing.',
    summary:'Exploration of agentic context management for LLM systems.',
    tech:['ai-agents','python','mcp'],
    github:'https://github.com/thippeswammy/my_mcp_project', isPrivate:false },

];