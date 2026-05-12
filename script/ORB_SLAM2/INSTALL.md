# ORB\_SLAM2 Installation Guide (`install.md`)

This `install.md` details the step-by-step installation of your customized ORB\_SLAM2 fork at `https://github.com/thippeswammy/ORB_SLAM2` on Lenovo SE 70 (Ubuntu). It covers dependencies, patches, build flags, and repo-specific tweaks.

## 1. Clone Your Fork

```bash
cd $HOME/ws_slam
git clone https://github.com/thippeswammy/ORB_SLAM2.git
cd ORB_SLAM2
chmod +x build.sh
```

## 2. Prerequisites

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y \
  build-essential cmake git pkg-config \
  libgtk2.0-dev libboost-all-dev libglew-dev \
  libeigen3-dev libavcodec-dev libavformat-dev libavutil-dev libswscale-dev \
  ffmpeg python2.7-dev
```

### 2.1 FFmpeg Fix (if needed)

```bash
sudo apt remove libavcodec-dev libavformat-dev libavutil-dev libswscale-dev
sudo add-apt-repository ppa:savoury1/ffmpeg4 && sudo apt update
sudo apt install ffmpeg libavcodec-dev libavformat-dev libavutil-dev libswscale-dev
```

## 3. OpenCV 3.4.9 (Custom Build)

```bash
git clone https://github.com/opencv/opencv.git
cd opencv && git checkout 3.4.9
git clone https://github.com/opencv/opencv_contrib.git ../opencv_contrib && cd ../opencv_contrib && git checkout 3.4.9 && cd ../opencv
mkdir build && cd build
cmake -DOPENCV_EXTRA_MODULES_PATH=../../opencv_contrib/modules ..
make -j$(nproc) && sudo make install
```

## 4. Pangolin v0.5 Patches

```bash
cd Thirdparty
git clone --recursive https://github.com/stevenlovegrove/Pangolin.git
cd Pangolin && git checkout v0.5
```

**Apply patches in:**

- `CMakeModules/FindFFMPEG.cmake`
- `src/video/drivers/ffmpeg.cpp`
- `include/pangolin/.../ffmpeg.h`
- `src/display/device/display_x11.cpp`

## 5. CUDA Architecture (Edit `build.sh` if needed)

Set `CUDA_ARCH_BIN` inside `build.sh` or via env:

```bash
export CUDA_ARCH_BIN="6.1;7.5"
```

## 6. Build ORB\_SLAM2

```bash
cd $HOME/ws_slam/ORB_SLAM2
./build.sh
```

---

# ORB\_SLAM2 Usage Guide (`usage.md`)

This `usage.md` covers running your ORB\_SLAM2 fork—examples for Monocular, Stereo, RGB-D, and tips for logs and outputs.

## 1. Vocabulary and Settings

- **Vocabulary file**: `Vocabulary/ORBvoc.txt`
- **Settings**:
  - Monocular: `Examples/Monocular/<Dataset>.yaml`
  - Stereo:    `Examples/Stereo/<Dataset>.yaml`
  - RGB-D:     `Examples/RGB-D/<Dataset>.yaml`

## 2. Running Monocular SLAM (KITTI)

```bash
./Examples/Monocular/mono_kitti \
  Vocabulary/ORBvoc.txt Examples/Monocular/KITTI00-02.yaml \
  dataset/sequences/00
```

## 3. Running Stereo SLAM (KITTI)

```bash
./Examples/Stereo/stereo_kitti \
  Vocabulary/ORBvoc.txt Examples/Stereo/KITTI00-02.yaml \
  dataset/sequences/02
```

## 4. Running RGB-D SLAM (TUM)

```bash
./Examples/RGB-D/rgbd_tum \
  Vocabulary/ORBvoc.txt Examples/RGB-D/TUM1.yaml \
  PATH_TO_SEQUENCE associations.txt
```

## 5. Log & Map Output

- **KeyFrame trajectory**: `Examples/../KeyFrameTrajectory.txt`
- **Map points**: `Examples/../MapPoints.txt`
- **Save results**: add `--save_map` flag in modified `build.sh`

## 6. Troubleshooting

- **Segfault on startup**: verify patched Pangolin, rebuild
- **ver miss match ffmpeg or any eror**: go to '[https://v-slammers.github.io/tools\_and\_tips/ORB-SLAM2-Install/](https://v-slammers.github.io/tools_and_tips/ORB-SLAM2-Install/)'
- **Missing PTX**: adjust `CUDA_ARCH_BIN`
- **Scale drift**: ensure correct stereo baseline in YAML

