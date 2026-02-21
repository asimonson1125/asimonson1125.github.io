// Use a global to track the interval and ensure we don't stack listeners
if (window.statusIntervalId) {
  clearInterval(window.statusIntervalId);
  window.statusIntervalId = null;
}

async function fetchStatus() {
  try {
    const response = await fetch('/api/status');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    updateStatusDisplay(data);
  } catch (error) {
    console.error('Error fetching status:', error);
    showError('Failed to fetch service status. Please try again later.');
  }
}

function updateStatusDisplay(data) {
  if (data.last_check) {
    const lastCheck = new Date(data.last_check);
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) lastUpdateEl.textContent = `Last checked: ${lastCheck.toLocaleString()}`;
  }

  if (data.next_check) {
    const nextCheckEl = document.getElementById('nextUpdate');
    if (nextCheckEl) {
      const nextCheck = new Date(data.next_check);
      nextCheckEl.textContent = `Next check: ${nextCheck.toLocaleString()}`;
    }
  }

  if (data.services) {
    data.services.forEach(function(service) {
      updateServiceCard(service);
    });
    updateOverallStatus(data.services);
  }

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Refresh Now';
  }
}

function getUptimeClass(value) {
  if (value === null) return 'text-muted';
  if (value >= 99) return 'text-excellent';
  if (value >= 95) return 'text-good';
  if (value >= 90) return 'text-fair';
  return 'text-poor';
}

function formatUptime(value, label) {
  const display = value !== null ? `${value}%` : '--';
  return `${label}: <strong class="${getUptimeClass(value)}">${display}</strong>`;
}

function updateServiceCard(service) {
  const card = document.getElementById(`status-${service.id}`);
  if (!card) return;

  const stateDot = card.querySelector('.state-dot');
  const stateText = card.querySelector('.state-text');
  const timeDisplay = document.getElementById(`time-${service.id}`);
  const codeDisplay = document.getElementById(`code-${service.id}`);
  const uptimeDisplay = document.getElementById(`uptime-${service.id}`);
  const checksDisplay = document.getElementById(`checks-${service.id}`);

  if (timeDisplay) timeDisplay.textContent = service.response_time !== null ? `${service.response_time}ms` : '--';

  if (codeDisplay) {
    if (service.status_code !== null) {
      codeDisplay.textContent = service.status_code;
    } else {
      codeDisplay.textContent = service.status === 'unknown' ? 'Unknown' : 'Error';
    }
  }

  card.classList.remove('online', 'degraded', 'offline', 'unknown');

  switch (service.status) {
    case 'online':
      if (stateDot) stateDot.className = 'state-dot online';
      if (stateText) stateText.textContent = 'Operational';
      card.classList.add('online');
      break;
    case 'degraded':
    case 'timeout':
      if (stateDot) stateDot.className = 'state-dot degraded';
      if (stateText) stateText.textContent = service.status === 'timeout' ? 'Timeout' : 'Degraded';
      card.classList.add('degraded');
      break;
    case 'offline':
      if (stateDot) stateDot.className = 'state-dot offline';
      if (stateText) stateText.textContent = 'Offline';
      card.classList.add('offline');
      break;
    default:
      if (stateDot) stateDot.className = 'state-dot loading';
      if (stateText) stateText.textContent = 'Unknown';
      card.classList.add('unknown');
  }

  if (uptimeDisplay && service.uptime) {
    uptimeDisplay.innerHTML = [
      formatUptime(service.uptime['24h'], '24h'),
      formatUptime(service.uptime['7d'], '7d'),
      formatUptime(service.uptime['30d'], '30d'),
      formatUptime(service.uptime.all_time, 'All'),
    ].join(' | ');
  }

  if (checksDisplay && service.total_checks !== undefined) {
    checksDisplay.textContent = service.total_checks;
  }
}

function updateOverallStatus(services) {
  const overallBar = document.getElementById('overallStatus');
  if (!overallBar) return;

  const icon = overallBar.querySelector('.summary-icon');
  const title = overallBar.querySelector('.summary-title');
  const subtitle = document.getElementById('summary-subtitle');
  const onlineCount = document.getElementById('onlineCount');
  const totalCount = document.getElementById('totalCount');

  const total = services.length;
  const online = services.filter(function(s) { return s.status === 'online'; }).length;
  const degraded = services.filter(function(s) { return s.status === 'degraded' || s.status === 'timeout'; }).length;
  const offline = services.filter(function(s) { return s.status === 'offline'; }).length;

  if (onlineCount) onlineCount.textContent = online;
  if (totalCount) totalCount.textContent = total;

  overallBar.classList.remove('online', 'degraded', 'offline');
  if (icon) icon.classList.remove('operational', 'partial', 'major', 'loading');

  // Determine overall status
  if (online === total) {
    overallBar.classList.add('online');
    if (icon) {
      icon.classList.add('operational');
      icon.textContent = '\u2713';
    }
    if (title) title.textContent = 'All Systems Operational';
    if (subtitle) subtitle.textContent = `All ${total} services are running normally`;
  } else if (offline >= Math.ceil(total / 2)) {
    overallBar.classList.add('offline');
    if (icon) {
      icon.classList.add('major');
      icon.textContent = '\u2715';
    }
    if (title) title.textContent = 'Major Outage';
    if (subtitle) subtitle.textContent = `${offline} service${offline !== 1 ? 's' : ''} offline, ${degraded} degraded`;
  } else if (offline > 0 || degraded > 0) {
    overallBar.classList.add('degraded');
    if (icon) {
      icon.classList.add('partial');
      icon.textContent = '\u26A0';
    }
    if (title) title.textContent = 'Partial Outage';
    if (subtitle) {
      if (offline > 0 && degraded > 0) {
        subtitle.textContent = `${offline} offline, ${degraded} degraded`;
      } else if (offline > 0) {
        subtitle.textContent = `${offline} service${offline !== 1 ? 's' : ''} offline`;
      } else {
        subtitle.textContent = `${degraded} service${degraded !== 1 ? 's' : ''} degraded`;
      }
    }
  } else {
    if (icon) {
      icon.classList.add('loading');
      icon.textContent = '\u25D0';
    }
    if (title) title.textContent = 'Status Unknown';
    if (subtitle) subtitle.textContent = 'Waiting for service data';
  }
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'status-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = 'background: rgba(244, 67, 54, 0.2); color: #f44336; padding: 1em; margin: 1em 0; border-radius: 0.5em; text-align: center;';

  const container = document.querySelector('.foregroundContent');
  if (container) {
    container.insertBefore(errorDiv, container.firstChild);
    setTimeout(function() { errorDiv.remove(); }, 5000);
  }
}

function refreshStatus() {
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Checking...';
  }
  fetchStatus();
}

function initStatusPage() {
  if (window.statusIntervalId) {
    clearInterval(window.statusIntervalId);
  }
  fetchStatus();
  window.statusIntervalId = setInterval(fetchStatus, 60000);
}

function cleanupStatusPage() {
  if (window.statusIntervalId) {
    clearInterval(window.statusIntervalId);
    window.statusIntervalId = null;
  }
  document.removeEventListener('beforenavigate', cleanupStatusPage);
}

document.addEventListener('beforenavigate', cleanupStatusPage);

if (document.getElementById('overallStatus')) {
  initStatusPage();
}
