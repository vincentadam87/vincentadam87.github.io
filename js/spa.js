/*****************************************
 * Single Page Application with Markdown
 *****************************************/

// Simple markdown parser
function parseMarkdown(md) {
  let html = md;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold and Italic (order matters: do bold+italic first)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Paragraphs (split by double newlines)
  html = html.split('\n\n').map(para => {
    para = para.trim();
    if (para.startsWith('<h') || para.startsWith('<span')) {
      return para;
    }
    return para ? `<p>${para.replace(/\n/g, ' ')}</p>` : '';
  }).join('\n');
  
  return html;
}

/*****************************************
 * PAGE CONFIGURATION
 * 
 * To add a new page:
 * 1. Add entry to pages object below
 * 2. Create corresponding .md file in pages/
 * 3. Add link to header in index.html
 *****************************************/

const pages = {
  home: {
    title: 'Vincent Adam',
    file: 'pages/home.md',
    wrapperClass: 'intro',
    onLoad: initTypewriter
  },
  research: {
    title: 'Research — Vincent Adam',
    file: 'pages/research.md',
    wrapperClass: 'page-section'
  },
  consulting: {
    title: 'Consulting — Vincent Adam',
    file: 'pages/consulting.md',
    wrapperClass: 'page-section'
  }
  // Add new pages here following the same pattern:
  // pagename: {
  //   title: 'Page Title — Vincent Adam',
  //   file: 'pages/pagename.md',
  //   wrapperClass: 'page-section'
  // }
};

/*****************************************
 * Router Functions
 *****************************************/

async function loadPage(pageName) {
  const page = pages[pageName] || pages.home;
  const content = document.getElementById('content');
  
  try {
    // Fetch markdown file
    const response = await fetch(page.file);
    const markdown = await response.text();
    
    // Convert markdown to HTML
    const html = parseMarkdown(markdown);
    
    // Wrap in appropriate container
    content.innerHTML = `<div class="${page.wrapperClass}">${html}</div>`;
    
    // Update document title
    document.title = page.title;
    
    // Run page-specific initialization if exists
    if (page.onLoad) {
      page.onLoad();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
    
  } catch (error) {
    console.error('Error loading page:', error);
    content.innerHTML = '<div class="page-section"><h1>Error</h1><p>Failed to load content.</p></div>';
  }
}

// Handle navigation
function navigate(e) {
  e.preventDefault();
  const href = e.target.getAttribute('href');
  const pageName = href.replace('#', '');
  
  // Update URL without reload
  window.location.hash = href;
  
  // Load the page
  loadPage(pageName);
}

// Set up navigation listeners
function initNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', navigate);
  });
}

// Handle browser back/forward buttons
window.addEventListener('hashchange', () => {
  const pageName = window.location.hash.replace('#', '') || 'home';
  loadPage(pageName);
});

/*****************************************
 * Typewriter Animation (for home page)
 *****************************************/

let typingInterval;

function initTypewriter() {
  if (typingInterval) {
    clearTimeout(typingInterval);
  }
  
  const typedText = document.getElementById("typed-text");
  if (!typedText) return;

  const phrases = [
    "an AI researcher",
    "a machine learning consultant",
    "a cognitive scientist",
    "a technology enthusiast",
    "an avid reader",
    "a machine learning teacher"
  ];

  const TYPING_SPEED = 30;
  const DELETING_SPEED = 20;
  const PAUSE_AFTER_TYPING = 1500;
  const PAUSE_BEFORE_TYPING = 1200;
  const INITIAL_DELAY = 1200;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      typedText.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentPhrase.length) {
        typingInterval = setTimeout(() => {
          isDeleting = true;
          type();
        }, PAUSE_AFTER_TYPING);
        return;
      }
    } else {
      typedText.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingInterval = setTimeout(type, PAUSE_BEFORE_TYPING);
        return;
      }
    }

    typingInterval = setTimeout(type, isDeleting ? DELETING_SPEED : TYPING_SPEED);
  }

  typingInterval = setTimeout(type, INITIAL_DELAY);
}

/*****************************************
 * Theme Toggle
 *****************************************/

function initThemeToggle() {
  const themeToggleBtn = document.getElementById("theme-toggle");
  
  if (!themeToggleBtn) {
    console.error('Theme toggle button not found');
    return;
  }

  themeToggleBtn.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark-theme");

    if (document.documentElement.classList.contains("dark-theme")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });
}

/*****************************************
 * Load SVG Icons
 *****************************************/

async function loadIcons() {
  try {
    // Load theme toggle icons
    const themeIcons = document.getElementById('theme-icons');
    if (themeIcons) {
      const [sunSvg, moonSvg] = await Promise.all([
        fetch('assets/icons/sun.svg').then(r => r.text()),
        fetch('assets/icons/moon.svg').then(r => r.text())
      ]);
      
      themeIcons.innerHTML = `
        ${sunSvg.replace('<svg', '<svg id="sun-icon"')}
        ${moonSvg.replace('<svg', '<svg id="moon-icon"')}
      `;
    }

    // Load footer icons
    const footerLinks = document.getElementById('footer-links');
    if (footerLinks) {
      const [scholarSvg, goodreadsSvg, emailSvg] = await Promise.all([
        fetch('assets/icons/scholar.svg').then(r => r.text()),
        fetch('assets/icons/goodreads.svg').then(r => r.text()),
        fetch('assets/icons/email.svg').then(r => r.text())
      ]);
      
      footerLinks.innerHTML = `
        <a href="https://scholar.google.com/citations?user=1OYH5GgAAAAJ&hl=en" target="_blank" rel="noopener noreferrer" aria-label="Google Scholar">
          ${scholarSvg}
        </a>
        <a href="https://www.goodreads.com/user/show/46118424-vincent-adam" target="_blank" rel="noopener noreferrer" aria-label="Goodreads">
          ${goodreadsSvg}
        </a>
        <a href="mailto:vincent.adam.ml@gmail.com" aria-label="Email">
          ${emailSvg}
        </a>
      `;
    }
  } catch (error) {
    console.error('Error loading icons:', error);
  }
}

/*****************************************
 * Initialize Everything
 *****************************************/

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function init() {
  await loadIcons();
  initThemeToggle();
  initNavigation();
  
  const initialPage = window.location.hash.replace('#', '') || 'home';
  loadPage(initialPage);
}
