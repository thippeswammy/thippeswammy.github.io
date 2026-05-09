// ═══════════════════════════════════════════════════════════════════
// github_components.js - Logic for Pinned Projects & Contributions
// ═══════════════════════════════════════════════════════════════════

const GITHUB_USERNAME = 'thippeswammy';

document.addEventListener('DOMContentLoaded', () => {
  initGitHubCalendar();
  initPinnedProjects();
  initYearLinks();
});

function getHistoricalFallback(year, url) {
  return `
    <div style="text-align: center; padding: 40px 20px; color: var(--text-muted, #8b949e); background: var(--glass, transparent); border-radius: 16px; min-height: 150px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <svg viewBox="0 0 16 16" width="24" height="24" fill="currentColor" style="margin-bottom: 10px;"><path fill-rule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"></path></svg>
      <h4 style="color: var(--text-main, #c9d1d9); margin: 0 0 5px 0; font-family: var(--font-h);">Contribution Data for ${year}</h4>
      <p style="margin: 0; font-size: 13px; font-family: var(--font-b);">The live calendar for this period is temporarily unavailable.<br>
      <a href="${url}" target="_blank" style="color: #6366f1; font-weight: 600; text-decoration: none;">View ${year} activity on GitHub ↗</a></p>
    </div>
  `;
}

function initYearLinks() {
  const yearLinks = document.querySelectorAll('.year-list a');
  yearLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      yearLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const year = link.textContent.trim();
      const url = link.getAttribute('href');
      const calendarContainer = document.querySelector('.calendar');
      
      if (calendarContainer) {
        calendarContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Loading ' + year + ' contributions...</div>';
        
        const header = document.getElementById('contribution-count-header');
        if (header) header.textContent = `Fetching ${year} data...`;

        // Attempt to fetch specific year
        GitHubCalendar(calendarContainer, GITHUB_USERNAME, {
          responsive: true,
          global_stats: true,
          tooltips: true,
          proxy: (username) => fetch(`https://github-calendar-api.com/${username}?from=${year}-01-01&to=${year}-12-31`)
        }).then(() => {
          const success = updateStats(calendarContainer, header, year);
          if (!success) throw new Error("Parsed 0 contributions");
          finalizeCalendar(calendarContainer);
        }).catch(err => {
          console.warn("Failed to fetch historical data.");
          calendarContainer.innerHTML = getHistoricalFallback(year, url);
          if (header) header.textContent = `Contributions in ${year}`;
        });
      }
    });
  });
}

function updateStats(calendarContainer, header, periodText) {
  const contribNumber = calendarContainer.querySelector('.contrib-number');
  if (contribNumber && header) {
    const count = contribNumber.textContent.replace(' total', '').trim();
    // If it's 0, we suspect a proxy error (unless it's actually 0, but unlikely for this user)
    if (count === "0" || count === "") return false;
    
    header.textContent = count + ` in ${periodText}`;
    
    const statsContainer = calendarContainer.querySelector('.contrib-column');
    if (statsContainer && statsContainer.parentElement) {
      statsContainer.parentElement.style.display = 'none';
    }
    return true;
  }
  return false;
}

function initGitHubCalendar() {
  const calendarContainer = document.querySelector('.calendar');
  if (calendarContainer && typeof GitHubCalendar !== 'undefined') {
    // Try live fetch first
    GitHubCalendar(calendarContainer, GITHUB_USERNAME, {
      responsive: true,
      global_stats: true,
      tooltips: true
    }).then(() => {
      const success = updateStats(calendarContainer, document.getElementById('contribution-count-header'), 'the last year');
      if (!success) {
         console.warn("Live fetch returned 0. Triggering fallback.");
         loadLocalFallback(calendarContainer);
      } else {
         finalizeCalendar(calendarContainer);
      }
    }).catch(e => {
      console.warn("Main calendar proxy failed. Attempting local fallback...");
      loadLocalFallback(calendarContainer);
    });
  }
}

function loadLocalFallback(calendarContainer) {
  fetch('extracted_contributions.html')
    .then(response => response.text())
    .then(html => {
      // Create a temporary element to parse the HTML
      const temp = document.createElement('div');
      temp.innerHTML = html;
      
      // Look for the calendar graph
      const graph = temp.querySelector('.js-calendar-graph');
      if (graph) {
        calendarContainer.innerHTML = '';
        calendarContainer.appendChild(graph);
        
        // Extract count from the fallback HTML
        const countHeader = temp.querySelector('h2');
        const header = document.getElementById('contribution-count-header');
        if (countHeader && header) {
          const countText = countHeader.textContent.trim().split(' ')[0];
          if (countText && countText !== "0") {
            header.textContent = countText + ' contributions in the last year';
          }
        }
        
        finalizeCalendar(calendarContainer);
      } else {
        throw new Error("No graph found in local fallback");
      }
    })
    .catch(localErr => {
      console.error("Local fallback failed:", localErr);
      calendarContainer.innerHTML = getHistoricalFallback('the last year', `https://github.com/${GITHUB_USERNAME}`);
    });
}

