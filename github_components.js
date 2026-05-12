// ═══════════════════════════════════════════════════════════════════
// github_components.js - Logic for Pinned Projects & Contributions
// ═══════════════════════════════════════════════════════════════════

const GITHUB_USERNAME = 'thippeswammy';
const CONTRIBUTIONS_API = `https://github-contributions-api.deno.dev/${GITHUB_USERNAME}.json`;
const START_YEAR = 2020; 

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
    .then(response => { if (!response.ok) throw new Error('API unreachable'); return response.json(); })
    .then(data => {
      renderCalendar(calendarContainer, data);
      window.addEventListener('resize', () => renderCalendar(calendarContainer, data));

      const contributionSub = document.querySelector('.gh-stat-label');
      const ghHeroHeader = document.querySelector('.gh-hero-header');
      const subLabel = ghHeroHeader ? ghHeroHeader.querySelector('div[style*="font-size: 14px"]') : null;

      if (contributionHeader) animateCountUp(contributionHeader, data.totalContributions || 0);

      if (data.contributions && data.contributions.length > 0) {
        const firstWeek = data.contributions[0], lastWeek = data.contributions[data.contributions.length - 1];
        const startDate = new Date(firstWeek[0].date), endDate = new Date(lastWeek[lastWeek.length - 1].date);
        const rangeText = `${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
        if (contributionSub) contributionSub.textContent = `contributions in the last year`;
        if (subLabel) subLabel.textContent = `Activity Period: ${rangeText} • Neural Sync Active`;
      }
      updateAnalytics(data);
    })
    .catch(err => {
      console.warn('GitHub API Error, using fallback:', err);
      const currentYear = new Date().getFullYear().toString();
      loadYearlyFallback(calendarContainer, currentYear, contributionHeader);
    });
}

function animateCountUp(el, target, suffix = '') {
  let count = 0;
  const duration = 1500;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutExpo = t => (t === 1) ? 1 : 1 - Math.pow(2, -10 * t);
    const current = Math.floor(easeOutExpo(progress) * target);
    el.textContent = `${current.toLocaleString()}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function renderCalendar(container, data) {
  if (!data || !data.contributions) return;
  
  // Adding a tiny deliberate delay for the "Neural Sync" aesthetic
  setTimeout(() => {
    container.classList.remove('loading-state');
    container.style.height = 'auto';
    container.style.minHeight = '0';
    container.innerHTML = '';

    const isMobile = window.innerWidth <= 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) { renderVerticalCalendar(container, data); return; }

    const calendarWrapper = document.createElement('div');
    calendarWrapper.className = 'calendar-wrapper';
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'scroll-container';
    const innerScroll = document.createElement('div');
    innerScroll.style.cssText = 'padding: 0 5px; min-width: 800px;';

    const totalWeeks = data.contributions.length;
    const masterGrid = document.createElement('div');
    masterGrid.style.cssText = `display: grid; grid-template-columns: 30px repeat(${totalWeeks}, 11px); grid-template-rows: 15px repeat(7, 11px); column-gap: 3px; row-gap: 3px; align-items: center;`;

    const levelMap = { 'NONE': '0', 'FIRST_QUARTILE': '1', 'SECOND_QUARTILE': '2', 'THIRD_QUARTILE': '3', 'FOURTH_QUARTILE': '4' };
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;

    const dayConfig = [{ label: 'Mon', row: 3 }, { label: 'Wed', row: 5 }, { label: 'Fri', row: 7 }];
    dayConfig.forEach(cfg => {
      const span = document.createElement('span');
      span.textContent = cfg.label;
      span.style.cssText = `grid-column: 1; grid-row: ${cfg.row}; font-size: 9px; color: var(--text-muted); align-self: center; padding-right: 4px;`;
      masterGrid.appendChild(span);
    });

    data.contributions.forEach((week, weekIdx) => {
      const colIdx = weekIdx + 2, monthIdx = new Date(week[0].date).getMonth();
      if (monthIdx !== lastMonth) {
        const mLabel = document.createElement('span');
        mLabel.textContent = monthNames[monthIdx];
        mLabel.style.cssText = `grid-row: 1; grid-column: ${colIdx}; font-size: 10px; color: var(--text-muted); white-space: nowrap;`;
        masterGrid.appendChild(mLabel);
        lastMonth = monthIdx;
      }
      week.forEach((day, dayIdx) => {
        const dayRect = document.createElement('div');
        dayRect.className = 'ContributionCalendar-day';
        dayRect.style.cssText = `grid-row: ${dayIdx + 2}; grid-column: ${colIdx}; width: 11px; height: 11px; border-radius: 2px;`;
        dayRect.setAttribute('data-level', levelMap[day.contributionLevel] || '0');
        dayRect.setAttribute('data-date', day.date);
        dayRect.setAttribute('data-count', day.contributionCount);
        masterGrid.appendChild(dayRect);
      });
    });

    innerScroll.appendChild(masterGrid);
    scrollContainer.appendChild(innerScroll);
    calendarWrapper.appendChild(scrollContainer);
    container.appendChild(calendarWrapper);
    setupCustomTooltips(container);
  }, 400); 
}

function renderVerticalCalendar(container, data) {
  const flatDays = data.contributions.flat();
  const levelMap = { 'NONE': '0', 'FIRST_QUARTILE': '1', 'SECOND_QUARTILE': '2', 'THIRD_QUARTILE': '3', 'FOURTH_QUARTILE': '4' };
  const calendarWrapper = document.createElement('div');
  calendarWrapper.className = 'gh-calendar-vertical-rotated';
  const grid = document.createElement('div');
  grid.className = 'gh-rotated-grid';
  grid.style.cssText = `display: grid; grid-template-columns: 45px repeat(7, 1fr) 12px repeat(7, 1fr); gap: 3px; align-items: center;`;
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const headerLabels = ['Month', ...dayLabels, '', ...dayLabels];
  headerLabels.forEach((label, idx) => {
    if (idx === 8) return; 
    const span = document.createElement('div');
    span.textContent = label;
    span.style.cssText = `text-align: center; font-size: 9px; color: var(--text-muted); padding-bottom: 8px; font-weight: 700; grid-row: 1; grid-column: ${idx + 1};`;
    grid.appendChild(span);
  });
  let currentMonth = -1, currentRow = 2, weeks = [], currentWeek = [];
  flatDays.forEach((day) => {
    const dDate = new Date(day.date), dayOfWeek = dDate.getDay();
    if (dayOfWeek === 0 && currentWeek.length > 0) { weeks.push(currentWeek); currentWeek = []; }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);
  for (let i = 0; i < weeks.length; i += 2) {
    const week1 = weeks[i], week2 = weeks[i + 1] || [];
    let monthToLabel = '';
    [...week1, ...week2].forEach(day => {
      const dDate = new Date(day.date);
      if (dDate.getMonth() !== currentMonth) { currentMonth = dDate.getMonth(); monthToLabel = dDate.toLocaleDateString('en-US', { month: 'short' }); }
    });
    if (monthToLabel) {
      const mLabel = document.createElement('div');
      mLabel.textContent = monthToLabel;
      mLabel.style.cssText = `grid-column: 1; grid-row: ${currentRow}; font-size: 10px; font-weight: 800; color: var(--text-muted); text-align: left; padding-right: 4px;`;
      grid.appendChild(mLabel);
    }
    const divider = document.createElement('div');
    divider.style.cssText = `grid-column: 9; grid-row: ${currentRow}; width: 1px; height: 60%; background: rgba(255,255,255,0.1); justify-self: center;`;
    grid.appendChild(divider);
    week1.forEach(day => {
      const dDate = new Date(day.date), dayOfWeek = dDate.getDay(), dayRect = document.createElement('div');
      dayRect.className = 'ContributionCalendar-day'; dayRect.setAttribute('data-level', levelMap[day.contributionLevel] || '0'); dayRect.setAttribute('data-date', day.date); dayRect.setAttribute('data-count', day.contributionCount);
      dayRect.style.cssText = `grid-row: ${currentRow}; grid-column: ${dayOfWeek + 2}; width: 100%; aspect-ratio: 1; border-radius: 2px;`;
      grid.appendChild(dayRect);
    });
    week2.forEach(day => {
      const dDate = new Date(day.date), dayOfWeek = dDate.getDay(), dayRect = document.createElement('div');
      dayRect.className = 'ContributionCalendar-day'; dayRect.setAttribute('data-level', levelMap[day.contributionLevel] || '0'); dayRect.setAttribute('data-date', day.date); dayRect.setAttribute('data-count', day.contributionCount);
      dayRect.style.cssText = `grid-row: ${currentRow}; grid-column: ${dayOfWeek + 10}; width: 100%; aspect-ratio: 1; border-radius: 2px;`;
      grid.appendChild(dayRect);
    });
    currentRow++;
  }
  calendarWrapper.appendChild(grid);
  container.appendChild(calendarWrapper);
  setupCustomTooltips(container);
}

function setupCustomTooltips(container) {
  let tooltip = document.getElementById('github-native-tooltip');
  if (!tooltip) { tooltip = document.createElement('div'); tooltip.id = 'github-native-tooltip'; document.body.appendChild(tooltip); }
  const handleInteraction = (e) => {
    const dayEl = e.target.closest('.ContributionCalendar-day');
    if (dayEl) {
      const date = dayEl.getAttribute('data-date'), count = dayEl.getAttribute('data-count');
      if (date) {
        const dDate = new Date(date), formattedDate = dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const textCount = (!count || count === '0') ? 'No contributions' : `${count} contribution${count === '1' ? '' : 's'}`;
        tooltip.innerHTML = `<div style="font-weight:700; color:#fff; margin-bottom:4px;">${textCount}</div><div style="color:var(--text-muted); font-size:11px;">on ${formattedDate}</div>`;
        tooltip.style.display = 'block';
        const rect = tooltip.getBoundingClientRect(), x = e.pageX || e.touches[0].pageX, y = e.pageY || e.touches[0].pageY;
        tooltip.style.left = `${x - (rect.width / 2)}px`; tooltip.style.top = `${y - rect.height - 15}px`;
      }
    } else { tooltip.style.display = 'none'; }
  };
  container.addEventListener('mousemove', handleInteraction);
  container.addEventListener('mouseleave', () => tooltip.style.display = 'none');
  container.addEventListener('touchstart', handleInteraction, { passive: true });
}

function loadYearlyFallback(container, year, header) {
  const fromDate = `${year}-01-01`, toDate = `${year}-12-31`, apiURL = `https://github-contributions-api.deno.dev/${GITHUB_USERNAME}.json?from=${fromDate}&to=${toDate}`;
  fetch(apiURL).then(r => r.json()).then(data => {
    renderCalendar(container, data);
    if (header) animateCountUp(header, data.totalContributions || 0);
    updateAnalytics(data);
  }).catch(() => {
    fetch(`./contributions/contributions_${year}.html`).then(r => r.text()).then(html => {
      const stats = extractStatsFromHTML(html);
      renderCalendar(container, stats);
      if (header) animateCountUp(header, stats.totalContributions);
      updateAnalytics(stats);
    });
  });
}

function extractStatsFromHTML(html) {
  const tempDiv = document.createElement('div'); tempDiv.innerHTML = html;
  let total = 0; const h2 = tempDiv.querySelector('h2');
  if (h2) { const m = h2.textContent.replace(/,/g, '').match(/(\d+)/); if (m) total = parseInt(m[1]); }
  const dayEls = tempDiv.querySelectorAll('.ContributionCalendar-day'), contributions = [];
  dayEls.forEach(el => {
    const date = el.getAttribute('data-date'); if (!date) return;
    let count = 0; const level = parseInt(el.getAttribute('data-level') || '0');
    if (level > 0) { const levelMap = { 1: 1, 2: 5, 3: 15, 4: 30 }; count = levelMap[level] || 1; }
    contributions.push({ date, contributionCount: count, contributionLevel: el.getAttribute('data-level') });
  });
  return { totalContributions: total, contributions };
}

function updateAnalytics(data) {
  const container = document.getElementById('gh-analytics'); if (!container) return;
  const flatDays = Array.isArray(data.contributions[0]) ? data.contributions.flat() : data.contributions;
  let longestStreak = 0, currentStreak = 0, maxDay = { count: 0, date: '' };
  flatDays.forEach(day => {
    if (day.contributionCount > 0) { currentStreak++; if (currentStreak > longestStreak) longestStreak = currentStreak; if (day.contributionCount > maxDay.count) maxDay = { count: day.contributionCount, date: day.date }; }
    else { currentStreak = 0; }
  });
  container.innerHTML = `
    <div class="gh-analytics-grid">
      <div class="gh-analytic-card"><div class="gh-analytic-glow"></div><span class="label">Longest Streak</span><span class="value" id="stat-streak">0 Days</span></div>
      <div class="gh-analytic-card"><div class="gh-analytic-glow"></div><span class="label">Most Active Day</span><span class="value" id="stat-max">0 Commits</span></div>
      <div class="gh-analytic-card"><div class="gh-analytic-glow"></div><span class="label">Neural Connectivity</span><span class="value">98.4%</span></div>
      <div class="gh-analytic-card status-card"><div class="gh-analytic-glow"></div><span class="label">Status</span><span class="value">Neural Sync Active</span></div>
    </div>`;
  
  const streakEl = document.getElementById('stat-streak'), maxEl = document.getElementById('stat-max');
  if (streakEl) animateCountUp(streakEl, longestStreak, ' Days');
  if (maxEl) animateCountUp(maxEl, maxDay.count, ' Commits');
}

function generateYearList() {
  const container = document.querySelector('.year-list'); if (!container) return;
  const currentYear = new Date().getFullYear();
  let html = '';
  for (let year = currentYear; year >= START_YEAR; year--) {
    const isActive = year === currentYear ? 'active' : '';
    html += `<li class="year-item ${isActive}"><span class="year-dot"></span><a href="#" class="${isActive}">${year}</a></li>`;
  }
  container.innerHTML = html;
  const sidebar = document.querySelector('.contributions-sidebar');
  if (sidebar && !document.querySelector('.gh-year-selector-mobile')) {
    const mobileSelector = document.createElement('div'); mobileSelector.className = 'gh-year-selector-mobile';
    mobileSelector.innerHTML = `<button class="year-nav-btn prev">❮</button><div class="year-display-wrapper"><span class="current-year-display">${currentYear}</span><span class="year-label">SELECT YEAR</span></div><button class="year-nav-btn next" disabled>❯</button>`;
    sidebar.insertBefore(mobileSelector, container);
    initYearToggle(currentYear);
  }
  initYearLinks();
}

function initYearToggle(initialYear) {
  const prevBtn = document.querySelector('.year-nav-btn.prev'), nextBtn = document.querySelector('.year-nav-btn.next'), display = document.querySelector('.current-year-display');
  if (!prevBtn || !nextBtn || !display) return;
  let currentYear = parseInt(initialYear);
  const updateYear = (newYear) => {
    currentYear = newYear; display.textContent = currentYear;
    prevBtn.disabled = currentYear <= START_YEAR; nextBtn.disabled = currentYear >= new Date().getFullYear();
    const calendarContainer = document.querySelector('.calendar'), contributionHeader = document.querySelector('.gh-stat-number'), contributionSub = document.querySelector('.gh-stat-label');
    if (calendarContainer) {
      calendarContainer.classList.add('loading-state');
      if (contributionSub) contributionSub.textContent = currentYear.toString() === new Date().getFullYear().toString() ? 'contributions in the last year' : `contributions in ${currentYear}`;
      loadYearlyFallback(calendarContainer, currentYear.toString(), contributionHeader);
    }
    document.querySelectorAll('.year-item').forEach(item => {
      const year = item.querySelector('a').textContent.trim();
      if (year === currentYear.toString()) { item.classList.add('active'); item.querySelector('a').classList.add('active'); }
      else { item.classList.remove('active'); item.querySelector('a').classList.remove('active'); }
    });
  };
  prevBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); updateYear(currentYear - 1); });
  nextBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); updateYear(currentYear + 1); });
}

