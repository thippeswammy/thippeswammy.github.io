# User Guide - sdf_to_nav_mesh

This guide provides detailed information on how to use the `sdf_to_nav_mesh` tool to generate navigation assets from Gazebo SDF files.

## Table of Contents

1. [Core Features](#core-features)
2. [Launch Arguments](#launch-arguments)
3. [CLI Reference](#cli-reference)
4. [Advanced Usage](#advanced-usage)
5. [Utilities](#utilities)
6. [Execution Flow](#execution-flow)
7. [Step-by-Step Tutorial](#step-by-step-tutorial)

---

## Core Features

- **SDF Geometry Extraction**: Parses Gazebo worlds or model files, handles nested models and high-resolution primitives (Box, Cylinder, Sphere).
- **Navigation Mesh Processing**:
  - Subdivision of large faces for better pathfinding.
  - Normal alignment and ground flattening.
  - Boundary stitching.
  - Steep face filtering.
- **Mesh Navigation Assets**:
  - Generates `.ply` files with proper vertex colors and metadata.
  - Synchronous generation of `.h5` attribute maps for `mesh_navigation`.
  - Automatic `.dae` (Collada) export for visual referencing.

---

## Launch Arguments

When using `ros2 launch sdf_to_nav_mesh generate_mesh.launch.py`, the following arguments are available:

### Input/Output

- `input_sdf`: [String] Full path to the input `.sdf` file or a world filename.
- `world_name`: [String] (Optional) Explicit name for output files. If omitted, derived from `input_sdf`.
- `also_h5`: [Boolean] Whether to generate the `.h5` file (default: `false`).

### Presets

- `preset`: [String] Standard presets for conversion (`outdoor`, `indoor`, etc.).

### Advanced Conversion

- `max_edge`: [Float] Maximum edge length for subdivision (default: `0.36`).
- `target_density`: [Float] Target vertex density per square meter.
- `primitive_resolution`: [Int] Resolution for generated primitive meshes (default: `64`).
- `align_ground`: [Boolean] Align the overall ground normal to the +Z axis.
- `flatten_ground`: [Boolean] Snap ground-aligned vertices to Z=0.
- `flatten_threshold`: [Float] Z-range for ground flattening (default: `0.1`).
- `filter_steep`: [Float] Filter out faces steeper than this threshold (normal.z).
- `stitch_threshold`: [Float] Distance for boundary stitching.
- `exclude`: [String] Space-separated list of model names to exclude from conversion.

---

## CLI Reference

### `sdf_to_mesh`

The primary command-line interface for conversion.

```bash
sdf_to_mesh --input_sdf my_world.sdf --world_name my_map --also_h5 true
```

### `inspect_h5`

A utility to inspect the contents and attributes of a generated `.h5` file.

```bash
inspect_h5 my_map.h5
```

---

## Advanced Usage

### Custom World Conversion

If you have a complex world with many obstacles but want to exclude specific robots or dynamic objects:

```bash
ros2 launch sdf_to_nav_mesh generate_mesh.launch.py \
  input_sdf:=my_complex_world.sdf \
    exclude:="husky robot_arm"
```

### Refining Map Precision

For small indoor environments where high precision is needed:

---

## Execution Flow

When you run `sdf_to_mesh` or use the launch file, the following process occurs:

### 1. Geometry Extraction

- The tool parses the input `.sdf` or `.world` file.
- It iterates through all models and visual geometries.
- High-resolution primitives (Box, Cylinder, Sphere) are generated directly to ensure pathfinding precision.

### 2. Mesh Processing

- **Merging**: Individual model meshes are merged into a single global mesh.
- **Subdivision**: Large faces are subdivided based on `max_edge` to provide enough vertices for costmap layers.
- **Cleaning**: Bowties are split, non-manifold geometry is stripped, and normals are sanitized.
- **Refinement**: Optional ground alignment, steep face filtering, and boundary stitching are applied.

### 3. File Generation & Output

The tool generates a comprehensive set of assets:

#### **Primary Navigation Assets**

Located in `maps/`:

- **`{world_name}.ply`**: The main navigation mesh with vertex colors and quality attributes.
- **`{world_name}.h5`**: (Generated if `also_h5:=true`) HDF5 attribute map containing normal, roughness, and steepness data for `mesh_navigation`.

#### **Gazebo Simulation Assets**

Located in `models/{world_name}/`:

- **`meshes/{world_name}.ply`**: Cleaned mesh for collide/visual.
- **`meshes/{world_name}.dae`**: Collada export for visual reference.
- **`model.sdf`** & **`model.config`**: Gazebo model definitions.

#### **Generated World**

Located in `worlds/`:

- **`{world_name}.sdf`**: A Gazebo world file that automatically includes the generated model at the origin.

### 4. Automatic Synchronization

If the `mesh_navigation_tutorials` packages are found in your workspace:

- The `.ply` and `.h5` files are automatically copied to `mesh_navigation_tutorials/maps/`.
- The generated world and model are copied to `mesh_navigation_tutorials_sim/`.
- **Note**: This ensures that after running the conversion, you can immediately launch the simulation using the tutorials' launch files without manual copying.

---

## Troubleshooting

### "LVR2 tool not found"

If you see this warning, the `.h5` file will not be generated. Ensure `lvr2` is installed and the `lvr2_plymerger` (or equivalent) is in your PATH.

### "Skipping subdivision"

If the mesh area is extremely large, the tool may skip subdivision to avoid memory crashes. Try increasing `max_edge` or processing smaller sections.

---

## Step-by-Step Tutorial

Follow these steps to convert a Gazebo world into a navigation-ready mesh.

### 1. Prepare your World

Ensure your Gazebo world (`.sdf` or `.world`) contains the collision geometry you want to navigate.

### 2. Run the Conversion

Launch the conversion process.

```bash
ros2 launch sdf_to_nav_mesh generate_mesh.launch.py \
  input_sdf:=src/sdf_to_nav_mesh/worlds/uneven_terrain.sdf
```

**What happens here:** The tool parses the SDF, generates high-res primitives, merges them, and creates the navigation assets.

### 3. Verify in Gazebo

The tool generates a Gazebo model and a world file. You can load the generated world to see the clean mesh representation.

![Gazebo Simulation](docs/gazebo_world.png)
*Example: The generated mesh world in Gazebo.*

### 4. Verify in Rviz

Use the `mesh_navigation_tutorials` (if installed) to visualize the costmaps and navigation mesh.

![Rviz Navigation Mesh](docs/rviz_nav_mesh.png)
*Example: Navigation mesh with costmap layers in Rviz.*

### 5. Launch Simulation

Finally, launch the integrated tutorial to start navigating:

```bash
ros2 launch mesh_navigation_tutorials mesh_navigation_tutorials_launch.py world_name:=uneven_terrain
```
