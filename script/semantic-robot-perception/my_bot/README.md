# 🤖 Differential Drive Mobile Robot - ROS 2 Stack

An advanced, stable, and highly responsive ROS 2 Humbe & Gazebo mobile robot simulation stack. Configured with optimized physical parameters, accelerated SLAM performance, high-fidelity LIDAR scanning, and automated one-command launchers.

---

## ✨ Outstanding Features

### ⚖️ Physical Physics Stabilization
- **Ultra Bottom-Heavy Center of Mass (CoM)**: The chassis center of gravity is lowered from `z=0.075m` to `z=0.02m` to prevent the robot from flipping during aggressive teleop maneuvers.
- **Calibrated Wheel Grip**: Left and right wheels use a balanced friction coefficient of `2.0` (down from a sticky `10.0`) to allow realistic micro-slipping, preventing violent high-speed pitching.
- **Lightweight Caster Wheel**: Reduced caster wheel inertia (mass down from `0.5kg` to `0.1kg`) to stop tail-swing instability.

### ⚡ Accelerated Sensors & SLAM
- **High-Rate & High-Range LIDAR**: Upgraded scanner from `10Hz / 12m` to **`20Hz / 25.0m`** with precise range resolution (`1.5cm`), giving the robot an exceptionally wide and fast view of its environment.
- **Cinematic Map Refresh Rates**: Reduced mapping update intervals from `5.0s` to **`1.0s`**. Maps render in RViz 5x faster as you drive.

---

## 🛠️ Automated Launchers (`main_lunch/`)

We have unified the startup commands into three self-contained bash scripts inside `src/my_bot/main_lunch/`. Each script handles dynamic worlds (e.g. `warehouse.sdf` or `obstacles.world`), configures safe spawn coordinates, and cleans up any dangling processes automatically.

### 1️⃣ Manual Mapping Mode (Build your Map)
Use this launcher to drive the robot using your keyboard to construct a custom map of the world.
```bash
./src/my_bot/main_lunch/start_manual_mapping.sh [world_name]
```
- **Example**: `./src/my_bot/main_lunch/start_manual_mapping.sh warehouse.sdf`

### 2️⃣ SLAM Navigation Mode (Map & Navigate Simultaneously)
Launches Gazebo, SLAM Toolbox, Nav2, and RViz. The robot will map a completely unknown space on the fly while autonomously navigating to your goals.
```bash
./src/my_bot/main_lunch/start_slam_navigation.sh [world_name]
```
- **Example**: `./src/my_bot/main_lunch/start_slam_navigation.sh warehouse.sdf`

### 3️⃣ Map Navigation Mode (Autonomous Navigation on a Saved Map)
Launches Gazebo, Nav2, AMCL, and RViz. This loads your pre-saved static map (`.yaml` / `.pgm`) and aligns your spawn coordinates automatically.
```bash
./src/my_bot/main_lunch/start_map_navigation.sh [world_name] [map_name]
```
- **Example**: `./src/my_bot/main_lunch/start_map_navigation.sh warehouse.sdf warehouse`

---

## 🗺️ Saving your Maps

When you are done mapping, open a terminal, source your workspace, and run either of these commands to save your maps:

### Standard Occupancy Grid (For Nav2 / AMCL)
Saves `.yaml` and `.pgm` files directly inside your map directory:
```bash
source /opt/ros/humble/setup.bash && source install/setup.bash
ros2 run nav2_map_server map_saver_cli -f ~/workspaces/Robot/my_bot_ws/src/my_bot/my_map/warehouse/warehouse
```

### SLAM Toolbox Serialization (To continue mapping later)
Saves `.data` and `.posegraph` serialization state files:
```bash
source /opt/ros/humble/setup.bash && source install/setup.bash
ros2 service call /slam_toolbox/save_map slam_toolbox/srv/SaveMap "{name: {data: '/home/thippe/workspaces/Robot/my_bot_ws/src/my_bot/my_map/warehouse/warehouse'}}"
```

---

## 📂 Package Directory Structure
```text
my_bot/
├── config/              # YAML parameter configuration files (Nav2, controllers, SLAM)
├── description/         # Robot URDF physical structure (xacro, camera, LIDAR, physics)
├── launch/              # ROS 2 simulation and state publisher python launch scripts
├── main_lunch/          # One-command bash launchers (Manual Mapping, SLAM, AMCL)
├── my_map/              # Saved maps folder
└── worlds/              # Gazebo simulation world models (.sdf & .world)
```