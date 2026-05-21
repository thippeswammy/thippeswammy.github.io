  {
    id: 'sdf_to_nav_mesh',
    cluster: 'robotics',
    name: 'sdf_to_nav_mesh',
    lang: 'Python',
    tagline: 'SDF world → navigation mesh converter for ROS 2',
    summary: 'A standalone ROS 2 tool to convert Gazebo SDF/World files into Navigation Mesh assets (.ply, .dae, .h5). Automatically extracts geometry from SDF files, generates high-resolution navigation meshes, and injects metadata (normals, roughness) into HDF5 maps for autonomous navigation pipelines.',
    highlights: [
      'Gazebo SDF → PLY/DAE/H5 pipeline',
      'Terrain metadata extraction (roughness, steepness)',
      'ROS 2 (Humble) native integration',
      'Mesh-based AV navigation support'
    ],
    tech: ['Python', 'ROS 2', 'Gazebo', 'h5py', 'trimesh', 'shapely'],
    github: 'https://github.com/thippeswammy/sdf_to_nav_mesh',
    demo: '',
    docs: '',
    paper: '',
    isPrivate: false,
    status: 'completed',
    year: '',
    team: 'solo',
    platform: ['Ubuntu 22.04', 'ROS 2 Humble'],
    datasets: [],
    thumbnail: '',
    images: [],
    metrics: {}
  }
