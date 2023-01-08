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
  if (allow.length === 0) {
    toggles.forEach(function (x) {
      allow.push(x.id);
    });
  }
  let list = document.querySelectorAll(".checkbox-client > div");
  for (let i = 0; i < list.length; i++) {
    list[i].classList.add("hidden" + dir);
    for (let x = 0; x < list[i].classList.length; x++) {
      if (allow.includes(list[i].classList[x])) {
        list[i].classList.remove("hidden" + dir);
        break;
      }
    }
  }
}
