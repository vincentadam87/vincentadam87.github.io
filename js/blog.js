/* Shared theme and footer behavior for statically generated blog pages. */

async function loadIcons() {
  const themeIcons = document.getElementById('theme-icons');
  const footerLinks = document.getElementById('footer-links');
  const [sunSvg, moonSvg, scholarSvg, goodreadsSvg, emailSvg] = await Promise.all([
    fetch('/assets/icons/sun.svg').then(response => response.text()),
    fetch('/assets/icons/moon.svg').then(response => response.text()),
    fetch('/assets/icons/scholar.svg').then(response => response.text()),
    fetch('/assets/icons/goodreads.svg').then(response => response.text()),
    fetch('/assets/icons/email.svg').then(response => response.text())
  ]);

  themeIcons.innerHTML = `${sunSvg.replace('<svg', '<svg id="sun-icon"')}${moonSvg.replace('<svg', '<svg id="moon-icon"')}`;
  footerLinks.innerHTML = `
    <a href="https://scholar.google.com/citations?user=1OYH5GgAAAAJ&hl=en" target="_blank" rel="noopener noreferrer" aria-label="Google Scholar">${scholarSvg}</a>
    <a href="https://www.goodreads.com/user/show/46118424-vincent-adam" target="_blank" rel="noopener noreferrer" aria-label="Goodreads">${goodreadsSvg}</a>
    <a href="mailto:vincent.adam.ml@gmail.com" aria-label="Email">${emailSvg}</a>`;
}

function initThemeToggle() {
  document.getElementById('theme-toggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light');
  });
}

async function initBlog() {
  try {
    await loadIcons();
    initThemeToggle();
  } catch (error) {
    console.error('Error loading blog shell:', error);
  }
}

initBlog();
