# Skill: Deep Directory Markdown Parsing & Structured Data Extraction

This document serves as a template/record of the "skill" used by the AI to manually iterate through a large number of nested project directories, read their Markdown documentation (`README.md`), and intelligently extract structured metadata into a consolidated code file.

## 🎯 Objective
To manually read and comprehend Markdown files across multiple directories (e.g., 50+ projects) and generate high-quality, structured output (e.g., JSON/JS objects) mapping to a specific template, **without** relying on external LLM APIs, cloud services, or automated Regex-only scripts.

## 🧠 Core Competencies Utilized
1. **Systematic Iteration**: Using bash commands (`find`, `sort`, `sed`, `head`) to chunk a massive list of directories into manageable "batches" to avoid context window limits or losing track of progress.
2. **Reading Comprehension**: Analyzing unstructured human-written README files to infer missing metadata (e.g., technologies used, platforms, tags) and writing concise, engaging summaries.
3. **State Management**: Creating intermediate/temporary files (`project_data.js`) within each specific project directory. This acts as a persistent state so that if a crash or reset occurs, progress is not lost.
4. **Data Aggregation**: Writing a short Python script at the end to stitch all the intermediate files together into the final requested artifact (`new_projects_data.js`).

## 🔄 Workflow Execution

### Step 1: Initialization & Batching
Instead of trying to process all directories at once, list them and break them into chunks.
```bash
# Find all immediate child directories inside 'script/' and save to a text file
find script -maxdepth 1 -mindepth 1 -type d | sort > project_folders.txt
```

### Step 2: Manual Processing Loop (Batch by Batch)
For each batch of projects (e.g., 5-10 at a time), perform the following loop:
1. **Read**: `cat script/ProjectName/READMEs.md`
2. **Comprehend**: Read the text, identifying the core purpose, highlights, and tech stack.
3. **Generate**: Create the structured object directly via Bash EOF block.
```bash
cat << 'INNER_EOF' > script/ProjectName/project_data.js
  {
    id: 'projectname',
    cluster: 'category',
    name: 'ProjectName',
    ...
  }
INNER_EOF
```
4. **Commit Intermediate State**:
```bash
git add script/ProjectName/project_data.js
git commit -m "Add extracted data for ProjectName"
```

### Step 3: Aggregation
Once all directories have been processed and their individual data files created, run an aggregation script to combine them into the final desired format.
```python
import glob

# Template headers
header = "window.PROJECTS = [\n"

files = glob.glob("script/*/project_data.js")
files.sort()

contents = []
for file in files:
    with open(file, "r") as f:
        contents.append(f.read().strip())

final_content = header + ",\n".join(contents) + "\n];\n"

with open("new_projects_data.js", "w") as f:
    f.write(final_content)
```

### Step 4: Cleanup
Remove the intermediate `.js` files and cleanup scripts, leaving only the pristine, aggregated final artifact.

## ⚠️ Pitfalls & Lessons Learned
* **Context Loss / Token Limits**: Reading 50+ detailed READMEs in a single continuous prompt causes the AI to lose earlier context. **Solution**: Use physical files on the disk (`project_data.js`) to store intermediate results, allowing the AI to "forget" the older projects and focus on the current batch.
* **Accidental Deletions (`git reset --hard`)**: If temporary files are not staged/committed, a hard reset will destroy hours of extraction work. **Solution**: Commit the intermediate files at every step!
* **Heuristics vs. Comprehension**: Automated python scripts using RegEx cannot accurately write a "short catchy tagline" or a "detailed explanation" from a generic README. The AI must read the text and use its LLM capabilities to synthesize the summary manually.
