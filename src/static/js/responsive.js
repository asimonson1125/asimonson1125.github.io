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
  let a = await fetch("/api/goto/" + location, {
    credentials: "include",
    method: "GET",
    mode: "cors",
  });
  const response = await a.json();
  if (!location.includes("#")) {
    window.scrollTo({top: 0, left: 0, behavior:"instant"});
  }
  const metadata = response[0];
  const content = response[1];
  let root = document.getElementById("root");
  root.innerHTML = content;
  root.querySelectorAll("script").forEach((x) => {
    eval(x.innerHTML);
  });
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
