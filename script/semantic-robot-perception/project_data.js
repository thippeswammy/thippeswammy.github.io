{
  id: 'semantic_robot_perception',
  cluster: 'robotics',
  name: 'semantic-robot-perception',
  lang: 'C++',
  tagline: 'ROS 2 mobile robot navigation stack with real-time 3D spatial semantic mapping',
  summary: 'A comprehensive ROS 2 Humble & Gazebo simulation stack for differential drive robots. Combines an optimized, physics-stabilized URDF model with a complete 3D spatial semantic mapping and perception suite. Using open-vocabulary YOLO-World and LiDAR range sweeps, the system performs camera pinhole inverse depth projection to build a persistent 3D database of environment objects, visualized dynamically in RViz.',
  highlights: [
    'Autonomous SLAM navigation using Nav2 and physical physics stabilization in Gazebo',
    'Open-vocabulary object recognition using YOLO-World and spatial centroid tracking',
    'Real-time LiDAR-camera fusion for pinhole inverse depth projection',
    'Dynamic 3D database of semantic obstacles with orientation, count, and confidence metrics',
    'Interactive RViz3D visualization with custom MarkerArray nodes and live camera overlays'
  ],
  tech: ['C++', 'Python', 'ROS 2 Humble', 'Gazebo', 'YOLO-World', 'SLAM', 'LiDAR', 'RViz'],
  github: 'https://github.com/thippeswammy/semantic-robot-perception',
  demo: '',
  docs: 'script/semantic-robot-perception/README.md',
  paper: '',
  isPrivate: false,
  status: 'completed',
  year: '2026',
  team: 'solo',
  platform: ['ROS 2 Humble', 'Linux'],
  datasets: ['Gazebo Simulated Worlds'],
  thumbnail: '',
  images: [],
  metrics: {}
}
