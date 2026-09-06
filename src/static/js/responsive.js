function toggleMenu(collapse) {
  const header = document.getElementById("siteHeader");
  const btn = document.getElementById("menu");
  if (!header) return;
  const open = collapse ? false : !header.classList.contains("open");
  header.classList.toggle("open", open);
  if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
}

function markCurrentPage(location) {
  document.querySelectorAll(".site-nav a[data-page]").forEach(function (link) {
    if (link.dataset.page === location) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

async function goto(location, { push = true, hash = "" } = {}) {
  const loadingBar = document.getElementById('loading-bar');
  
  if (loadingBar) {
    loadingBar.style.width = ''; // Clear inline style from previous run
  }

  let loadingTimeout = setTimeout(() => {
    if (loadingBar) {
      loadingBar.classList.remove('finish');
      loadingBar.classList.add('active');
      loadingBar.classList.add('visible');
    }
  }, 150);

  try {
    const response = await fetch("/api/goto/" + location, {
      credentials: "include",
      method: "GET",
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Wait for the full body to download - this is usually the slow part
    const [metadata, content] = await response.json();
    
    document.dispatchEvent(new Event('beforenavigate'));

    const root = document.getElementById("root");
    root.innerHTML = content;

    // Re-execute scripts
    root.querySelectorAll("script").forEach(function(oldScript) {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach(function(attr) {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    const target = hash || (push ? "" : decodeURIComponent(window.location.hash.substring(1)));
    const targetEl = target ? document.getElementById(target) : null;
    if (targetEl) {
      revealTarget(targetEl);
      targetEl.scrollIntoView({ behavior: "instant", block: "start" });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    toggleMenu(true);
    markCurrentPage(location);
    document.querySelector("title").textContent = metadata["title"];
    if (push) {
      history.pushState(null, null, metadata["canonical"] + (hash ? "#" + hash : ""));
    }

  } catch (err) {
    console.error("Navigation failed:", err);
  } finally {
    clearTimeout(loadingTimeout);
    if (loadingBar && loadingBar.classList.contains('active')) {
      loadingBar.classList.add('finish');
      loadingBar.classList.remove('active');
      setTimeout(() => {
        if (!loadingBar.classList.contains('active')) {
          loadingBar.style.width = '0%';
          loadingBar.classList.remove('finish');
          loadingBar.classList.remove('visible');
        }
      }, 500);
    }
  }
}

// Featured project panels: collapsed to a short peek until expanded.
function setFeatureExpanded(feature, expanded) {
  const clips = feature.querySelectorAll(".feature-clip");
  const btn = feature.querySelector(".feature-expand");
  if (expanded) {
    feature.classList.add("expanded");
    clips.forEach(function (el) {
      el.style.maxHeight = el.scrollHeight + "px";
    });
    // Once open, let the regions size themselves so late-loading content is never clipped.
    setTimeout(function () {
      if (!feature.classList.contains("expanded")) return;
      clips.forEach(function (el) {
        el.style.maxHeight = "none";
      });
    }, 400);
  } else {
    // Pin the current heights, force a reflow, then let CSS animate down to the peek.
    clips.forEach(function (el) {
      el.style.maxHeight = el.scrollHeight + "px";
    });
    void feature.offsetHeight;
    feature.classList.remove("expanded");
    clips.forEach(function (el) {
      el.style.maxHeight = "";
    });
  }
  if (btn) btn.setAttribute("aria-expanded", expanded ? "true" : "false");
}

function toggleFeature(btn) {
  const feature = btn.closest(".feature");
  if (feature) setFeatureExpanded(feature, !feature.classList.contains("expanded"));
}

// Expand a collapsed panel (or the one containing the target) before jumping to it.
function revealTarget(el) {
  const feature = el.closest(".feature");
  if (feature && !feature.classList.contains("expanded")) {
    setFeatureExpanded(feature, true);
    feature.querySelectorAll(".feature-clip").forEach(function (el) {
      el.style.maxHeight = "none";
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (!window.location.hash) return;
  const el = document.getElementById(decodeURIComponent(window.location.hash.substring(1)));
  if (el) {
    revealTarget(el);
    el.scrollIntoView({ behavior: "instant", block: "start" });
  }
});

function backButton() {
  const path = window.location.pathname;
  goto(path.substring(1) || "home", { push: false });
}

function activeSkill(obj) {
  let skill = obj.closest(".skill");
  if (skill.classList.contains("activeSkill")) {
    skill.classList.remove("activeSkill");
    const btn = obj.closest('.skillname') || obj.querySelector?.('.skillname') || obj;
    if (btn && btn.setAttribute) btn.setAttribute("aria-expanded", "false");
    return;
  }
  while (skill) {
    skill.classList.add("activeSkill");
    const nameEl = skill.querySelector?.(':scope > .skillname') || skill.querySelector('.skillname');
    if (nameEl) nameEl.setAttribute("aria-expanded", "true");
    skill = skill.parentElement.closest(".skill");
  }
}
