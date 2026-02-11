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

    if (service.uptime['24h'] !== null) {
      uptimeHTML.push(`24h: <strong>${service.uptime['24h']}%</strong>`);
    }
    if (service.uptime['7d'] !== null) {
      uptimeHTML.push(`7d: <strong>${service.uptime['7d']}%</strong>`);
    }
    if (service.uptime['30d'] !== null) {
      uptimeHTML.push(`30d: <strong>${service.uptime['30d']}%</strong>`);
    }
    if (service.uptime.all_time !== null) {
      uptimeHTML.push(`All: <strong>${service.uptime.all_time}%</strong>`);
    }

    if (uptimeHTML.length > 0) {
      uptimeDisplay.innerHTML = uptimeHTML.join(' | ');
    } else {
      uptimeDisplay.textContent = 'No data yet';
    }
  }

  // Update total checks
  if (checksDisplay && service.total_checks !== undefined) {
    checksDisplay.textContent = service.total_checks;
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
function initStatusPage() {
  fetchStatus();
  // Auto-refresh every 5 minutes to get latest data
  setInterval(fetchStatus, 300000);
}

// Start when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStatusPage);
} else {
  initStatusPage();
}
