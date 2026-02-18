let statusIntervalId = null;

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
    document.getElementById('lastUpdate').textContent = `Last checked: ${lastCheck.toLocaleString()}`;
  }

  if (data.next_check) {
    const nextCheckEl = document.getElementById('nextUpdate');
    if (nextCheckEl) {
      const nextCheck = new Date(data.next_check);
      nextCheckEl.textContent = `Next check: ${nextCheck.toLocaleString()}`;
    }
  }

  data.services.forEach(function(service) {
    updateServiceCard(service);
  });

  updateOverallStatus(data.services);

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

  timeDisplay.textContent = service.response_time !== null ? `${service.response_time}ms` : '--';

  if (service.status_code !== null) {
    codeDisplay.textContent = service.status_code;
  } else {
    codeDisplay.textContent = service.status === 'unknown' ? 'Unknown' : 'Error';
  }

  card.classList.remove('online', 'degraded', 'offline', 'unknown');

  switch (service.status) {
    case 'online':
      stateDot.className = 'state-dot online';
      stateText.textContent = 'Operational';
      card.classList.add('online');
      break;
    case 'degraded':
    case 'timeout':
      stateDot.className = 'state-dot degraded';
      stateText.textContent = service.status === 'timeout' ? 'Timeout' : 'Degraded';
      card.classList.add('degraded');
      break;
    case 'offline':
      stateDot.className = 'state-dot offline';
      stateText.textContent = 'Offline';
      card.classList.add('offline');
      break;
    default:
      stateDot.className = 'state-dot loading';
      stateText.textContent = 'Unknown';
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
  const icon = overallBar.querySelector('.summary-icon');
  const title = overallBar.querySelector('.summary-title');
  const subtitle = document.getElementById('summary-subtitle');
  const onlineCount = document.getElementById('onlineCount');
  const totalCount = document.getElementById('totalCount');

  const total = services.length;
  const online = services.filter(function(s) { return s.status === 'online'; }).length;
  const degraded = services.filter(function(s) { return s.status === 'degraded' || s.status === 'timeout'; }).length;
  const offline = services.filter(function(s) { return s.status === 'offline'; }).length;

  onlineCount.textContent = online;
  totalCount.textContent = total;

  overallBar.classList.remove('online', 'degraded', 'offline');
  icon.classList.remove('operational', 'partial', 'major', 'loading');

  // Determine overall status
  if (online === total) {
    // All systems operational
    overallBar.classList.add('online');
    icon.classList.add('operational');
    icon.textContent = '\u2713';
    title.textContent = 'All Systems Operational';
    subtitle.textContent = `All ${total} services are running normally`;
  } else if (offline >= Math.ceil(total / 2)) {
    // Major outage (50% or more offline)
    overallBar.classList.add('offline');
    icon.classList.add('major');
    icon.textContent = '\u2715';
    title.textContent = 'Major Outage';
    subtitle.textContent = `${offline} service${offline !== 1 ? 's' : ''} offline, ${degraded} degraded`;
  } else if (offline > 0 || degraded > 0) {
    // Partial outage
    overallBar.classList.add('degraded');
    icon.classList.add('partial');
    icon.textContent = '\u26A0';
    title.textContent = 'Partial Outage';
    if (offline > 0 && degraded > 0) {
      subtitle.textContent = `${offline} offline, ${degraded} degraded`;
    } else if (offline > 0) {
      subtitle.textContent = `${offline} service${offline !== 1 ? 's' : ''} offline`;
    } else {
      subtitle.textContent = `${degraded} service${degraded !== 1 ? 's' : ''} degraded`;
    }
  } else {
    // Unknown state
    icon.classList.add('loading');
    icon.textContent = '\u25D0';
    title.textContent = 'Status Unknown';
    subtitle.textContent = 'Waiting for service data';
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
  if (statusIntervalId !== null) {
    clearInterval(statusIntervalId);
  }
  fetchStatus();
  statusIntervalId = setInterval(fetchStatus, 60000);
}

// Clean up polling interval when navigating away via SPA
document.addEventListener('beforenavigate', function() {
  if (statusIntervalId !== null) {
    clearInterval(statusIntervalId);
    statusIntervalId = null;
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStatusPage);
} else {
  initStatusPage();
}
