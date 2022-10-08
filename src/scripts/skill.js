let currentType = "";

const dict = {
    'python': {'name': 'Python', 'info': 'Python and shit'},
    'js': {'name': 'Javascript', 'info': 'JS and shit'},
    'html': {'name': 'HTML/CSS', 'info': 'also SCSS'},
    'sql': {'name': 'HTML/CSS', 'info': 'also SCSS'},
    'cpp': {'name': 'HTML/CSS', 'info': 'also SCSS'},
    'other': {'name': 'HTML/CSS', 'info': 'also SCSS'},
    'tools': {'name': 'HTML/CSS', 'info': 'also SCSS'}
}

export function skill(type) {
  if (currentType === type) {
    return;
  }
  currentType = type;
  let disp = document.getElementById("skillDisp");
  disp.classList = [];
  let ugh = disp.offsetWidth; // without this delay the animation doesn't begin.  idfk.
  disp.querySelector('h2').textContent = dict[type]['name'];
  disp.querySelector('p').textContent = dict[type]['info'];
  disp.classList.add(type);
  disp.classList.add('swipeIn');
  return ugh; // gets rid of unused variable warning
}
