// ═══════════════════════════════════════════════════════════════════
// github_components.js - Logic for Pinned Projects & Contributions
// ═══════════════════════════════════════════════════════════════════

const GITHUB_USERNAME = 'thippeswammy';
const CONTRIBUTIONS_API = `https://github-contributions-api.deno.dev/${GITHUB_USERNAME}.json`;

document.addEventListener('DOMContentLoaded', () => {
  initGitHubCalendar();
  initPinnedProjects();
  initYearLinks();
});

function initGitHubCalendar() {
  const calendarContainer = document.querySelector('.calendar');
  const header = document.getElementById('contribution-count-header');
  
  if (!calendarContainer) return;

  // Initial loading state
  calendarContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted); font-family: var(--font-b);">Updating live contributions...</div>';

  fetch(CONTRIBUTIONS_API)
    .then(response => {
      if (!response.ok) throw new Error('API unreachable');
      return response.json();
    })
    .then(data => {
      renderCalendar(calendarContainer, data);
      if (header && data.totalContributions) {
        header.textContent = `${data.totalContributions.toLocaleString()} contributions in the last year`;
      }
    })
    .catch(err => {
      console.error('GitHub API Error:', err);
      loadLocalFallback(calendarContainer);
    });
}

function renderCalendar(container, data) {
  if (!data.contributions || !data.contributions.length) return;

  container.innerHTML = ''; 
  
  const calendarWrapper = document.createElement('div');
  calendarWrapper.className = 'calendar-wrapper';
  calendarWrapper.style.display = 'flex';
  calendarWrapper.style.flexDirection = 'column';
  calendarWrapper.style.gap = '12px';
  calendarWrapper.style.padding = '5px 0';

  const graphContainer = document.createElement('div');
  graphContainer.className = 'js-calendar-graph-svg'; // Matches existing CSS
  graphContainer.style.display = 'flex';
  graphContainer.style.gap = '3px';
  graphContainer.style.overflowX = 'auto';
  graphContainer.style.paddingBottom = '10px';

  // Level mapping for CSS data-level attributes
  const levelMap = {
    'NONE': '0',
    'FIRST_QUARTILE': '1',
    'SECOND_QUARTILE': '2',
    'THIRD_QUARTILE': '3',
    'FOURTH_QUARTILE': '4'
  };

  data.contributions.forEach(week => {
    const weekCol = document.createElement('div');
    weekCol.style.display = 'flex';
    weekCol.style.flexDirection = 'column';
    weekCol.style.gap = '3px';

    week.forEach(day => {
      const dayRect = document.createElement('div');
      dayRect.className = 'ContributionCalendar-day'; // Matches existing CSS
      dayRect.style.width = '11px';
      dayRect.style.height = '11px';
      dayRect.style.borderRadius = '2px';
      
      const level = levelMap[day.contributionLevel] || '0';
      dayRect.setAttribute('data-level', level);
      dayRect.setAttribute('data-date', day.date);
      dayRect.setAttribute('data-count', day.contributionCount);
      
      weekCol.appendChild(dayRect);
    });
    graphContainer.appendChild(weekCol);
  });

  calendarWrapper.appendChild(graphContainer);
  
  // Legend & Footer
  const footer = document.createElement('div');
  footer.className = 'contrib-footer'; // Matches existing CSS
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.style.alignItems = 'center';
  footer.style.marginTop = '10px';
  footer.style.fontSize = '11px';
  footer.style.color = 'var(--text-muted)';
  
  footer.innerHTML = `
    <div><a href="https://github.com/${GITHUB_USERNAME}" target="_blank" style="color: inherit; text-decoration: none;">GitHub Profile ↗</a></div>
    <div class="contrib-legend" style="display: flex; align-items: center; gap: 4px;">
      <span>Less</span>
      <ul class="legend" style="display: flex; gap: 3px; list-style: none; padding: 0; margin: 0 4px;">
        <li class="ContributionCalendar-day" data-level="0" style="width: 10px; height: 10px; border-radius: 2px;"></li>
        <li class="ContributionCalendar-day" data-level="1" style="width: 10px; height: 10px; border-radius: 2px;"></li>
        <li class="ContributionCalendar-day" data-level="2" style="width: 10px; height: 10px; border-radius: 2px;"></li>
        <li class="ContributionCalendar-day" data-level="3" style="width: 10px; height: 10px; border-radius: 2px;"></li>
        <li class="ContributionCalendar-day" data-level="4" style="width: 10px; height: 10px; border-radius: 2px;"></li>
      </ul>
      <span>More</span>
    </div>
  `;
  
  calendarWrapper.appendChild(footer);
  container.appendChild(calendarWrapper);
  
  setupCustomTooltips(container);
}

function loadLocalFallback(container) {
  fetch('extracted_contributions.html')
    .then(response => response.text())
    .then(html => {
      container.innerHTML = html;
      const svg = container.querySelector('svg');
      if (svg) {
        svg.style.backgroundColor = 'transparent';
        svg.style.width = '100%';
        svg.style.height = 'auto';
      }
      setupCustomTooltips(container);
    })
    .catch(() => {
      container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">Data temporarily unavailable. <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" style="color: var(--accent);">View on GitHub</a></p>`;
    });
}

function setupCustomTooltips(container) {
  let tooltip = document.getElementById('github-native-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'github-native-tooltip';
    document.body.appendChild(tooltip);
  }

  container.addEventListener('mouseover', (e) => {
    const dayEl = e.target.closest('.ContributionCalendar-day');
    if (dayEl) {
      const date = dayEl.getAttribute('data-date');
      const count = dayEl.getAttribute('data-count');
      if (date) {
        tooltip.textContent = `${count || 0} contributions on ${date}`;
        tooltip.style.display = 'block';
        const rect = dayEl.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2)}px`;
        tooltip.style.top = `${rect.top + window.scrollY - tooltipRect.height - 8}px`;
      }
    }
  });

  container.addEventListener('mouseout', () => {
    tooltip.style.display = 'none';
  });
}

function initYearLinks() {
  const yearLinks = document.querySelectorAll('.year-list a');
  yearLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      yearLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const year = link.textContent.trim();
      const calendarContainer = document.querySelector('.calendar');
      const header = document.getElementById('contribution-count-header');
      
      if (calendarContainer) {
        calendarContainer.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: var(--text-muted, #8b949e); background: var(--glass, transparent); border-radius: 16px; min-height: 150px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <svg viewBox="0 0 16 16" width="24" height="24" fill="currentColor" style="margin-bottom: 10px;"><path fill-rule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"></path></svg>
            <h4 style="color: var(--text-main, #c9d1d9); margin: 0 0 5px 0; font-family: var(--font-h);">Activity for ${year}</h4>
            <p style="margin: 0; font-size: 13px; font-family: var(--font-b);">Live history requires direct GitHub profile access.<br>
            <a href="${link.getAttribute('href')}" target="_blank" style="color: var(--accent, #6366f1); font-weight: 600; text-decoration: none;">View ${year} on GitHub ↗</a></p>
          </div>
        `;
        if (header) header.textContent = `Contributions in ${year}`;
      }
    });
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
