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
  let response;
  try {
    response = await fetch("/api/goto/" + location, {
      credentials: "include",
      method: "GET",
      mode: "cors",
    });
    if (!response.ok) {
      console.error(`Navigation failed: HTTP ${response.status}`);
      return;
    }
  } catch (err) {
    console.error("Navigation fetch failed:", err);
    return;
  }

  document.dispatchEvent(new Event('beforenavigate'));

  const [metadata, content] = await response.json();
  const root = document.getElementById("root");
  root.innerHTML = content;

  // Re-execute scripts injected via innerHTML (browser ignores them otherwise)
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