function finalizeCalendar(calendarContainer) {
  const svg = calendarContainer.querySelector('svg');
  if (svg) {
    svg.style.backgroundColor = 'transparent';
    svg.style.width = '100%';
    svg.style.height = 'auto';
  }
  const skipText = calendarContainer.querySelector('h2.sr-only');
  if (skipText) skipText.style.display = 'none';
  setupCustomTooltips(calendarContainer);
}

function setupCustomTooltips(calendarContainer) {
  let tooltip = document.getElementById('github-native-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'github-native-tooltip';
    document.body.appendChild(tooltip);
  }

  calendarContainer.addEventListener('mouseover', (e) => {
    const dayEl = e.target.closest('.ContributionCalendar-day');
    if (dayEl) {
      const date = dayEl.getAttribute('data-date');
      const level = dayEl.getAttribute('data-level');
      let text = '';
      const id = dayEl.id;
      if (id) {
        const tooltipEl = document.querySelector(`tool-tip[for="${id}"]`);
        if (tooltipEl) text = tooltipEl.textContent;
      }
      if (!text && date) {
        text = (level === "0" || !level) ? `No contributions on ${date}` : `${level} contributions on ${date}`;
      }
      if (text) {
        tooltip.textContent = text;
        tooltip.style.display = 'block';
        const rect = dayEl.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
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

// --- Pinned Projects Logic ---
let pinnedProjectIds = [];

function initPinnedProjects() {
  pinnedProjectIds = window.PINNED_PROJECTS || [];
  renderPinnedProjects();
  const container = document.getElementById('github-pinned-container');
  if (container && typeof Sortable !== 'undefined') {
    new Sortable(container, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: function () {
        const itemEls = container.querySelectorAll('.pinned-item');
        pinnedProjectIds = Array.from(itemEls).map(el => el.dataset.id);
      },
    });
  }
}

function renderPinnedProjects() {
  const container = document.getElementById('github-pinned-container');
  if (!container) return;
  container.innerHTML = '';
  pinnedProjectIds.forEach(id => {
    const proj = window.PROJECTS.find(p => p.id === id);
    if (!proj) return;
    let langColor = '#8b949e';
    if (proj.lang === 'C++') langColor = '#f34b7d';
    else if (proj.lang === 'Python') langColor = '#3572A5';
    else if (proj.lang === 'Java') langColor = '#b07219';
    else if (proj.lang === 'C#') langColor = '#178600';
    else if (proj.lang === 'MATLAB') langColor = '#e16737';

    const card = document.createElement('div');
    card.className = 'pinned-item';
    card.dataset.id = proj.id;
    card.innerHTML = `
      <div class="pinned-item-header">
        <div class="pinned-item-title-wrapper">
          <svg class="octicon" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path></svg>
          <a href="${proj.github}" target="_blank" class="pinned-item-title">${proj.name}</a>
        </div>
        <span class="pinned-item-badge">${proj.isPrivate ? 'Private' : 'Public'}</span>
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
window.openPinModal = function () {
  const modal = document.getElementById('pin-modal');
  const listContainer = document.getElementById('pin-modal-list');
  if (!modal || !listContainer) return;
  listContainer.innerHTML = '';
  window.PROJECTS.forEach(proj => {
    const isPinned = pinnedProjectIds.includes(proj.id);
    const item = document.createElement('div');
    item.className = 'pin-checkbox-item';
    item.innerHTML = `
      <input type="checkbox" id="pin-check-${proj.id}" value="${proj.id}" ${isPinned ? 'checked' : ''} onchange="window.toggleModalPin(this)">
      <label class="pin-checkbox-label" for="pin-check-${proj.id}">
        <span class="pin-checkbox-title">${proj.name}</span>
        <span class="pin-checkbox-desc">${proj.summary}</span>
      </label>
    `;
    listContainer.appendChild(item);
  });
  modal.classList.add('active');
  document.body.classList.add('modal-open');
};

window.closePinModal = function () {
  const modal = document.getElementById('pin-modal');
  if (modal) modal.classList.remove('active');
  document.body.classList.remove('modal-open');
};

window.toggleModalPin = function (checkbox) {
  const val = checkbox.value;
  if (checkbox.checked) {
    if (!pinnedProjectIds.includes(val)) pinnedProjectIds.push(val);
  } else {
    pinnedProjectIds = pinnedProjectIds.filter(id => id !== val);
  }
};

window.saveModalPins = function () {
  renderPinnedProjects();
  closePinModal();
};

window.addEventListener('click', (event) => {
  const modal = document.getElementById('pin-modal');
  if (event.target == modal) window.closePinModal();
});
