// ═══════════════════════════════════════════════════════════════════
// github_components.js - Logic for Pinned Projects & Contributions
// ═══════════════════════════════════════════════════════════════════

const GITHUB_USERNAME = 'thippeswammy';
const CONTRIBUTIONS_API = `https://github-contributions-api.deno.dev/${GITHUB_USERNAME}.json`;
const START_YEAR = 2020; // Changed from 2019

document.addEventListener('DOMContentLoaded', () => {
  generateYearList(); 
  initGitHubCalendar();
  initPinnedProjects();
});

function initGitHubCalendar() {
  const calendarContainer = document.querySelector('.calendar');
  const contributionHeader = document.querySelector('.gh-stat-number');
  if (!calendarContainer) return;

  calendarContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted); font-family: var(--font-b);">Initializing neural grid...</div>';

  fetch(CONTRIBUTIONS_API)
    .then(response => {
      if (!response.ok) throw new Error('API unreachable');
      return response.json();
    })
    .then(data => {
      renderCalendar(calendarContainer, data);
      if (contributionHeader) {
        animateCountUp(contributionHeader, data.totalContributions || 0);
      }
      updateAnalytics(data);
    })
    .catch(err => {
      console.warn('GitHub API Error, using fallback:', err);
      // Try to load current year from fallback if API fails
      const currentYear = new Date().getFullYear().toString();
      loadYearlyFallback(calendarContainer, currentYear, contributionHeader);
    });
}

function animateCountUp(el, target) {
  let count = 0;
  const duration = 2000;
  const start = performance.now();
  
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutQuad = t => t * (2 - t);
    const current = Math.floor(easeOutQuad(progress) * target);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}


