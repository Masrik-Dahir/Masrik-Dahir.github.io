const countries = document.querySelectorAll('path');
const svg = document.querySelector('svg');
const initialViewBox = svg.getAttribute('viewBox');
const cleanViewBox = ({ x, y, width, height }) => {
  return [x, y, width, height].map(v => parseInt(v, 10)).join(' ');
};

svg.addEventListener('click', function ({ target }) {
  // if target is a path in the SVG Document
  if (target.nodeName === "path") {
    // remove class on active element
    let activeElement = document.querySelector('.selected');
    if (activeElement) {
      activeElement.classList.remove('selected');
    }
    // adding the class on the clicked path;
    target.classList.add('selected');
    // animation of the viewBox
    // TweenMax.to('svg', 2, { attr: { viewBox: cleanViewBox(target.getBBox()) }, ease: Power2.easeInOut });
    // Get the name of the country and get back to the viewBox initial value
    countryName(target);
  }
});

function countryName(path) {

  let name = path.getAttribute('data-name');
  code = path.id;
  toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = `${name || 'N/A'} (${code})`;
  document.body.appendChild(toast);

}