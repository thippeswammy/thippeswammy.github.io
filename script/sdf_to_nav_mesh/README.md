# sdf_to_nav_mesh

A standalone ROS 2 tool to convert Gazebo SDF/World files into Navigation Mesh assets (.ply, .dae, .h5).

## Visual Showcase

![Gazebo Simulation](docs/gazebo_world.png)

![Rviz Navigation Mesh](docs/rviz_nav_mesh.png)

## Features

- **Automatic Conversion**: Extract geometry from SDF files and generate high-resolution navigation meshes.
- **HDF5 Support**: Automatically inject metadata into PLY files and generate HDF5 maps for Mesh Navigation.
- **Flexible Launch**: Built-in launch files for integrated conversion or example scenarios.
- **CLI Tools**: Easy-to-use console scripts `sdf_to_mesh` and `inspect_h5`.

## Installation

### Clone the Repository

To use this tool, clone it into your ROS 2 workspace's `src` directory:

```bash
cd ~/ros2_ws/src
git clone https://github.com/thippeswammy/sdf_to_nav_mesh.git
```

### Prerequisites

#### System Requirements

- **OS**: Linux (tested on Ubuntu 22.04)
- **ROS 2**: Humble (recommended)
- **Python**: 3.10.12 or newer

#### Python Dependencies

The tool requires the following Python libraries. Verified versions used in development:

| Package | Version |
| ------- | ------- |
| `h5py` | 3.6.0 |
| `numpy` | 1.24.2 |
| `scipy` | 1.15.3 |
| `shapely` | 1.8.0 |
| `trimesh` | 4.10.1 |

#### Workspace Integrations

- **Recommended**: [mesh_navigation_tutorials](https://github.com/naturerobots/mesh_navigation_tutorials) packages for seamless simulation.

To verify if the tutorials are present:

```bash
ros2 pkg list | grep mesh_navigation_tutorials
```

### Build

From your Colcon workspace:

```bash
colcon build --packages-select sdf_to_nav_mesh
source install/setup.bash
```

## Quick Start

To generate a mesh from an SDF file:

```bash
ros2 launch sdf_to_nav_mesh generate_mesh.launch.py input_sdf:=/path/to/your/world.sdf
```

```bash
sdf_to_mesh --input_sdf /path/to/your/world.sdf
```

## Integrated Example Workflow

For a complete cycle of generating a mesh and launching it in the tutorial simulation:

1. **Step 1: Generate the Mesh**

   ```bash
   ros2 launch sdf_to_nav_mesh generate_mesh.launch.py \
     input_sdf:=src/sdf_to_nav_mesh/worlds/uneven_terrain.sdf
   ```

2. **Step 2: Build & Source** (Ensures assets are indexed)

   ```bash
   colcon build --packages-select sdf_to_nav_mesh mesh_navigation_tutorials_sim mesh_navigation_tutorials --allow-overriding mesh_navigation_tutorials mesh_navigation_tutorials_sim
   source install/setup.bash
   ```

3. **Step 3: Launch Simulation**

   ```bash
   ros2 launch mesh_navigation_tutorials mesh_navigation_tutorials_launch.py world_name:=uneven_terrain
   ```

## File Generation & Output

The tool generates a comprehensive set of assets:

### Primary Navigation Assets

Located in `maps/`:

- **`{world_name}.ply`**: The main navigation mesh with vertex colors and quality attributes.
- **`{world_name}.h5`**: (Generated if `also_h5:=true`) HDF5 attribute map containing normal, roughness, and steepness data for `mesh_navigation`.

### Gazebo Simulation Assets

Located in `models/{world_name}/`:

- **`meshes/{world_name}.ply`**: Cleaned mesh for collide/visual.
- **`meshes/{world_name}.dae`**: Collada export for visual reference.
- **`model.sdf`** & **`model.config`**: Gazebo model definitions.

### Generated World

Located in `worlds/`:

- **`{world_name}.sdf`**: A Gazebo world file that automatically includes the generated model at the origin.

## Automatic Synchronization

If the `mesh_navigation_tutorials` packages are found in your workspace:

- The `.ply` and `.h5` files are automatically copied to `mesh_navigation_tutorials/maps/`.
- The generated world and model are copied to `mesh_navigation_tutorials_sim/`.

> [!NOTE]
> This ensures that after running the conversion, you can immediately launch the simulation using the tutorials' launch files without manual copying.

For more details, see the [User Guide](UserGuide.md).

## Documentation

For a deep dive into the features, CLI arguments, and the internal execution flow, refer to the **[User Guide](UserGuide.md)**.

### Key Sections in User Guide

- **[Core Features](UserGuide.md#core-features)**: What the tool can do.
- **[Execution Flow](UserGuide.md#execution-flow)**: Step-by-step breakdown of file generation and synchronization.
- **[Launch Arguments](UserGuide.md#launch-arguments)**: Detailed parameter reference.
- **[CLI Reference](UserGuide.md#cli-reference)**: Command-line usage examples.