function initYearLinks() {
  const yearLinks = document.querySelectorAll('.year-list a'), currentYearStr = new Date().getFullYear().toString();
  yearLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const year = link.textContent.trim(), calendarContainer = document.querySelector('.calendar'), contributionHeader = document.querySelector('.gh-stat-number'), contributionSub = document.querySelector('.gh-stat-label'), mobileYearDisplay = document.querySelector('.current-year-display');
      document.querySelectorAll('.year-item').forEach(item => { item.classList.remove('active'); item.querySelector('a').classList.remove('active'); });
      link.closest('.year-item').classList.add('active'); link.classList.add('active');
      if (calendarContainer) {
        calendarContainer.classList.add('loading-state');
        if (contributionSub) contributionSub.textContent = year === currentYearStr ? 'contributions in the last year' : `contributions in ${year}`;
        if (mobileYearDisplay) mobileYearDisplay.textContent = year;
        const prevBtn = document.querySelector('.year-nav-btn.prev'), nextBtn = document.querySelector('.year-nav-btn.next');
        if (prevBtn && nextBtn) { const yInt = parseInt(year); prevBtn.disabled = yInt <= START_YEAR; nextBtn.disabled = yInt >= parseInt(currentYearStr); }
        if (year === currentYearStr) initGitHubCalendar(); else loadYearlyFallback(calendarContainer, year, contributionHeader);
      }
    });
  });
}

