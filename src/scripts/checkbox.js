export function toggle(dir) {
  let toggles = document.querySelectorAll(
    ".checkbox-wrapper input[type=checkbox]"
  );
  let allow = [];
  toggles.forEach(function (x) {
    if (x.checked) {
      allow.push(x.id);
    }
  });
  let list = document.querySelectorAll(".checkbox-client > div");
  if (allow.length === 0) {
    for (let i = 0; i < list.length; i++) {
      list[i].classList.remove("hidden" + dir);
    }
  } else {
    for (let i = 0; i < list.length; i++) {
      list[i].classList.remove("hidden" + dir);
      for (let x = 0; x < allow.length; x++) {
        if (!list[i].classList.contains(allow[x])) {
          list[i].classList.add("hidden" + dir);
          break;
        }
      }
    }
  }
}
