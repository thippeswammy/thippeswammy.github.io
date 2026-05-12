Here’s a clean and structured **`README.md`** you can use for your [re-implemented DPVO repo](https://github.com/thippeswammy/DPVO), compatible with **JetPack 5.1**, **PyTorch 1.14**, and the **Jetson platform**.

---

# Deep Patch Visual Odometry (DPVO) – Jetson-Compatible Version

This is a Jetson-friendly re-implementation of [DPVO](https://github.com/princeton-vl/DPVO) with full support for JetPack 5.1 and Torch 1.14 (ARM64). All known compatibility and build issues have been resolved.

---

## 📜 Reference Papers

* **Deep Patch Visual Odometry**
  [arXiv 2023](https://arxiv.org/pdf/2208.04726.pdf) — *Teed, Lipson, Deng*
* **Deep Patch Visual SLAM**
  [arXiv 2024](http://arxiv.org/pdf/2408.01654) — *Lipson, Teed, Deng*

---

## 🔧 Jetson Setup Instructions

### 1. System Dependencies

```bash
sudo apt-get update
sudo apt-get install -y nvidia-jetpack libglew-dev cmake \
libpython3-dev libeigen3-dev libpng-dev libjpeg-dev libtiff-dev libopencv-dev
```

> 📝 Make sure JetPack 5.1 is installed correctly. Use `dpkg -l | grep nvidia` to verify.

### 2. PyTorch for JetPack 5.1

```bash
wget https://developer.download.nvidia.com/compute/redist/jp/v51/pytorch/torch-1.14.0a0+44dac51c.nv23.02-cp38-cp38-linux_aarch64.whl
pip install torch-1.14.0a0+44dac51c.nv23.02-cp38-cp38-linux_aarch64.whl
```

### 3. Clone and Build DPVO

```bash
git clone https://github.com/thippeswammy/DPVO.git --recursive
cd DPVO
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 4. Install Eigen

```bash
wget https://gitlab.com/libeigen/eigen/-/archive/3.4.0/eigen-3.4.0.zip
unzip eigen-3.4.0.zip -d thirdparty/
```

### 5. Install DPVO

```bash
pip install .
```

### 6. Download Pretrained Models

```bash
./download_models_and_data.sh
```

---

## 🖼️ Pangolin Viewer Installation

```bash
cd ~
git clone https://github.com/stevenlovegrove/Pangolin.git
cd Pangolin
mkdir build && cd build
cmake ..
make -j$(nproc)
sudo make install
sudo ldconfig
```

### Add to Library Path

```bash
export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
```

---

## ▶️ Running a Demo

```bash
python demo.py \
  --imagedir=/path/to/image_dir \
  --calib=/path/to/calib.txt \
  --viz --plot --save_ply --save_trajectory --save_colmap
```

---

## 🔁 SLAM Backend

To enable loop closure:

```bash
--opts LOOP_CLOSURE True
```

Optional: Use classical backend

```bash
--opts CLASSIC_LOOP_CLOSURE True
```

---

## 🧪 Evaluation Examples

```bash
python evaluate_kitti.py --trials=5 --plot --save_trajectory
```

> Replace with `evaluate_tartan.py`, `evaluate_euroc.py`, etc. for other datasets.

---

## 📦 Optional Backends

### DBoW2 (for loop closure)

```bash
cd DBoW2
mkdir build && cd build
cmake ..
make
sudo make install
```

### Image Retrieval

```bash
pip install ./DPRetrieval
```

---

## 📊 Training

Make sure the datasets and pickle files are downloaded and structured as required:

```bash
python train.py --steps=240000 --lr=0.00008 --name=run1
```

---

## 📽️ Dataset Format

Supported:

* KITTI
* TartanAir
* EuRoC MAV
* TUM RGBD
* ICL-NUIM
* iPhone (with calibration)
