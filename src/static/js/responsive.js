function toggleMenu(collapse) {
  if (window.innerWidth < 1400) {
    const menu = document.querySelector(".navControl");
    const bar = document.querySelector(".header");
    const isCollapsed = !menu.style.maxHeight || menu.style.maxHeight === "0px";
    if (isCollapsed && !collapse) {
      menu.style.maxHeight = `${menu.scrollHeight + 10}px`;
      bar.style.borderBottomWidth = "0px";
    } else {
      menu.style.maxHeight = "0px";
      bar.style.borderBottomWidth = "3px";
    }
  }
}

async function goto(location, { push = true } = {}) {
  const loadingBar = document.getElementById('loading-bar');
  console.log(`Navigating to ${location}`);
  
  if (loadingBar) {
    loadingBar.style.width = ''; // Clear inline style from previous run
  }

  let loadingTimeout = setTimeout(() => {
    if (loadingBar) {
      console.log("Navigation taking > 150ms, showing bar");
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

    if (window.location.href.includes("#")) {
      const id = decodeURIComponent(window.location.hash.substring(1));
      const el = document.getElementById(id);
      if (el) el.scrollIntoView();
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    toggleMenu(true);
    document.querySelector("title").textContent = metadata["title"];
    if (push) {
      history.pushState(null, null, metadata["canonical"]);
    }

  } catch (err) {
    console.error("Navigation failed:", err);
  } finally {
    clearTimeout(loadingTimeout);
    if (loadingBar && loadingBar.classList.contains('active')) {
      console.log("Navigation finished, hiding bar");
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

function backButton() {
  const path = window.location.pathname;
  goto(path.substring(1), { push: false });
}

function activeSkill(obj) {
  let skill = obj.closest(".skill");
  if (skill.classList.contains("activeSkill")) {
    skill.classList.remove("activeSkill");
    return;
  }
  while (skill) {
    skill.classList.add("activeSkill");
    skill = skill.parentElement.closest(".skill");
  }
}
