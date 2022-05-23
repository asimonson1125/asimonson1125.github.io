window.onload = function () { onLoaded() };
function onLoaded() {
  console.log("loaded trigger");
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  let navs = document.querySelectorAll('.navElement');
  navs.forEach(function (element) {
    element.onclick = function () {
      toggleMenu();
    }
  });

  window.onresize = function () { resizer() };
  resizer();
  if (window.innerWidth < 1200) {
    const e = document.querySelector(".navControl");
    e.style.maxHeight = '0px';
  }
}

function resizer() {
  const e = document.querySelector(".navControl");
  if (window.innerWidth > 1200) { // desktop view
    scrollFunction();
    window.onscroll = function () { scrollFunction() };
    e.style.maxHeight = `${e.scrollHeight + 10}px`;
  }
  else { // mobile view
    window.onscroll = '';
    document.querySelector('.header').style.backgroundColor = '#1a1a1a';
    document.querySelector('.header > a > h1').style.fontSize = "1.5rem";
    // document.querySelector('.header > h1').style.color = "#ecebeb";
    document.querySelector(".header").style.borderBottomWidth = '3px';
    e.style.maxHeight = '0px';
    document.querySelectorAll('.navElement *').forEach(x => { x.style.paddingTop = '.3rem'; x.style.paddingBottom = '.3rem'; x.style.fontSize = '1rem' });
  }
}

function scrollFunction() {
  if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) {
    document.querySelector('.header').style.backgroundColor = '#1a1a1a';
    document.querySelector('.header > a > h1').style.fontSize = "1.5rem";
    // document.querySelector('.header > h1').style.color = "#a8a8a8";
    document.querySelectorAll('.navElement *').forEach(x => { x.style.paddingTop = '.3rem'; x.style.paddingBottom = '.3rem'; x.style.fontSize = '1rem' });
  } else {
    document.querySelector('.header').style.backgroundColor = 'rgba(0,0,0,0)';
    document.querySelector('.header > a > h1').style.fontSize = "2rem";
    // document.querySelector('.header > h1').style.color = "#ecebeb";
    document.querySelectorAll('.navElement *').forEach(x => { x.style.paddingTop = '.5rem'; x.style.paddingBottom = '.5rem'; x.style.fontSize = '1.2rem' });
  }
}

export function toggleMenu() {
  if (window.innerWidth < 1200) {
    const e = document.querySelector(".navControl");
    const bar = document.querySelector(".header");
    if (e.style.maxHeight === '0px') {
      e.style.maxHeight = `${e.scrollHeight + 10}px`;
      bar.style.borderBottomWidth = '0px';
    } else {
      e.style.maxHeight = '0px';
      bar.style.borderBottomWidth = '3px';
    }
  }
}