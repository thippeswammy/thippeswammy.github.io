# Skill: Project Grouping & Master Portfolio Generation

This document serves as a template/record of the "skill" utilized by the AI to intelligently group separate, package-level, or repetitive Git repositories into unified "Master Projects". This elevates a flat collection of 50+ individual repositories into a sophisticated, systems-oriented portfolio ecosystem.

---

## 🎯 Objective
To analyze a large list of diverse repositories, identify functional dependencies and logical parent-child hierarchies (e.g., core libraries, wrappers, workbenches, and tools developed for the same underlying system), and compile them into high-level, cohesive "Master Projects" mapping to a relation-aware schema.

---

## 🧠 Core Competencies Utilized
1. **Logical Classification**: Grouping repositories by architectural relationships rather than simple language or date filters. For example, grouping the library (`rtabmap`), its ROS bridge (`rtabmap_ros`), and its trajectory analysis workspace (`rtab_ws`) under a single SLAM system.
2. **Object Schema Design**: Engineering a structured JavaScript/JSON schema representing:
   - **Parent Attributes**: Name, cluster, unified summary, collective tech stack, and primary highlights.
   - **Child Array**: An array of `repositories` identifying individual member repositories, their specific roles in the project, and their GitHub links.
3. **Information Synthesis**: Writing high-quality, comprehensive taglines and parent summaries that explain how the member repositories collaborate to fulfill the master project's mission.
4. **State Management & Automation**: Developing a Python compilation engine to read from the flat baseline metadata, execute custom mappings, and write the structured relational dataset.

---

## 🔄 Workflow Execution

### Step 1: Directory Mapping & Architecture Modeling
Construct the exact classification matrix mapping every repository to its parent master project.
- **Standalone Masters**: Flagship projects that are single-repo in nature (e.g., `ZED2i`, `LaneMappingTool`, `JarvisControlSystem`).
- **Unified SLAM Suites**: Grouping tracking systems with their wrappers and analysis tools (e.g., `RTAB-Map SLAM Suite`, `ORB-SLAM & Evaluation Suite`).
- **Utility / Arcade Bundles**: Grouping small applications into cohesive bundles (e.g., `Greenfoot Arcade Games`, `Swing Desktop Utilities`).

### Step 2: Relational Data Schema Design
Design each Master Project object with child repository relationships:
```javascript
{
  id: 'rtabmap_slam_suite',
  name: 'RTAB-Map Spatial Mapping & SLAM Suite',
  cluster: 'robotics',
  tagline: 'Real-Time Appearance-Based Mapping ecosystem for 3D LiDAR & RGB-D SLAM',
  summary: 'A unified professional ecosystem centered around RTAB-Map SLAM...',
  tech: ['C++', 'ROS 1', 'ROS 2', 'RTAB-Map', 'SLAM'],
  highlights: [
    'LiDAR, RGB-D, and Stereo SLAM tracking',
    'Benchmark analysis of feature descriptors on KITTI Sequence 09'
  ],
  github: 'https://github.com/thippeswammy/rtabmap',
  repositories: [
    {
      name: 'rtabmap',
      role: 'Core SLAM C++ Library & Standalone App',
      github: 'https://github.com/thippeswammy/rtabmap'
    },
    {
      name: 'rtabmap_ros',
      role: 'ROS/ROS 2 Sensor & Robot Wrapper Integration',
      github: 'https://github.com/thippeswammy/rtabmap_ros'
    }
  ],
  isPrivate: False,
  status: 'completed'
}
```

### Step 3: Automated Compilation & Synthesis
Write a compilation engine (`compile_grouped_portfolio.py`) that reads the parsed repository definitions from [new_projects_data.js](file:///home/thippe/workspaces/NonProjects/thippeswammy.github.io/new_projects_data.js), merges related attributes, sorts them alphabetically by cluster, and writes the structured result into [grouped_projects_data.js](file:///home/thippe/workspaces/NonProjects/thippeswammy.github.io/grouped_projects_data.js).

---

## ⚠️ Pitfalls & Lessons Learned
* **Redundant Listings vs. System Cohesion**: Listing separate packages like `rtabmap_ros` on the main page dilutes the impression of a developer's skills. **Solution**: Grouping them shifts the focus to high-level system integration, showing that the developer has built full ecosystems.
* **Preserving Original Work**: The compilation engine should read existing, hand-crafted baseline data from `new_projects_data.js` to preserve custom taglines, highlights, and metrics, rather than hardcoding or using simple automated scripts.
* **Hiding Work-in-Progress/Experimental Repos**: The compilation system must support a flag (e.g. `isHidden: true` or completely omitting them) to prevent showing redundant or incomplete sandbox repositories (e.g., `MultipleVo`, `VO2MAP`) on the primary UI.