function renderCalendar(container, data) {
  if (!data || !data.contributions) return;
  container.innerHTML = ''; 
  
  const calendarWrapper = document.createElement('div');
  calendarWrapper.className = 'calendar-wrapper';
  calendarWrapper.style.cssText = 'display:flex; flex-direction:column; gap:2px; width:100%;';

  const scrollContainer = document.createElement('div');
  scrollContainer.style.cssText = 'overflow-x: auto; width: 100%;';

  const innerScroll = document.createElement('div');
  innerScroll.style.cssText = 'padding: 0 5px; display: flex; flex-direction: column; gap: 2px; min-width: 800px;';

  const monthRow = document.createElement('div');
  monthRow.style.cssText = 'display:flex; gap:3px; margin-left:32px; font-size:10px; color:var(--text-muted); height:20px;';

  const mainGrid = document.createElement('div');
  mainGrid.style.cssText = 'display:flex; gap:8px; align-items:flex-start;';

  const dayLabels = document.createElement('div');
  dayLabels.style.cssText = 'display:flex; flex-direction:column; justify-content:space-between; height:95px; font-size:10px; color:var(--text-muted); padding-top:1px; width:24px; flex-shrink:0; text-align: right; margin-right: 2px;';
  ['', 'Mon', '', 'Wed', '', 'Fri', ''].forEach(d => {
    const span = document.createElement('span');
    span.textContent = d;
    span.style.height = '11px';
    dayLabels.appendChild(span);
  });

  const graphContainer = document.createElement('div');
  graphContainer.style.cssText = 'display:flex; gap:3px;';

  const levelMap = { 'NONE':'0', 'FIRST_QUARTILE':'1', 'SECOND_QUARTILE':'2', 'THIRD_QUARTILE':'3', 'FOURTH_QUARTILE':'4' };
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let lastMonth = -1;

  data.contributions.forEach((week) => {
    const weekCol = document.createElement('div');
    weekCol.style.cssText = 'display:flex; flex-direction:column; gap:3px;';
    const monthCell = document.createElement('div');
    monthCell.style.cssText = 'width:11px; flex-shrink:0; position:relative;';
    
    const dateObj = new Date(week[0].date);
    const monthIdx = dateObj.getMonth();
    if (monthIdx !== lastMonth) {
      lastMonth = monthIdx;
      const mLabel = document.createElement('span');
      mLabel.textContent = monthNames[monthIdx];
      mLabel.style.cssText = 'position:absolute; left:0; top:0; white-space:nowrap;';
      monthCell.appendChild(mLabel);
    }
    monthRow.appendChild(monthCell);

    week.forEach(day => {
      const dayRect = document.createElement('div');
      dayRect.className = 'ContributionCalendar-day';
      dayRect.style.width = '11px';
      dayRect.style.height = '11px';
      dayRect.style.margin = '1px';
      dayRect.style.borderRadius = '2px';
      dayRect.setAttribute('data-level', levelMap[day.contributionLevel] || '0');
      dayRect.setAttribute('data-date', day.date);
      dayRect.setAttribute('data-count', day.contributionCount);
      weekCol.appendChild(dayRect);
    });
    graphContainer.appendChild(weekCol);
  });

  mainGrid.appendChild(dayLabels);
  mainGrid.appendChild(graphContainer);
  innerScroll.appendChild(monthRow);
  innerScroll.appendChild(mainGrid);
  scrollContainer.appendChild(innerScroll);
  calendarWrapper.appendChild(scrollContainer);
  
  const footerContainer = document.getElementById('gh-footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = `
      <div class="gh-footer-row" style="display:flex; justify-content:space-between; align-items:center; background:rgba(255, 255, 255, 0.02); border:1px solid rgba(255,255,255,0.05); border-radius:24px; padding:20px 32px; margin-top:30px; width:100%; box-sizing:border-box;">
        <div style="display:flex; align-items:center; gap:16px;">
          <img src="https://avatars.githubusercontent.com/u/73697198?v=4" style="width:42px; height:42px; border-radius:50%; border:2px solid rgba(255,255,255,0.1); box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" style="color:#fff; text-decoration:none; font-weight:700; font-size:15px; letter-spacing:0.5px; font-family:var(--font-h);">GitHub Profile ↗</a>
            </div>
            <div style="color:var(--text-muted); font-size:12px; font-family:var(--font-b); opacity:0.7;">View full profile and repositories</div>
          </div>
        </div>
        
        <div class="contrib-legend" style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:10px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; font-family:var(--font-b);">Less</span>
          <ul style="display:flex; gap:6px; list-style:none; padding:0; margin:0;">
            <li class="ContributionCalendar-day" data-level="0" style="width:11px; height:11px; border-radius:2px; background:rgba(255,255,255,0.05);"></li>
            <li class="ContributionCalendar-day" data-level="1" style="width:11px; height:11px; border-radius:2px; background:#1d4ed8;"></li>
            <li class="ContributionCalendar-day" data-level="2" style="width:11px; height:11px; border-radius:2px; background:#3b82f6;"></li>
            <li class="ContributionCalendar-day" data-level="3" style="width:11px; height:11px; border-radius:2px; background:#8b5cf6;"></li>
            <li class="ContributionCalendar-day" data-level="4" style="width:11px; height:11px; border-radius:2px; background:#d946ef;"></li>
          </ul>
          <span style="font-size:10px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; font-family:var(--font-b);">More</span>
        </div>
      </div>
    `;
  }
  
  container.appendChild(calendarWrapper);
  setupCustomTooltips(container);
}



function loadYearlyFallback(container, year, header) {
  const fromDate = `${year}-01-01`;
  const toDate = `${year}-12-31`;
  const apiURL = `https://github-contributions-api.deno.dev/${GITHUB_USERNAME}.json?from=${fromDate}&to=${toDate}`;
  
  // Attempt 1: Fetch via API (Automated & CORS-friendly)
  fetch(apiURL)
    .then(r => {
      if (!r.ok) throw new Error('API Range failed');
      return r.json();
    })
    .then(data => {
      // We only throw if the basic structure is missing. 
      // If totalContributions is 0, we still want to render the grid!
      if (!data.contributions || data.contributions.length === 0) {
          throw new Error('No structural data in API');
      }
      
      renderCalendar(container, data);
      if (header) {
        animateCountUp(header, data.totalContributions || 0);
      }
      updateAnalytics(data);
    })
    .catch(apiErr => {
      console.warn(`API range fetch failed for ${year}, trying local fallback:`, apiErr);
      
      // Attempt 2: Local HTML Fallback (Existing files)
      const fileName = `contributions_${year}.html`;
      fetch(`./${fileName}`)
        .then(r => {
          if (!r.ok) throw new Error(`Local file not found and API failed`);
          return r.text();
        })
        .then(html => {
          container.innerHTML = `
            <div class="calendar-wrapper" style="display:flex; flex-direction:column; align-items:center; width:100%;">
              <div class="scroll-container" style="overflow-x:auto; width:100%; display:flex; justify-content:center;">
                <div class="inner-content" style="padding: 10px;">
                  ${html}
                </div>
              </div>
            </div>
          `;
          
          const svg = container.querySelector('svg');
          if (svg) svg.style.cssText = 'background:transparent; width:100%; height:auto; min-width: 700px;';

          const stats = extractStatsFromHTML(html);
          if (header) animateCountUp(header, stats.totalContributions);
          updateAnalytics(stats);
          setupCustomTooltips(container);
        })
        .catch(err => {
          console.error(`Full failure for ${year}:`, err);
          container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px dashed rgba(255,255,255,0.1);">
              <div style="font-size: 24px; margin-bottom: 10px;">📡</div>
              <p style="color:var(--text-muted); margin-bottom: 10px;">Data for ${year} is currently unavailable.</p>
              <p style="color:var(--accent); font-size: 11px; margin-bottom: 20px; font-family: monospace; opacity: 0.7;">Sync Error: ${apiErr.message} / ${err.message}</p>
              <div style="display:flex; gap:10px; justify-content:center;">
                <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" class="gh-btn" style="padding: 8px 16px; background: var(--accent); color: #fff; text-decoration: none; border-radius: 20px; font-size: 12px;">View on GitHub ↗</a>
                <button onclick="location.reload()" style="padding: 8px 16px; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid var(--border); border-radius: 20px; font-size: 12px; cursor:pointer;">Retry Sync</button>
              </div>
            </div>
          `;
          if (header) header.textContent = '0';
          const analyticsContainer = document.getElementById('gh-analytics');
          if (analyticsContainer) analyticsContainer.innerHTML = '<div style="color:var(--text-muted); font-size:12px; opacity:0.5;">Awaiting sync...</div>';
        });
    });
}

function extractStatsFromHTML(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // 1. Extract Total Contributions from the H2 header
  let total = 0;
  const h2 = tempDiv.querySelector('h2');
  if (h2) {
    const totalMatch = h2.textContent.replace(/,/g, '').match(/(\d+)/);
    if (totalMatch) total = parseInt(totalMatch[1]);
  }

  // 2. Extract Individual Days
  const dayEls = tempDiv.querySelectorAll('.ContributionCalendar-day');
  const contributions = [];
  
  dayEls.forEach(el => {
    const date = el.getAttribute('data-date');
    if (!date) return;
    
    let count = 0;
    const id = el.getAttribute('id');
    
    // Attempt 1: Look for associated tool-tip by ID
    if (id) {
      const tooltip = tempDiv.querySelector(`tool-tip[for="${id}"], [for="${id}"]`);
      if (tooltip) {
        const text = tooltip.textContent.trim().replace(/,/g, '');
        const match = text.match(/^(\d+) contribution/i);
        if (match) count = parseInt(match[1]);
      }
    }
    
    // Attempt 2: Fallback to data-level estimation if count is still 0 but level > 0
    if (count === 0) {
      const level = parseInt(el.getAttribute('data-level') || '0');
      if (level > 0) {
        // Conservative estimates for GitHub levels
        const levelMap = { 1: 1, 2: 5, 3: 15, 4: 30 };
        count = levelMap[level] || 0;
      }
    }
    
    contributions.push({ date, contributionCount: count });
  });

  return {
    totalContributions: total,
    contributions: contributions
  };
}

function setupCustomTooltips(container) {
  let tooltip = document.getElementById('github-native-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'github-native-tooltip';
    document.body.appendChild(tooltip);
  }

  container.addEventListener('mousemove', (e) => {
    const dayEl = e.target.closest('.ContributionCalendar-day') || e.target.closest('rect.ContributionCalendar-day');
    if (dayEl) {
      const date = dayEl.getAttribute('data-date');
      const count = dayEl.getAttribute('data-count');
      if (date) {
        tooltip.innerHTML = `
          <div style="font-weight:700; color:#fff; margin-bottom:4px;">${date}</div>
          <div style="color:var(--text-muted); font-size:11px;">${count || 0} contributions</div>
        `;
        tooltip.style.display = 'block';
        const tooltipRect = tooltip.getBoundingClientRect();
        tooltip.style.left = `${e.pageX - (tooltipRect.width / 2)}px`;
        tooltip.style.top = `${e.pageY - tooltipRect.height - 15}px`;
      }
    } else {
      tooltip.style.display = 'none';
    }
  });
  container.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
}

window.startReplay = function() {
  const days = document.querySelectorAll('.calendar .ContributionCalendar-day[data-date]');
  if (!days.length) return;
  
  let i = 0;
  const interval = setInterval(() => {
    if (i >= days.length) {
      clearInterval(interval);
      return;
    }
    const day = days[i];
    day.style.transform = 'scale(2)';
    day.style.filter = 'brightness(2) drop-shadow(0 0 10px currentColor)';
    
    setTimeout(() => {
      day.style.transform = '';
      day.style.filter = '';
    }, 200);
    
    i++;
  }, 10);
};

function updateAnalytics(data) {
  const analyticsContainer = document.getElementById('gh-analytics');
  if (!analyticsContainer) return;

  // Handle case where no contributions exist
  if (!data.contributions || (Array.isArray(data.contributions) && data.contributions.length === 0)) {
    analyticsContainer.innerHTML = `
      <div class="gh-analytic-card"><div class="gh-analytic-glow"></div><span class="label">Longest Streak</span><span class="value">0 Days</span></div>
      <div class="gh-analytic-card"><div class="gh-analytic-glow"></div><span class="label">Most Active Day</span><span class="value">0 Commits</span></div>
      <div class="gh-analytic-card"><div class="gh-analytic-glow"></div><span class="label">Status</span><span class="value">Neural Sync Active</span></div>
    `;
    return;
  }

  // Handle both API (nested weeks) and parsed HTML (flat array) formats
  const flatDays = Array.isArray(data.contributions[0]) 
    ? data.contributions.flat() 
    : data.contributions;

  let longestStreak = 0;
  let currentStreak = 0;
  let maxDay = { count: 0, date: '' };

  flatDays.forEach(day => {
    if (day.contributionCount > 0) {
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
      if (day.contributionCount > maxDay.count) {
        maxDay = { count: day.contributionCount, date: day.date };
      }
    } else {
      currentStreak = 0;
    }
  });

  analyticsContainer.innerHTML = `
    <div class="gh-analytic-card">
      <div class="gh-analytic-glow"></div>
      <span class="label">Longest Streak</span>
      <span class="value">${longestStreak} Days</span>
    </div>
    <div class="gh-analytic-card">
      <div class="gh-analytic-glow"></div>
      <span class="label">Most Active Day</span>
      <span class="value">${maxDay.count} Commits</span>
    </div>
    <div class="gh-analytic-card">
      <div class="gh-analytic-glow"></div>
      <span class="label">Status</span>
      <span class="value">Neural Sync Active</span>
    </div>
  `;
}


function generateYearList() {
  const container = document.querySelector('.year-list');
  if (!container) return;

  const currentYear = new Date().getFullYear();
  let html = '';

  for (let year = currentYear; year >= START_YEAR; year--) {
    const isActive = year === currentYear ? 'active' : '';
    html += `
      <li class="year-item ${isActive}">
        <span class="year-dot"></span>
        <a href="#" class="${isActive}">${year}</a>
      </li>
    `;
  }

  container.innerHTML = html;
  initYearLinks();
}

function initYearLinks() {
  const yearLinks = document.querySelectorAll('.year-list a');
  const currentYear = new Date().getFullYear().toString();
  
  yearLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const year = link.textContent.trim();
      
      // Update UI active states
      document.querySelectorAll('.year-item').forEach(item => item.classList.remove('active'));
      document.querySelectorAll('.year-list a').forEach(l => l.classList.remove('active'));
      link.closest('.year-item').classList.add('active');
      link.classList.add('active');
      
      const calendarContainer = document.querySelector('.calendar');
      const contributionHeader = document.querySelector('.gh-stat-number');
      const contributionSub = document.querySelector('.gh-stat-label');
      
      if (calendarContainer) {
        calendarContainer.innerHTML = `
          <div style="text-align: center; padding: 60px; color: var(--text-muted);">
            <div class="spinner-sync" style="width: 40px; height: 40px; border: 2px solid rgba(255,255,255,0.05); border-top-color: var(--accent); border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
            <div style="font-family: var(--font-b); letter-spacing: 2px; text-transform: uppercase; font-size: 10px;">Recalibrating for ${year}...</div>
          </div>
        `;
        
        if (contributionSub) {
          contributionSub.textContent = year === currentYear ? 'contributions in the last year' : `contributions in ${year}`;
        }

        if (year === currentYear) {
          initGitHubCalendar(); 
        } else {
          loadYearlyFallback(calendarContainer, year, contributionHeader);
        }
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
        <span class="pinned-item-lang"><span class="lang-color" style="background-color:${langColor}"></span>${proj.lang}</span>
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
  if (checkbox.checked) { if (!pinnedProjectIds.includes(val)) pinnedProjectIds.push(val); }
  else { pinnedProjectIds = pinnedProjectIds.filter(id => id !== val); }
};
window.saveModalPins = function () { renderPinnedProjects(); closePinModal(); };
window.addEventListener('click', (event) => {
  const modal = document.getElementById('pin-modal');
  if (event.target == modal) window.closePinModal();
});
