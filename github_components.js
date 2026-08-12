// ═══════════════════════════════════════════════════════════════════
// github_components.js - Logic for Pinned Projects & Contributions
// ═══════════════════════════════════════════════════════════════════

const GITHUB_USERNAME = 'thippeswammy';
const CONTRIBUTIONS_API = `https://corsproxy.io/?https://github-contributions.vercel.app/api/v1/${GITHUB_USERNAME}`;
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
      // Normalize and slice for the "last year" (last 371 days ending on today/most recent day)
      const normalizedData = normalizeContributionsForLastYear(data);
      if (!normalizedData) throw new Error('Normalization failed');

      renderCalendar(calendarContainer, normalizedData);
      window.addEventListener('resize', () => renderCalendar(calendarContainer, normalizedData));

      const contributionSub = document.querySelector('.gh-stat-label');
      const ghHeroHeader = document.querySelector('.gh-hero-header');
      const subLabel = ghHeroHeader ? ghHeroHeader.querySelector('div[style*="font-size: 14px"]') : null;

      if (contributionHeader) animateCountUp(contributionHeader, normalizedData.totalContributions || 0);

      if (normalizedData.contributions && normalizedData.contributions.length > 0) {
        const weeks = normalizedData.contributions;
        const firstWeek = weeks[0], lastWeek = weeks[weeks.length - 1];

        // Find first valid day
        const firstDay = firstWeek.find(d => !d.isEmptyPlaceholder) || firstWeek[0];
        // Find last valid day
        const lastDay = [...lastWeek].reverse().find(d => !d.isEmptyPlaceholder) || lastWeek[lastWeek.length - 1];

        const startDate = new Date(firstDay.date), endDate = new Date(lastDay.date);
        const rangeText = `${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
        if (contributionSub) contributionSub.textContent = `contributions in the last year`;
        if (subLabel) subLabel.textContent = `Activity Period: ${rangeText} • Neural Sync Active`;
      }
      updateAnalytics(normalizedData);
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

function normalizeDay(day) {
  if (!day || !day.date) return null;

  let count = 0;
  if (day.count !== undefined) {
    count = day.count;
  } else if (day.contributionCount !== undefined) {
    count = day.contributionCount;
  }

  let level = '0';
  if (day.level !== undefined) {
    level = String(day.level);
  } else if (day.intensity !== undefined) {
    level = String(day.intensity);
  } else if (day.contributionLevel !== undefined) {
    const levelMap = { 'NONE': '0', 'FIRST_QUARTILE': '1', 'SECOND_QUARTILE': '2', 'THIRD_QUARTILE': '3', 'FOURTH_QUARTILE': '4' };
    level = levelMap[day.contributionLevel] || String(day.contributionLevel);
  } else if (day.level !== undefined) {
    level = String(day.level);
  }

  return {
    date: day.date,
    contributionCount: parseInt(count || 0, 10),
    contributionLevel: level
  };
}

function groupDaysIntoWeeks(flatDays) {
  // Sort days chronologically
  flatDays.sort((a, b) => a.date.localeCompare(b.date));

  const weeks = [];
  let currentWeek = [];

  flatDays.forEach(day => {
    const dateObj = new Date(day.date + 'T00:00:00'); // avoid timezone shifts
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday

    // If it's Sunday and we already have days in currentWeek, push currentWeek and start a new one
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    // Pad the very first week if it doesn't start on Sunday
    if (weeks.length === 0 && currentWeek.length === 0 && dayOfWeek > 0) {
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({
          date: '',
          contributionCount: 0,
          contributionLevel: '0',
          isEmptyPlaceholder: true
        });
      }
    }

    currentWeek.push(day);
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: '',
        contributionCount: 0,
        contributionLevel: '0',
        isEmptyPlaceholder: true
      });
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

function normalizeContributions(data) {
  if (!data || !data.contributions) return null;

  let flatDays = [];
  const is2D = Array.isArray(data.contributions[0]);

  if (is2D) {
    flatDays = data.contributions.flat();
  } else {
    flatDays = data.contributions;
  }

  const normalizedDays = flatDays.map(normalizeDay).filter(Boolean);
  const groupedWeeks = groupDaysIntoWeeks(normalizedDays);

  const total = data.totalContributions !== undefined ? data.totalContributions :
                (data.total !== undefined && typeof data.total === 'number' ? data.total :
                normalizedDays.reduce((sum, d) => sum + d.contributionCount, 0));

  return {
    totalContributions: total,
    contributions: groupedWeeks
  };
}

function normalizeContributionsForLastYear(data) {
  if (!data || !data.contributions) return null;

  const flatDays = Array.isArray(data.contributions[0]) ? data.contributions.flat() : data.contributions;
  const normalizedDays = flatDays.map(normalizeDay).filter(Boolean);

  // Sort chronologically
  normalizedDays.sort((a, b) => a.date.localeCompare(b.date));

  // Filter out any future dates beyond today to align with GitHub's current calendar
  const todayStr = new Date().toISOString().split('T')[0];
  const pastAndPresentDays = normalizedDays.filter(day => day.date <= todayStr);

  // Take the last 371 days (approx 53 weeks)
  const lastYearDays = pastAndPresentDays.slice(-371);
  const groupedWeeks = groupDaysIntoWeeks(lastYearDays);

  const total = lastYearDays.reduce((sum, d) => sum + d.contributionCount, 0);

  return {
    totalContributions: total,
    contributions: groupedWeeks
  };
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
      const colIdx = weekIdx + 2;

      // Find first non-placeholder day in this week to label the month
      const firstValidDay = week.find(d => !d.isEmptyPlaceholder);
      if (firstValidDay) {
        const monthIdx = new Date(firstValidDay.date + 'T00:00:00').getMonth();
        if (monthIdx !== lastMonth) {
          const mLabel = document.createElement('span');
          mLabel.textContent = monthNames[monthIdx];
          mLabel.style.cssText = `grid-row: 1; grid-column: ${colIdx}; font-size: 10px; color: var(--text-muted); white-space: nowrap;`;
          masterGrid.appendChild(mLabel);
          lastMonth = monthIdx;
        }
      }

      week.forEach((day, dayIdx) => {
        const dayRect = document.createElement('div');
        dayRect.className = 'ContributionCalendar-day';
        dayRect.style.cssText = `grid-row: ${dayIdx + 2}; grid-column: ${colIdx}; width: 11px; height: 11px; border-radius: 2px;`;

        if (day.isEmptyPlaceholder) {
          dayRect.style.visibility = 'hidden';
        } else {
          dayRect.setAttribute('data-level', day.contributionLevel || '0');
          dayRect.setAttribute('data-date', day.date);
          dayRect.setAttribute('data-count', day.contributionCount);
        }
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
  // Filter out placeholders for vertical rotated list
  const flatDays = data.contributions.flat().filter(d => !d.isEmptyPlaceholder);

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
    const dDate = new Date(day.date + 'T00:00:00'), dayOfWeek = dDate.getDay();
    if (dayOfWeek === 0 && currentWeek.length > 0) { weeks.push(currentWeek); currentWeek = []; }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);
  for (let i = 0; i < weeks.length; i += 2) {
    const week1 = weeks[i], week2 = weeks[i + 1] || [];
    let monthToLabel = '';
    [...week1, ...week2].forEach(day => {
      const dDate = new Date(day.date + 'T00:00:00');
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
      const dDate = new Date(day.date + 'T00:00:00'), dayOfWeek = dDate.getDay(), dayRect = document.createElement('div');
      dayRect.className = 'ContributionCalendar-day'; dayRect.setAttribute('data-level', day.contributionLevel || '0'); dayRect.setAttribute('data-date', day.date); dayRect.setAttribute('data-count', day.contributionCount);
      dayRect.style.cssText = `grid-row: ${currentRow}; grid-column: ${dayOfWeek + 2}; width: 100%; aspect-ratio: 1; border-radius: 2px;`;
      grid.appendChild(dayRect);
    });
    week2.forEach(day => {
      const dDate = new Date(day.date + 'T00:00:00'), dayOfWeek = dDate.getDay(), dayRect = document.createElement('div');
      dayRect.className = 'ContributionCalendar-day'; dayRect.setAttribute('data-level', day.contributionLevel || '0'); dayRect.setAttribute('data-date', day.date); dayRect.setAttribute('data-count', day.contributionCount);
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
        const dDate = new Date(date + 'T00:00:00'), formattedDate = dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const textCount = (!count || count === '0') ? 'No contributions' : `${count} contribution${count === '1' ? '' : 's'}`;
        tooltip.innerHTML = `<div style="font-weight:700; color:#fff; margin-bottom:4px;">${textCount}</div><div style="color:var(--text-muted); font-size:11px;">on ${formattedDate}</div>`;
        tooltip.style.display = 'block';
        const rect = tooltip.getBoundingClientRect(), x = (e.pageX || e.touches[0].pageX), y = (e.pageY || e.touches[0].pageY);
        tooltip.style.left = `${x - (rect.width / 2)}px`; tooltip.style.top = `${y - rect.height - 15}px`;
      }
    } else { tooltip.style.display = 'none'; }
  };
  container.addEventListener('mousemove', handleInteraction);
  container.addEventListener('mouseleave', () => tooltip.style.display = 'none');
  container.addEventListener('touchstart', handleInteraction, { passive: true });
}

function loadYearlyFallback(container, year, header) {
  const fromDate = `${year}-01-01`, toDate = `${year}-12-31`, apiURL = `https://corsproxy.io/?https://github-contributions.vercel.app/api/v1/${GITHUB_USERNAME}`;
  fetch(apiURL)
    .then(r => r.json())
    .then(data => {
      // Filter contributions for this specific year
      const yearContributions = data.contributions.filter(day => day.date.startsWith(year));

      // Get total count for the selected year
      let total;
      if (data.total && typeof data.total === 'object' && data.total[year] !== undefined) {
        total = data.total[year];
      } else if (data.years) {
        const yearTotalObj = data.years.find(y => y.year === year);
        total = yearTotalObj ? yearTotalObj.total : yearContributions.reduce((sum, d) => sum + (d.count || d.contributionCount || 0), 0);
      } else {
        total = yearContributions.reduce((sum, d) => sum + (d.count || d.contributionCount || 0), 0);
      }

      const stats = normalizeContributions({
        totalContributions: total,
        contributions: yearContributions
      });

      renderCalendar(container, stats);
      if (header) animateCountUp(header, stats.totalContributions || 0);
      updateAnalytics(stats);
    })
    .catch(() => {
      fetch(`./contributions/contributions_${year}.html`)
        .then(r => r.text())
        .then(html => {
          const stats = extractStatsFromHTML(html);
          const normalizedData = normalizeContributions(stats);
          renderCalendar(container, normalizedData);
          if (header) animateCountUp(header, normalizedData.totalContributions);
          updateAnalytics(normalizedData);
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
  const flatDays = data.contributions.flat().filter(d => !d.isEmptyPlaceholder);
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
  
  const isGrouped = window.currentViewMode === 'grouped';
  
  pinnedProjectIds.forEach(id => {
    // Try to find in window.MASTER_PROJECTS if grouped, EXCEPT if it's games/research/mobile
    let proj = null;
    let isMaster = false;
    
    if (isGrouped) {
      proj = window.MASTER_PROJECTS.find(p => p.id === id);
      if (proj) {
        if (['games', 'research', 'mobile'].includes(proj.cluster)) {
          // If it falls under these clusters, we want individual repository pins!
          proj = null; 
        } else {
          isMaster = true;
        }
      }
    }
    
    if (!proj) {
      proj = window.PROJECTS.find(p => p.id === id);
      isMaster = false;
    }
    
    if (!proj) return;
    
    let langColor = '#8b949e';
    if (proj.lang === 'C++') langColor = '#f34b7d';
    else if (proj.lang === 'Python') langColor = '#3572A5';
    else if (proj.lang === 'Java') langColor = '#b07219';
    else if (proj.lang === 'C#') langColor = '#178600';
    else if (proj.lang === 'MATLAB') langColor = '#e16737';
    else if (proj.lang === 'ROS 2') langColor = '#22d3ee';
    else if (proj.lang === 'JavaScript') langColor = '#f1e05a';
    else if (proj.lang === 'Arduino') langColor = '#bd79d1';
    
    const card = document.createElement('div'); card.className = 'pinned-item'; card.dataset.id = proj.id;
    
    // In grouped mode, list number of child repositories
    let metaText = proj.lang || '';
    if (isMaster && proj.repositories) {
      metaText = `${proj.repositories.length} repos`;
    }
    
    let metaHtml = '';
    if (metaText) {
      metaHtml = `<span class="pinned-item-lang">${proj.lang ? `<span class="lang-color" style="background-color:${langColor}"></span>` : ''}${metaText}</span>`;
    }
    
    card.innerHTML = `<div class="pinned-item-header"><div class="pinned-item-title-wrapper"><svg class="octicon" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path></svg><a href="${proj.github}" target="_blank" class="pinned-item-title">${proj.name}</a></div><span class="pinned-item-badge">${proj.isPrivate ? 'Private' : 'Public'}</span></div><p class="pinned-item-desc">${proj.tagline || proj.summary}</p><div class="pinned-item-meta">${metaHtml}</div>`;
    container.appendChild(card);
  });
}
window.openPinModal = function () {
  const modal = document.getElementById('pin-modal'), listContainer = document.getElementById('pin-modal-list');
  if (!modal || !listContainer) return;
  listContainer.innerHTML = '';
  
  const projectsSource = [];
  if (window.currentViewMode === 'repos') {
    projectsSource.push(...window.PROJECTS);
  } else {
    // Grouped mode: master projects for standard clusters, individual projects for games, research, mobile
    window.MASTER_PROJECTS.forEach(proj => {
      if (!['games', 'research', 'mobile'].includes(proj.cluster)) {
        projectsSource.push(proj);
      }
    });
    window.PROJECTS.forEach(proj => {
      if (['games', 'research', 'mobile'].includes(proj.cluster)) {
        projectsSource.push(proj);
      }
    });
  }
  
  projectsSource.forEach(proj => {
    if (proj.hidden || proj.isHidden) return;
    const item = document.createElement('div'); item.className = 'pin-checkbox-item';
    item.innerHTML = `<input type="checkbox" id="pin-check-${proj.id}" value="${proj.id}" ${window.PINNED_PROJECTS.includes(proj.id) ? 'checked' : ''} onchange="window.toggleModalPin(this)"><label class="pin-checkbox-label" for="pin-check-${proj.id}"><span class="pin-checkbox-title">${proj.name}</span><span class="pin-checkbox-desc">${proj.tagline || proj.summary}</span></label>`;
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
