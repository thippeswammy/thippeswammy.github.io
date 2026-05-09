// ═══════════════════════════════════════════════════════════════════
// github_components.js - Logic for Pinned Projects & Contributions
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initGitHubCalendar();
  initPinnedProjects();
});

function initGitHubCalendar() {
  const calendarContainer = document.querySelector('.calendar');
  if (calendarContainer && typeof GitHubCalendar !== 'undefined') {
    // Replace 'thippeswammy' with your actual GitHub username
    GitHubCalendar(calendarContainer, 'thippeswammy', {
      responsive: true,
      global_stats: false, // Set to true if you want total stats shown below
      tooltips: true
    }).then(() => {
      // Force dark mode colors on the generated SVG if needed
      const svg = calendarContainer.querySelector('svg');
      if(svg) {
        svg.style.backgroundColor = 'transparent';
      }
    }).catch(e => {
      calendarContainer.innerHTML = '<p>Error loading GitHub contributions.</p>';
      console.error(e);
    });
  }
}

// State management for pinned projects
let pinnedProjectIds = [];

function initPinnedProjects() {
  // Load from localStorage or set defaults
  const saved = localStorage.getItem('github_pinned_projects');
  if (saved) {
    try {
      pinnedProjectIds = JSON.parse(saved);
    } catch(e) {
      pinnedProjectIds = getDefaultPinned();
    }
  } else {
    pinnedProjectIds = getDefaultPinned();
    savePinnedProjects();
  }

  renderPinnedProjects();

  // Initialize Sortable for drag and drop
  const container = document.getElementById('github-pinned-container');
  if (container && typeof Sortable !== 'undefined') {
    new Sortable(container, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: function (evt) {
        // Reorder array based on new DOM order
        const itemEls = container.querySelectorAll('.pinned-item');
        const newOrder = Array.from(itemEls).map(el => el.dataset.id);
        pinnedProjectIds = newOrder;
        savePinnedProjects();
        // Update main grid buttons if needed
        updateAllPinButtons();
      },
    });
  }
}

function getDefaultPinned() {
  // Pin the first 6 projects by default
  return window.PROJECTS.slice(0, 6).map(p => p.id);
}

function savePinnedProjects() {
  localStorage.setItem('github_pinned_projects', JSON.stringify(pinnedProjectIds));
}

function getProjectById(id) {
  return window.PROJECTS.find(p => p.id === id);
}

function renderPinnedProjects() {
  const container = document.getElementById('github-pinned-container');
  if (!container) return;

  container.innerHTML = '';
  
  if (pinnedProjectIds.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted)">No pinned projects yet. Pin some from the main grid below!</p>';
    return;
  }

  pinnedProjectIds.forEach(id => {
    const proj = getProjectById(id);
    if (!proj) return;

    // Determine language color dot (simple mapping)
    let langColor = '#8b949e';
    if(proj.lang === 'C++') langColor = '#f34b7d';
    else if(proj.lang === 'Python') langColor = '#3572A5';
    else if(proj.lang === 'Java') langColor = '#b07219';
    else if(proj.lang === 'C#') langColor = '#178600';
    else if(proj.lang === 'MATLAB') langColor = '#e16737';

    // Build the GitHub-style card
    const card = document.createElement('div');
    card.className = 'pinned-item';
    card.dataset.id = proj.id;
    
    card.innerHTML = `
      <div class="pinned-item-header">
        <div class="pinned-item-title-wrapper">
          <svg class="octicon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path></svg>
          <a href="${proj.github}" target="_blank" class="pinned-item-title">${proj.name}</a>
          <span class="pinned-item-badge">${proj.isPrivate ? 'Private' : 'Public'}</span>
        </div>
        <button class="unpin-btn" title="Unpin from profile" onclick="togglePin('${proj.id}')">
          <svg viewBox="0 0 16 16" width="16" height="16" class="octicon"><path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path></svg>
        </button>
      </div>
      <p class="pinned-item-desc">${proj.summary}</p>
      <div class="pinned-item-meta">
        <span class="pinned-item-lang">
          <span class="lang-color" style="background-color: ${langColor}"></span>
          ${proj.lang}
        </span>
      </div>
    `;
    container.appendChild(card);
  });
}

// Global function callable from index.html card buttons
window.togglePin = function(projectId) {
  const index = pinnedProjectIds.indexOf(projectId);
  if (index > -1) {
    // Remove
    pinnedProjectIds.splice(index, 1);
  } else {
    // Add
    pinnedProjectIds.push(projectId);
  }
  
  savePinnedProjects();
  renderPinnedProjects();
  updateAllPinButtons();
};

window.isProjectPinned = function(projectId) {
  return pinnedProjectIds.includes(projectId);
};

// Function to update the UI state of pin buttons on the main grid
window.updateAllPinButtons = function() {
  const buttons = document.querySelectorAll('.card-pin-btn');
  buttons.forEach(btn => {
    const pid = btn.dataset.id;
    if (window.isProjectPinned(pid)) {
      btn.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path></svg> Unpin';
      btn.classList.add('is-pinned');
    } else {
      btn.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path></svg> Pin';
      btn.classList.remove('is-pinned');
    }
  });
};