function initPinnedProjects() {
  let pinnedProjectIds = window.PINNED_PROJECTS || [];
  renderPinnedProjects(pinnedProjectIds);
  const container = document.getElementById('github-pinned-container');
  if (container && typeof Sortable !== 'undefined') {
    new Sortable(container, {
      animation: 150, ghostClass: 'sortable-ghost',
      delay: window.innerWidth <= 1024 ? 200 : 0, delayOnTouchOnly: true,
      onEnd: function () { pinnedProjectIds = Array.from(container.querySelectorAll('.pinned-item')).map(el => el.dataset.id); },
    });
  }
}

function renderPinnedProjects(pinnedProjectIds) {
  const container = document.getElementById('github-pinned-container'); if (!container) return;
  container.innerHTML = '';
  pinnedProjectIds.forEach(id => {
    const proj = window.PROJECTS.find(p => p.id === id); if (!proj) return;
    let langColor = '#8b949e'; if (proj.lang === 'C++') langColor = '#f34b7d'; else if (proj.lang === 'Python') langColor = '#3572A5';
    const card = document.createElement('div'); card.className = 'pinned-item'; card.dataset.id = proj.id;
    card.innerHTML = `<div class="pinned-item-header"><div class="pinned-item-title-wrapper"><svg class="octicon" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path></svg><a href="${proj.github}" target="_blank" class="pinned-item-title">${proj.name}</a></div><span class="pinned-item-badge">${proj.isPrivate ? 'Private' : 'Public'}</span></div><p class="pinned-item-desc">${proj.summary}</p><div class="pinned-item-meta"><span class="pinned-item-lang"><span class="lang-color" style="background-color:${langColor}"></span>${proj.lang}</span></div>`;
    container.appendChild(card);
  });
}
window.openPinModal = function () {
  const modal = document.getElementById('pin-modal'), listContainer = document.getElementById('pin-modal-list');
  if (!modal || !listContainer) return;
  listContainer.innerHTML = '';
  window.PROJECTS.forEach(proj => {
    const item = document.createElement('div'); item.className = 'pin-checkbox-item';
    item.innerHTML = `<input type="checkbox" id="pin-check-${proj.id}" value="${proj.id}" ${window.PINNED_PROJECTS.includes(proj.id) ? 'checked' : ''} onchange="window.toggleModalPin(this)"><label class="pin-checkbox-label" for="pin-check-${proj.id}"><span class="pin-checkbox-title">${proj.name}</span><span class="pin-checkbox-desc">${proj.summary}</span></label>`;
    listContainer.appendChild(item);
  });
  modal.classList.add('active'); document.body.classList.add('modal-open');
};
window.closePinModal = function () { const modal = document.getElementById('pin-modal'); if (modal) modal.classList.remove('active'); document.body.classList.remove('modal-open'); };
window.toggleModalPin = function (checkbox) {
  const val = checkbox.value;
  if (checkbox.checked) { if (!window.PINNED_PROJECTS.includes(val)) window.PINNED_PROJECTS.push(val); }
  else { window.PINNED_PROJECTS = window.PINNED_PROJECTS.filter(id => id !== val); }
};
window.saveModalPins = function () { renderPinnedProjects(window.PINNED_PROJECTS); closePinModal(); };
window.addEventListener('click', (e) => { if (e.target.id === 'pin-modal') window.closePinModal(); });
