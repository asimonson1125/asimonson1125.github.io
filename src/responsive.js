window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    document.querySelector('.header').style.backgroundColor = '#1a1a1a';
    document.querySelector('.header > a > h1').style.fontSize = "1.5rem";
    // document.querySelector('.header > h1').style.color = "#a8a8a8";
    document.querySelectorAll('.navElement').forEach(x => {x.style.paddingTop = '.3rem'; x.style.paddingBottom = '.3rem'; x.style.fontSize='1rem'});
  } else {
    document.querySelector('.header').style.backgroundColor = 'rgba(0,0,0,0)';
    document.querySelector('.header > a > h1').style.fontSize = "2rem";
    // document.querySelector('.header > h1').style.color = "#ecebeb";
    document.querySelectorAll('.navElement').forEach(x => {x.style.paddingTop = '.5rem'; x.style.paddingBottom = '.5rem'; x.style.fontSize='1.2rem'});
  }
} 