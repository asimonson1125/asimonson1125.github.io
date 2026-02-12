// Fetch and display service status from API

/**
 * Fetch status data from server
 */
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

/**
 * Update the status display with fetched data
 */
function updateStatusDisplay(data) {
  // Update last check time
  if (data.last_check) {
    const lastCheck = new Date(data.last_check);
    const timeString = lastCheck.toLocaleString();
    document.getElementById('lastUpdate').textContent = `Last checked: ${timeString}`;
  }

  // Update next check time
  if (data.next_check) {
    const nextCheck = new Date(data.next_check);
    const timeString = nextCheck.toLocaleString();
    const nextCheckEl = document.getElementById('nextUpdate');
    if (nextCheckEl) {
      nextCheckEl.textContent = `Next check: ${timeString}`;
    }
  }

  // Update each service
  data.services.forEach(service => {
    updateServiceCard(service);
  });

  // Update overall status
  updateOverallStatus(data.services);

  // Re-enable refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Refresh Now';
  }
}

/**
 * Update a single service card
 */
function updateServiceCard(service) {
  const card = document.getElementById(`status-${service.id}`);
  if (!card) return;

  const statusDot = card.querySelector('.status-dot');
  const statusText = card.querySelector('.status-text');
  const timeDisplay = document.getElementById(`time-${service.id}`);
  const codeDisplay = document.getElementById(`code-${service.id}`);
  const uptimeDisplay = document.getElementById(`uptime-${service.id}`);
  const checksDisplay = document.getElementById(`checks-${service.id}`);

  // Update response time
  if (service.response_time !== null) {
    timeDisplay.textContent = `${service.response_time}ms`;
  } else {
    timeDisplay.textContent = '--';
  }

  // Update status code
  if (service.status_code !== null) {
    codeDisplay.textContent = service.status_code;
  } else {
    codeDisplay.textContent = service.status === 'unknown' ? 'Unknown' : 'Error';
  }

  // Update status indicator
  card.classList.remove('online', 'degraded', 'offline', 'unknown');

  switch (service.status) {
    case 'online':
      statusDot.className = 'status-dot online';
      statusText.textContent = 'Operational';
      card.classList.add('online');
      break;
    case 'degraded':
    case 'timeout':
      statusDot.className = 'status-dot degraded';
      statusText.textContent = service.status === 'timeout' ? 'Timeout' : 'Degraded';
      card.classList.add('degraded');
      break;
    case 'offline':
      statusDot.className = 'status-dot offline';
      statusText.textContent = 'Offline';
      card.classList.add('offline');
      break;
    default:
      statusDot.className = 'status-dot loading';
      statusText.textContent = 'Unknown';
      card.classList.add('unknown');
  }

  // Update uptime statistics
  if (uptimeDisplay && service.uptime) {
    const uptimeHTML = [];

    // Helper function to get color class based on uptime percentage
    const getUptimeClass = (value) => {
      if (value === null) return 'uptime-none';
      if (value >= 99) return 'uptime-excellent';
      if (value >= 95) return 'uptime-good';
      if (value >= 90) return 'uptime-fair';
      return 'uptime-poor';
    };

    // Helper function to format uptime value
    const formatUptime = (value, label) => {
      const display = value !== null ? `${value}%` : '--';
      const colorClass = getUptimeClass(value);
      return `${label}: <strong class="${colorClass}">${display}</strong>`;
    };

    // Add all uptime metrics
    uptimeHTML.push(formatUptime(service.uptime['24h'], '24h'));
    uptimeHTML.push(formatUptime(service.uptime['7d'], '7d'));
    uptimeHTML.push(formatUptime(service.uptime['30d'], '30d'));
    uptimeHTML.push(formatUptime(service.uptime.all_time, 'All'));

    uptimeDisplay.innerHTML = uptimeHTML.join(' | ');
  }

  // Update total checks
  if (checksDisplay && service.total_checks !== undefined) {
    checksDisplay.textContent = service.total_checks;
  }
}

/**
 * Update overall status bar
 */
function updateOverallStatus(services) {
  const overallBar = document.getElementById('overallStatus');
  const icon = overallBar.querySelector('.overall-status-icon');
  const title = overallBar.querySelector('.overall-status-title');
  const subtitle = document.getElementById('overall-status-subtitle');
  const onlineCount = document.getElementById('onlineCount');
  const totalCount = document.getElementById('totalCount');

  // Count service statuses
  const total = services.length;
  const online = services.filter(s => s.status === 'online').length;
  const degraded = services.filter(s => s.status === 'degraded' || s.status === 'timeout').length;
  const offline = services.filter(s => s.status === 'offline').length;

  // Update counts
  onlineCount.textContent = online;
  totalCount.textContent = total;

  // Remove all status classes (reuse status-card classes)
  overallBar.classList.remove('online', 'degraded', 'offline');
  icon.classList.remove('operational', 'partial', 'major', 'loading');

  // Determine overall status
  if (online === total) {
    // All systems operational
    overallBar.classList.add('online');
    icon.classList.add('operational');
    icon.textContent = '✓';
    title.textContent = 'All Systems Operational';
    subtitle.textContent = `All ${total} services are running normally`;
  } else if (offline >= Math.ceil(total / 2)) {
    // Major outage (50% or more offline)
    overallBar.classList.add('offline');
    icon.classList.add('major');
    icon.textContent = '✕';
    title.textContent = 'Major Outage';
    subtitle.textContent = `${offline} service${offline !== 1 ? 's' : ''} offline, ${degraded} degraded`;
  } else if (offline > 0 || degraded > 0) {
    // Partial outage
    overallBar.classList.add('degraded');
    icon.classList.add('partial');
    icon.textContent = '⚠';
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
    icon.textContent = '◐';
    title.textContent = 'Status Unknown';
    subtitle.textContent = 'Waiting for service data';
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'status-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = 'background: rgba(244, 67, 54, 0.2); color: #f44336; padding: 1em; margin: 1em 0; border-radius: 0.5em; text-align: center;';

  const container = document.querySelector('.foregroundContent');
  if (container) {
    container.insertBefore(errorDiv, container.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
  }
}

/**
 * Manual refresh
 */
function refreshStatus() {
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Checking...';
  }
  fetchStatus();
}

/**
 * Initialize on page load
 */
let statusIntervalId = null;

function initStatusPage() {
  // Clear any existing interval from a previous SPA navigation
  if (statusIntervalId !== null) {
    clearInterval(statusIntervalId);
  }
  fetchStatus();
  // Auto-refresh every 5 minutes to get latest data
  statusIntervalId = setInterval(fetchStatus, 300000);
}

// Start when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStatusPage);
} else {
  initStatusPage();
}
