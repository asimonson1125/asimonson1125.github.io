function toggleMenu(collapse=false) {
  if (window.innerWidth < 1400) {
    const e = document.querySelector(".navControl");
    const bar = document.querySelector(".header");
    if (e.style.maxHeight === "0px" && !collapse) {
      e.style.maxHeight = `${e.scrollHeight + 10}px`;
      bar.style.borderBottomWidth = "0px";
    } else {
      e.style.maxHeight = "0px";
      bar.style.borderBottomWidth = "3px";
    }
  }
}

async function goto(location, { push = true } = {}) {
  let a;
  try {
    a = await fetch("/api/goto/" + location, {
      credentials: "include",
      method: "GET",
      mode: "cors",
    });
    if (!a.ok) {
      console.error(`Navigation failed: HTTP ${a.status}`);
      return;
    }
  } catch (err) {
    console.error("Navigation fetch failed:", err);
    return;
  }

  document.dispatchEvent(new Event('beforenavigate'));

  const response = await a.json();
  const metadata = response[0];
  const content = response[1];
  const root = document.getElementById("root");
  root.innerHTML = content;
  root.querySelectorAll("script").forEach((oldScript) => {
    const newScript = document.createElement("script");
    Array.from(oldScript.attributes).forEach(attr => {
      newScript.setAttribute(attr.name, attr.value);
    });
    newScript.textContent = oldScript.textContent;
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });

  if (!window.location.href.includes("#")) {
    window.scrollTo({top: 0, left: 0, behavior:"instant"});
  } else {
    const eid = decodeURIComponent(window.location.hash.substring(1));
    const el = document.getElementById(eid);
    if (el) el.scrollIntoView();
  }

  toggleMenu(collapse=true);
  document.querySelector("title").textContent = metadata["title"];
  if (push) {
    history.pushState(null, null, metadata["canonical"]);
  }
}

function backButton() {
  const location = window.location.pathname;
  goto(location.substring(1), { push: false }); // remove slash, goto already does that
}
