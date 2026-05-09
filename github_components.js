// ═══════════════════════════════════════════════════════════════════
// github_components.js - Logic for Pinned Projects & Contributions
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initGitHubCalendar();
  initPinnedProjects();
  initYearLinks();
});

function initYearLinks() {
  const yearLinks = document.querySelectorAll('.year-list a');
  yearLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update active class
      yearLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      const year = link.textContent.trim();
      const url = link.getAttribute('href');
      
      const calendarContainer = document.querySelector('.calendar');
      if (calendarContainer) {
        if (year === '2026') {
          // Reload current year
          calendarContainer.innerHTML = 'Loading GitHub data...';
          initGitHubCalendar();
        } else {
          // Show message for historical years
          calendarContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted, #8b949e); background: var(--glass, transparent); border-radius: 16px; min-height: 150px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <svg viewBox="0 0 16 16" width="24" height="24" fill="currentColor" style="margin-bottom: 10px;"><path fill-rule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"></path></svg>
              <h4 style="color: var(--text-main, #c9d1d9); margin: 0 0 5px 0; font-family: var(--font-h);">Historical Data for ${year}</h4>
              <p style="margin: 0; font-size: 13px; font-family: var(--font-b);">Live rendering of past years requires backend API access.<br>
              <a href="${url}" target="_blank" style="color: #6366f1; font-weight: 600; text-decoration: none;">View ${year} contributions on GitHub ↗</a></p>
            </div>
          `;
        }
      }
    });
  });
}

function initGitHubCalendar() {
  const calendarContainer = document.querySelector('.calendar');
  if (calendarContainer && typeof GitHubCalendar !== 'undefined') {
    // Replace 'thippeswammy' with your actual GitHub username
    GitHubCalendar(calendarContainer, 'thippeswammy', {
      responsive: true,
      global_stats: false, // Hide default text at bottom
      tooltips: true
    }).then(() => {
      // Force dark mode colors on the generated SVG if needed
      const svg = calendarContainer.querySelector('svg');
      if(svg) {
        svg.style.backgroundColor = 'transparent';
      }
      
      // Attempt to hide "Skip to contributions year list"
      const skipText = calendarContainer.querySelector('h2.sr-only');
      if (skipText) skipText.style.display = 'none';

      // Setup custom native tooltips
      setupCustomTooltips(calendarContainer);
      
    }).catch(e => {
      calendarContainer.innerHTML = '<p>Error loading GitHub contributions.</p>';
      console.error(e);
    });
  }
}

function setupCustomTooltips(calendarContainer) {
  let tooltip = document.getElementById('github-native-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'github-native-tooltip';
    document.body.appendChild(tooltip);
  }

  calendarContainer.addEventListener('mouseover', (e) => {
    // Some calendar structures use <rect> instead of <td>, or have nested elements
    const dayEl = e.target.closest('.ContributionCalendar-day');
    if (dayEl) {
      const date = dayEl.getAttribute('data-date');
      const level = dayEl.getAttribute('data-level');
      
      let text = '';
      const id = dayEl.id;
      
      // Attempt to find the sibling <tool-tip> created by GitHub/github-calendar
      if (id) {
        const tooltipEl = document.querySelector(`tool-tip[for="${id}"]`);
        if (tooltipEl) text = tooltipEl.textContent;
      }
      
      // Fallback formatting if <tool-tip> is missing
      if (!text && date) {
        if (!level || level === "0") {
          text = `No contributions on ${date}`;
        } else {
          text = `${level} contributions on ${date}`; // Fallback logic
        }
      }

      if (text) {
        tooltip.textContent = text;
        tooltip.style.display = 'block';
        
        const rect = dayEl.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Position centered above the element
        tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2)}px`;
        tooltip.style.top = `${rect.top + window.scrollY - tooltipRect.height - 8}px`;
      }
    }
  });

  calendarContainer.addEventListener('mouseout', (e) => {
    if (e.target.closest('.ContributionCalendar-day')) {
      tooltip.style.display = 'none';
    }
  });
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
    container.innerHTML = '<p style="color:var(--text-muted)">No pinned projects yet. Click "Customize your pins" to add some!</p>';
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

// --- Modal Logic ---

let temporaryModalPins = [];

window.openPinModal = function() {
  const modal = document.getElementById('pin-modal');
  const listContainer = document.getElementById('pin-modal-list');
  if(!modal || !listContainer) return;
  
  // Clone current pins for editing
  temporaryModalPins = [...pinnedProjectIds];
  
  // Generate list
  listContainer.innerHTML = '';
  window.PROJECTS.forEach(proj => {
    const isPinned = temporaryModalPins.includes(proj.id);
    
    const item = document.createElement('label');
    item.className = 'pin-modal-item';
    item.innerHTML = `
      <input type="checkbox" value="${proj.id}" ${isPinned ? 'checked' : ''} onchange="toggleModalPin(this)">
      <span class="pin-modal-item-name">${proj.name}</span>
    `;
    listContainer.appendChild(item);
  });
  
  updateModalPinCount();
  modal.style.display = 'flex';
};

window.closePinModal = function() {
  const modal = document.getElementById('pin-modal');
  if(modal) modal.style.display = 'none';
};

window.toggleModalPin = function(checkbox) {
  const val = checkbox.value;
  if(checkbox.checked) {
    if(!temporaryModalPins.includes(val)) temporaryModalPins.push(val);
  } else {
    temporaryModalPins = temporaryModalPins.filter(id => id !== val);
  }
  updateModalPinCount();
};

window.updateModalPinCount = function() {
  const countText = document.getElementById('pin-count-text');
  if(countText) {
    countText.textContent = `${temporaryModalPins.length} selected`;
  }
};

window.saveModalPins = function() {
  pinnedProjectIds = [...temporaryModalPins];
  savePinnedProjects();
  renderPinnedProjects();
  closePinModal();
};

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('pin-modal');
  if (event.target == modal) {
    closePinModal();
  }
};
