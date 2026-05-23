{
  id: 'autoseg',
  cluster: 'vision',
  name: 'AutoSegmentor',
  lang: 'Python',
  tagline: 'State-of-the-art AI auto-labeling and segmentation dataset creation suite',
  summary: 'An end-to-end AI-powered auto-labeling and segmentation ecosystem. Integrates Meta AI\'s Segment Anything Model 2 (SAM2) and CoTracker keypoint tracking within a responsive PyQt5 multi-window desktop interface. It propagates frame annotations over complex video files to create pixel-perfect masks, which are then compiled into fully augmented, YOLOv8/v11-compatible object detection and instance segmentation datasets.',
  highlights: [
    'Meta SAM2 integration for real-time temporal mask propagation across video sequences',
    'CoTracker and Lucas-Kanade trackers for high-accuracy keypoint and optical flow tracking',
    'Fully featured PyQt5 interactive canvas with precise foreground/background points, zoom, and undo/redo systems',
    'Multi-threaded, asynchronous background ML inference to maintain GUI responsiveness',
    'Seamless YOLO format dataset exporter with integrated copy-paste and visual data augmentations'
  ],
  tech: ['Python', 'PyQt5', 'PyTorch', 'SAM2', 'CoTracker', 'CUDA', 'YOLOv8', 'OpenCV'],
  github: 'https://github.com/thippeswammy/AutoSegmentor',
  demo: 'https://drive.google.com/file/d/1Y19lwf_IIuzwVe-3j9vX0uicV_iWbrHZ/view?usp=sharing',
  docs: 'script/AutoSegmentor/README.md',
  paper: '',
  isPrivate: false,
  status: 'completed',
  year: '2026',
  team: 'solo',
  platform: ['Windows', 'Linux', 'CUDA'],
  datasets: ['Custom Videos'],
  thumbnail: '',
  images: ['assets/AutoSegmenter_1080.gif'],
  metrics: {}
}
