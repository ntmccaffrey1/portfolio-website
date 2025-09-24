/* =================================
   Utility Functions
================================= */ 

function getElementDelay(el, variableName = '--delay') {
  const value = el.style.getPropertyValue(variableName) || '0';
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/* =================================
   Lenis Scroll
================================= */ 

const RESIZE_DEBOUNCE_DELAY = 300;
const MENU_CLOSE_ANIMATION_DURATION = 400;

let resizeTimeout;
const lenis = new Lenis({
  duration: 1,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  smoothTouch: true,
});

function refreshLenis() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    requestAnimationFrame(() => {
      lenis.resize();
    });
  }, RESIZE_DEBOUNCE_DELAY);
}

window.addEventListener('load', refreshLenis);

/* =================================
   Lenis Scroll RAF
================================= */

function lenisScroll() {
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/* =================================
   Main Menu Link Hover Opacity
================================= */

function setActiveLink(selector) {
  const links = document.querySelectorAll(`${selector} a`);

  function applyOpacity(hoveredLink = null) {
    links.forEach(link => {
      link.style.opacity = hoveredLink ? (link === hoveredLink ? '1' : '0.3') : '1';
    });
  }

  links.forEach(link => {
    link.addEventListener('mouseenter', () => applyOpacity(link));
    link.addEventListener('mouseleave', () => applyOpacity());
  });

  applyOpacity();
}

/* =================================
   Menu Toggle
================================= */

function menuToggle() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('menu');
  const overlay = document.getElementById('menu__overlay');
  const navLinks = document.querySelectorAll('.main-menu li');
  const socialLinks = document.querySelectorAll('.menu__social--links a');
  const logo = document.querySelector('.menu__logo');

  if (!hamburger || !menu || !overlay) return;

  const isMenuOpen = () => menu.classList.contains('show');

  function setVisible(visible) {
    hamburger.classList.toggle('active', visible);
    menu.classList.toggle('show', visible);
    overlay.classList.toggle('show', visible);
    document.body.classList.toggle('ov-hidden', visible);
    logo?.classList.toggle('visible', visible);
    visible ? lenis.stop() : lenis.start();

    const allLinks = [...navLinks, ...socialLinks];

    allLinks.forEach((link, i) => {
      if (visible) {
        setTimeout(() => link.classList.add('visible'), i * 100);
      } else {
        link.classList.remove('visible');
      }
    });
  }

  function toggleMenu() {
    if (isMenuOpen()) {
      menu.classList.add('closing');
      setVisible(false);
      setTimeout(() => menu.classList.remove('closing'), MENU_CLOSE_ANIMATION_DURATION);
    } else {
      setVisible(true);
    }
  }

  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', () => isMenuOpen() && toggleMenu());

  [...navLinks, logo].forEach(el => {
    el?.addEventListener('click', () => isMenuOpen() && toggleMenu());
  });

  window.closeMenuOnBack = () => {
    if (isMenuOpen()) toggleMenu();
  };
}

/* =================================
 Fade In Elements On Scroll
================================= */ 

function fadeInElements() {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  });

  document.querySelectorAll('.fade-upNone').forEach(el => {
    observer.observe(el);
  });
}

/* =================================
    Blur Letters on Fade In Scroll
  ================================= */ 

function blurScrollEffect() {
  const elements = document.querySelectorAll('.blur-scroll');

  function wrapLetters(node) {
    const fragment = document.createDocumentFragment();

    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '') {
        const words = child.textContent.split(/(\s+)/); // include spaces
        words.forEach(word => {
          const wordSpan = document.createElement('span');
          wordSpan.style.display = 'inline-block';
          wordSpan.style.whiteSpace = 'nowrap';

          for (const char of word) {
            const span = document.createElement('span');
            span.classList.add('letter');
            span.setAttribute('data-final', char);
            span.style.display = 'inline-block';
            span.style.width = '1ch';
            span.style.textAlign = 'center';
            span.style.opacity = '0';
            span.style.transition = 'opacity 0.3s ease';
            span.style.backfaceVisibility = 'hidden';
            span.style.transform = 'translateZ(0)';
            wordSpan.appendChild(span);
          }

          fragment.appendChild(wordSpan);
        });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const clone = child.cloneNode(false);
        const wrapped = wrapLetters(child);
        clone.appendChild(wrapped);
        fragment.appendChild(clone);
      } else {
        fragment.appendChild(child.cloneNode(true));
      }
    });

    return fragment;
  }

  function scrambleAndReveal(span, finalChar) {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let iterations = 0;
    const scrambleInterval = setInterval(() => {
      if (iterations >= 5) {
        clearInterval(scrambleInterval);
        span.textContent = finalChar;
        span.style.opacity = '1';
        return;
      }
      span.textContent = characters.charAt(Math.floor(Math.random() * characters.length));
      span.style.opacity = '1';
      iterations++;
    }, 30);
  }

  elements.forEach(el => {
    const wrapped = wrapLetters(el);
    el.innerHTML = '';
    el.appendChild(wrapped);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const spans = entry.target.querySelectorAll('span.letter');
        const baseDelay = getElementDelay(entry.target);

        spans.forEach((span, index) => {
          const delay = baseDelay + index * 100;
          const originalChar = span.getAttribute('data-final');
          setTimeout(() => {
            scrambleAndReveal(span, originalChar);
          }, delay);
        });

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  elements.forEach(el => observer.observe(el));
}

/* =================================
  Split Heading's into Span Elements
  ================================= */

function staggerFade() {
  const headers = document.querySelectorAll('.stagger-fade');

  headers.forEach(header => {
    const childNodes = Array.from(header.childNodes);
    const newContent = document.createDocumentFragment();

    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = node.textContent.split(/(\s+)/);
        parts.forEach(part => {
          if (part.trim() === '') {
            newContent.appendChild(document.createTextNode(part));
          } else {
            const span = document.createElement('span');
            span.textContent = part;
            newContent.appendChild(span);
          }
        });
      } else {
        newContent.appendChild(node.cloneNode(true));
      }
    });

    header.innerHTML = '';
    header.appendChild(newContent);

    const spans = header.querySelectorAll('span');
    const delay = getElementDelay(header);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            spans.forEach((span, i) => {
              span.style.transitionDelay = `${delay + i * 100}ms`;
            });
            header.classList.add('visible');
            observer.unobserve(header);
          }, delay);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(header);
  });
}

/* =================================
    Wrap Letters in Span Helper
  ================================= */ 

function wrapLetters(node) {
  const fragment = document.createDocumentFragment();

  node.childNodes.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '') {
      const parts = child.textContent.split(/(\s+)/); // Keep spaces
      parts.forEach(part => {
        if (part.trim() === '') {
          fragment.appendChild(document.createTextNode(part));
        } else {
          const wordSpan = document.createElement('span');
          wordSpan.style.whiteSpace = 'nowrap';

          part.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
          });

          fragment.appendChild(wordSpan);
        }
      });
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const clone = child.cloneNode(false);
      const wrapped = wrapLetters(child);
      clone.appendChild(wrapped);
      fragment.appendChild(clone);
    } else {
      fragment.appendChild(child.cloneNode(true));
    }
  });

  return fragment;
}

/* =================================
   Blur Letters on Link Hover
================================= */ 

function hoverBlurGlobal() {
  const links = document.querySelectorAll('#content .blur');
  applyHoverBlurToElements(links);
}

function hoverBlurHeader() {
  const links = document.querySelectorAll('#header .blur');
  applyHoverBlurToElements(links);
}

function hoverBlurFooter() {
  const links = document.querySelectorAll('#footer .blur');
  applyHoverBlurToElements(links);
}

function applyHoverBlurToElements(elements) {
  const scrambleChars = 'abcdefghijklmnopqrstuvwxyz';

  elements.forEach(el => {
    const nodes = Array.from(el.childNodes);

    nodes.forEach(node => {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        (node.tagName === 'SPAN' || node.querySelector)
      ) return;

      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
        const fragment = document.createDocumentFragment();

        node.textContent.split('').forEach(char => {
          const span = document.createElement('span');
          span.textContent = char;
          span.dataset.originalChar = char;
          span.style.display = 'inline-block';
          fragment.appendChild(span);
        });

        el.replaceChild(fragment, node);
      }
    });

    el.addEventListener('mouseenter', () => {
      const spans = el.querySelectorAll('span');

      spans.forEach((span, i) => {
        const original = span.dataset.originalChar;
        let frame = 0;

        // Show flash background
        span.classList.add('flash');
        setTimeout(() => span.classList.remove('flash'), 150);

        span.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];

        const interval = setInterval(() => {
          if (frame < i * 2) {
            span.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          } else {
            span.textContent = original;
            clearInterval(interval);
          }
          frame++;
        }, 30);
      });
    });
  });
}

/* =================================
   Awards Row Hover and Show Image
================================= */

function hoverImage() {
  const hoverImage = document.querySelector('.hover-image');
  const hoverItems = document.querySelectorAll('.hover-item');

  if (!hoverImage || hoverItems.length === 0) return;

  let hideTimeout = null;

  hoverItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const imgSrc = item.dataset.img;
      if (!imgSrc || !hoverImage) return;

      hoverImage.src = imgSrc;

      // Show the image after it loads
      hoverImage.onload = () => {
        const row = item.querySelector('.awards__table--row');
        if (!row) return;

        const rect = row.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        const imageWidth = hoverImage.offsetWidth;
        const imageHeight = hoverImage.offsetHeight;

        hoverImage.style.left = `${window.innerWidth * 0.70 - imageWidth / 2}px`;

        hoverImage.style.top = `${rect.top + scrollY + rect.height / 2 - imageHeight / 2}px`;

        hoverImage.classList.add('visible');
      };

      // Cancel hiding if we re-enter
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    });

    item.addEventListener('mouseleave', () => {
      hideTimeout = setTimeout(() => {
        if (!document.querySelector('.hover-item:hover')) {
          hoverImage.classList.remove('visible');
          setTimeout(() => {
            hoverImage.src = '';
          }, 300);
        }
        hideTimeout = null;
      }, 50);
    });
  });
}

/* =================================
   Toggle Theme
================================= */

function toggleTheme() {
  function updateThemeColor(theme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;

    // Set color based on theme
    const color = theme === 'dark' ? '#121212' : '#e2ebe9';
    meta.setAttribute('content', color);
  }

  const toggleButtons = document.querySelectorAll('.toggle-theme');

  let currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('theme', currentTheme);
  updateThemeColor(currentTheme);

  // Add toggle logic
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const newTheme = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeColor(newTheme);
      document.documentElement.style.backgroundColor = newTheme === 'dark' ? '#121212' : '#e2ebe9';
    });
  });
}

/* =================================
   Page Loader
================================= */

function loader() {  
  const loader = document.querySelector('#loader');
  const grid = document.querySelector('.loader-grid');

  if (!loader) return;

  let squareSize;

  if (window.innerWidth <= 480) {
    squareSize = 60;
  } else if (window.innerWidth <= 768) {
    squareSize = 100;
  } else {
    squareSize = 120;
  }

  const cols = Math.ceil(window.innerWidth / squareSize);
  const rows = Math.ceil(window.innerHeight / squareSize);
  const totalSquares = cols * rows;

  grid.innerHTML = '';

  const percentageEl = document.querySelector('.loader-percentage');

  let percent = 0;
  const duration = 1500; 
  const steps = 100;     
  const interval = duration / steps;

  const percentageInterval = setInterval(() => {
    percent++;
    percentageEl.textContent = `${percent}%`;
    if (percent >= 100) clearInterval(percentageInterval);
  }, interval);

  for (let i = 0; i < totalSquares; i++) {
    const square = document.createElement('div');
    square.classList.add('square');
    grid.appendChild(square);
  }

  setTimeout(() => {
    const stroke = document.querySelector('.n-stroke');
    const fill = document.querySelector('.n-fill');
    const svg = document.querySelector('.svg1');
    const percent = document.querySelector('.loader-percentage');

    stroke?.classList.add('animate-stroke');
    fill?.classList.add('animate-fill');

    setTimeout(() => {
      svg?.classList.add('fade-out');
      percent?.classList.add('fade-out');

      setTimeout(() => {
        svg?.classList.add('hidden');
        percent?.classList.add('hidden');
      }, 600);
    }, 2500);
  }, 100);

  const fadeOutStartDelay = 3000;
  const fadeDuration = 500;

  setTimeout(() => {
    const squares = grid.querySelectorAll('.square');
    squares.forEach(square => {
      const delay = Math.random() * 300;
      setTimeout(() => {
        square.classList.add('fade-out');
      }, delay);
    });

    document.body.classList.remove('body-loading');
    document.getElementById('site').style.display = '';
  }, fadeOutStartDelay);

  setTimeout(() => {
    loader.remove();
  }, fadeOutStartDelay + fadeDuration + 300);
}

/* =================================
   Fade Out Hero Content On Scroll
================================= */

function fadeHero() {
  window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrollY = window.scrollY;
    const fadeStart = 0;
    const fadeEnd = window.innerHeight / 1.5;

    if (!hero) return;

    const opacity = 1 - Math.min(Math.max((scrollY - fadeStart) / (fadeEnd - fadeStart), 0), 1);
    hero.style.opacity = opacity;
  });
}

/* =================================
   Pixel Fade In Green Circle
================================= */

function fillCircleWithSquares() {
  const circle = document.querySelector('.hero__round--bg-circle');
  const circleGrid = document.querySelector('.circle-grid');
  const root = document.documentElement;
  const neonBg = getComputedStyle(root).getPropertyValue('--color-neon').trim();

  if (!circle || !circleGrid) return;

  const cols = 10;
  const rows = 10;

  circleGrid.style.display = 'grid';
  circleGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  circleGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  const totalSquares = cols * rows;
  let maxDelay = 0;

  for (let i = 0; i < totalSquares; i++) {
    const square = document.createElement('div');
    square.classList.add('square');

    const delay = Math.random() * 500;
    maxDelay = Math.max(maxDelay, delay);

    setTimeout(() => {
      square.classList.add('visible');
    }, delay);

    circleGrid.appendChild(square);
  }

  setTimeout(() => {
    circle.style.backgroundColor = neonBg;
    circle.innerHTML = '';
  }, maxDelay + 800);
}

function runFillCircleWithLoaderCheck() {
  const loader = document.querySelector('#loader');
  const loaderIsActive = loader && !loader.classList.contains('hidden');

  const runCircle = () => fillCircleWithSquares();

  if (loaderIsActive) {
    const fadeOutStartDelay = 2500;
    const fadeDuration = 500;
    const buffer = 300;

    setTimeout(runCircle, fadeOutStartDelay + fadeDuration + buffer);
  } else {
    runCircle(); // No delay if loader isn’t active
  }
}

/* =================================
   Show Next Project On Scroll
================================= */

function nextProj() {
  const container = document.querySelector('.next__project');
  const block = document.querySelector('.next__project--block');
  const footer = document.querySelector('.footer__wrap');
  if (!container || !block || !footer) return;

  const onScrollOrResize = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    const footerTop = footer.getBoundingClientRect().top + window.scrollY;
    const blockHeight = block.offsetHeight;

    // Fade at 60%
    const scrolled = (scrollTop + windowHeight) / docHeight;
    block.classList.toggle('visible', scrolled >= 0.6);

    // Block’s document-space top while fixed at bottom:50px
    const blockTopWhenFixed =
      scrollTop + windowHeight - 50 - blockHeight;

    const stopPoint = footerTop - blockHeight - 20; // 20px buffer above footer

    if (blockTopWhenFixed >= stopPoint) {
      container.classList.add('stuck');
      container.style.position = 'absolute';
      container.style.top = `${stopPoint}px`;
    } else {
      container.classList.remove('stuck');
      container.style.position = 'fixed';
      container.style.top = ''; // rely on CSS bottom:50px
    }
  };

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);
  onScrollOrResize();
}

/* =================================
   Run Animation after Loader
================================= */

function runAfterLoader(callback) {
  const loader = document.querySelector('#loader');

  if (!loader || loader.classList.contains('hidden') || !document.body.contains(loader)) {
    callback();
    return;
  }

  const observer = new MutationObserver(() => {
    if (loader.classList.contains('hidden') || !document.body.contains(loader)) {
      observer.disconnect();
      callback();
    }
  });

  observer.observe(loader, { attributes: true, childList: true, subtree: true });
}

/* =================================
   Work Slider
================================= */

function workSlider() {
  const slider = document.querySelector('.slider');
  const slides = slider ? slider.querySelectorAll('.slide') : [];
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const currentSlideEl = document.getElementById('current-slide');
  const totalSlidesEl = document.getElementById('total-slides');

  if (!slider || slides.length === 0) return;

  let index = 0;

  function updateActiveSlide() {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
  }

  function updateNavButtons() {
    if (prevBtn && nextBtn) {
      prevClone.classList.toggle('disabled', index === 0);
      nextClone.classList.toggle('disabled', index === slides.length - 1);
    }
  }

  function updateSlider() {
    prevTranslate = -index * slider.offsetWidth;
    slider.style.transform = `translateX(${prevTranslate}px)`;
    slider.style.transition = "transform 0.3s ease";
    updateActiveSlide();
    updateNavButtons();
    if (currentSlideEl) currentSlideEl.textContent = index + 1;
    if (totalSlidesEl) totalSlidesEl.textContent = slides.length;
  }

  let prevClone, nextClone;
  if (prevBtn && nextBtn) {
    prevClone = prevBtn.cloneNode(false);
    prevClone.innerHTML = prevBtn.innerHTML;

    nextClone = nextBtn.cloneNode(false);
    nextClone.innerHTML = nextBtn.innerHTML;

    prevBtn.replaceWith(prevClone);
    nextBtn.replaceWith(nextClone);

    prevClone.addEventListener('click', () => {
      if (index > 0) {
        index--;
        updateSlider();
      }
    });

    nextClone.addEventListener('click', () => {
      if (index < slides.length - 1) {
        index++;
        updateSlider();
      }
    });
  }

  // Touch support
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let isHorizontal = false;
  let currentTranslate = 0;
  let prevTranslate = 0;

  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
    isHorizontal = false;

    slider.style.transition = "none";
  }, { passive: true });

  slider.addEventListener('touchmove', (e) => {
    if (!isDragging) return;

    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;

    if (!isHorizontal && Math.abs(deltaX) > Math.abs(deltaY)) {
      isHorizontal = true;
    }

    if (isHorizontal) {
      e.preventDefault();
      currentTranslate = prevTranslate + deltaX;
      slider.style.transform = `translateX(${currentTranslate}px)`;
    }
  }, { passive: false });

  slider.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;

    const deltaX = e.changedTouches[0].clientX - startX;

    slider.style.transition = "transform 0.3s ease";

    if (isHorizontal && Math.abs(deltaX) > 50) {
      if (deltaX < 0 && index < slides.length - 1) index++;
      else if (deltaX > 0 && index > 0) index--;
    }

    updateSlider();
    prevTranslate = -index * slider.offsetWidth;
    isHorizontal = false;
  });

  updateSlider();
  window.addEventListener('resize', updateSlider);
}

/* =================================
   Pixel Overlay
================================= */

function buildPixelGrid(container, fixedCols = 10, fixedRows = 10) {
  const grid = container.querySelector('.pixel-grid');
  if (!grid || grid.dataset.built === 'true') return;

  const width = container.offsetWidth;
  const height = container.offsetHeight;
  if (width === 0 || height === 0) return false;

  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${fixedCols}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${fixedRows}, 1fr)`;

  grid.innerHTML = '';

  for (let i = 0; i < fixedCols * fixedRows; i++) {
    const square = document.createElement('div');
    square.classList.add('pixel-square');
    grid.appendChild(square);
  }

  grid.dataset.built = 'true';
  return true;
}

function setupPixelReveal(container) {
  if (buildPixelGrid(container)) return;

  const resizeObserver = new ResizeObserver(() => {
    if (buildPixelGrid(container)) {
      resizeObserver.disconnect();
    }
  });

  resizeObserver.observe(container);
}

function fadeOutPixels(container) {
  const grid = container.querySelector('.pixel-grid');
  
  if (!grid) return;

  const squares = grid.querySelectorAll('.pixel-square');
  let completed = 0;

  squares.forEach(square => {
    const delay = Math.random() * 300;
    setTimeout(() => {
      square.classList.add('fade-out');
      square.addEventListener('transitionend', () => {
        completed++;
        if (completed === squares.length) {
          grid.remove();
        }
      }, { once: true });
    }, delay);
  });
}

function observePixelReveals() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        fadeOutPixels(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3,
  });

  document.querySelectorAll('.pixel-reveal').forEach(el => observer.observe(el));
}

/* =================================
    Video Play on Scroll
================================= */

function videoPlay() {
  const videos = document.querySelectorAll('video[autoplay]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play();
      } else {
        video.pause();
      }
    });
  }, {
    threshold: 0.5
  });

  videos.forEach(video => observer.observe(video));
}

/* =================================
    Contact Button Email Copy
================================= */

function contactBtn() {
  document.querySelectorAll('.contact-btn').forEach(btn => {
    const email = 'mccaffrey.nolan@gmail.com';

    function copyEmail() {
      if (btn.classList.contains('copied')) return;

      navigator.clipboard.writeText(email).then(() => {
        btn.classList.add('copied');

        setTimeout(() => {
          btn.classList.remove('copied');
        }, 5000);
      });
    }

    btn.addEventListener('click', copyEmail);
    btn.addEventListener('touchend', e => {
      e.preventDefault(); 
      copyEmail();
    }, { passive: false });
  });
}

/* =================================
    Cursor Label on Work Slider
================================= */

function cursorLabel() {
  const label = document.getElementById('cursorLabel');
  const targets = document.querySelectorAll('.cursor--label');

  const canHover = window.matchMedia('(hover: hover)').matches;
  if (!canHover) return; 

  document.addEventListener('mousemove', e => {
    label.style.left = `${e.clientX + 10}px`;
    label.style.top = `${e.clientY + 10}px`;
  });

  targets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      label.style.opacity = 1;
    });
    el.addEventListener('mouseleave', () => {
      label.style.opacity = 0;
    });
  });
}

/* =================================
    Video Play / Pause Button
================================= */

function videoToggle() {
  document.querySelectorAll('.pixel-reveal').forEach(wrapper => {
    const video = wrapper.querySelector('.video');
    const toggleButton = wrapper.querySelector('.video-toggle');

    if (!video || !toggleButton) return;

    const playIcon = toggleButton.querySelector('.icon-play');
    const pauseIcon = toggleButton.querySelector('.icon-pause');

    if (!playIcon || !pauseIcon) return;

    toggleButton.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
      } else {
        video.pause();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
      }
    });
  });
}

/* =================================
    Pixel Cursor
================================= */

function pixelCursor() {
  const isTouchOnly = window.matchMedia('(pointer: coarse)').matches;
  if (isTouchOnly) return;

  const grid = document.querySelector('.cursor-grid');
  if (!grid || grid.dataset.built === 'true') return;

  // Responsive column count
  let cols;
  if (window.innerWidth <= 480) {
    cols = 12;
  } else if (window.innerWidth <= 768) {
    cols = 20;
  } else {
    cols = 35;
  }

  const squareSize = window.innerWidth / cols;
  const rows = Math.ceil(window.innerHeight / squareSize);

  grid.style.setProperty('--cols', cols);
  grid.style.setProperty('--rows', rows);
  grid.style.pointerEvents = 'none';
  grid.dataset.built = 'true';

  const squares = [];
  const squareRects = [];
  let lastHoveredIndex = -1;

  for (let i = 0; i < cols * rows; i++) {
    const square = document.createElement('div');
    square.classList.add('cursor-square');
    grid.appendChild(square);
    squares.push(square);
  }

  function cacheRects() {
    squares.forEach((square, index) => {
      const rect = square.getBoundingClientRect();
      squareRects[index] = {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom
      };
    });
  }

  // Cache once initially
  requestAnimationFrame(cacheRects);

  // Re-cache on resize with debounce
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      cacheRects();
    }, 200);
  });

  // Track cursor
  let lastMove = 0;
  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastMove < 16) return;
    lastMove = now;

    const { clientX, clientY } = e;

    for (let i = 0; i < squares.length; i++) {
      const rect = squareRects[i];
      if (!rect) continue;

      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        if (lastHoveredIndex !== i) {
          const square = squares[i];
          square.style.opacity = 1;

          clearTimeout(square.fadeTimeout);
          square.fadeTimeout = setTimeout(() => {
            square.style.opacity = 0;
          }, 300);

          lastHoveredIndex = i;
        }
        break;
      }
    }
  });
}

/* =================================
    AJAX Call
================================= */

function setupAjaxNavigation() {
  const contentEl = document.querySelector('#content');

  document.addEventListener('click', e => {
    const link = e.target.closest('a[data-link]');
    if (!link) return;

    const url = link.href;
    const hash = url.includes('#') ? url.split('#')[1] : null;

    const currentUrl = normalizeUrl(window.location.href);
    const linkUrl = normalizeUrl(url);

    e.preventDefault();

    if (linkUrl === currentUrl && hash) {
      e.preventDefault();
      const targetEl = document.getElementById(hash);

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      } else if (hash === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    loadPage(url);
    history.pushState(null, '', url);
  });

  window.addEventListener('popstate', () => {
    loadPage(location.href);
  });

  function normalizeUrl(url) {
    const a = document.createElement('a');
    a.href = url;
    return a.protocol + '//' + a.host + a.pathname.replace(/\/index\.html$/, '/');
  }

  async function loadPage(url) {
    const fadeDuration = 1;
    contentEl.classList.add('fade-out');
    await new Promise(resolve => setTimeout(resolve, fadeDuration));

    const res = await fetch(url);
    const html = await res.text();
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, 'text/html');

    const newContent = newDoc.querySelector('#content');
    contentEl.innerHTML = newContent.innerHTML;
    contentEl.classList.remove('fade-out');

    updateHead(newDoc);

    if (typeof lenis !== 'undefined') {
      lenis.scrollTo(0, { immediate: true });
    }

    initAnimations();

    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const hash = url.substring(hashIndex + 1);
      const targetEl = document.getElementById(hash);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function updateHead(newDoc) {
    const newHead = newDoc.head;
    const currentHead = document.head;

    const selectorsToReplace = [
      'title',
      'meta[name="description"]',
      'meta[name="application-name"]',
      'link[rel="canonical"]',
      'link[rel="preload"]',
      'meta[property^="og:"]',
      'meta[name^="twitter:"]'
    ];

    selectorsToReplace.forEach(selector => {

      currentHead.querySelectorAll(selector).forEach(el => el.remove());

      newHead.querySelectorAll(selector).forEach(newEl => {
        currentHead.appendChild(newEl.cloneNode(true));
      });
    });

    const newBodyId = newDoc.body.id;
    if (newBodyId) document.body.id = newBodyId;
  }
}

/* =================================
   Document Ready Initialization
================================= */

document.addEventListener('DOMContentLoaded', () => {
  loader();
  initComponents();
  setupAjaxNavigation();

  loadFooter()
    .then(() => {
      hoverBlurFooter();
      setActiveLink('.footer__nav');
    })
    .catch(err => console.error('Failed to load footer:', err));
  
  loadHeader()
    .then(() => {
      requestAnimationFrame(() => {
        initHeaderComponents();
        initAnimations();
      });
    })
    .catch(err => console.error('Failed to load header:', err));
});

function loadHeader() {
  return fetch('/utilities/header.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('header').innerHTML = html;
    });
}

function loadFooter() {
  return fetch('/utilities/footer.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('footer').innerHTML = html;
    });
}

function initComponents() {
  lenisScroll();
  fadeHero();
}

function initHeaderComponents() {
  menuToggle();
  setActiveLink('#main-menu');
  toggleTheme();
  contactBtn();
  hoverBlurHeader();
}

/* =================================
    Preserve Animations
================================= */ 

function initAnimations() {
  fadeInElements();
  blurScrollEffect();
  workSlider();
  hoverBlurGlobal();
  cursorLabel();
  nextProj();
  videoToggle();
  hoverImage();
  staggerFade();
  document.querySelectorAll('.pixel-reveal').forEach(setupPixelReveal);
  observePixelReveals();
  videoPlay();
  pixelCursor();

  const label = document.getElementById('cursorLabel');
  if (label) label.style.opacity = 0;
  
  if (typeof lenis !== 'undefined') {
    lenis.resize();
    requestAnimationFrame(time => lenis.raf(time));
  }

  if (document.body.id === 'homepage') {
    runFillCircleWithLoaderCheck();
  }

}  

/* =================================
   Page Load Animations Init
================================= */

window.addEventListener('load', () => {
  Promise.all([
    document.fonts.ready,
    new Promise(r => requestAnimationFrame(r)),
    new Promise(r => setTimeout(r, 150))
  ]).then(() => {
    document.body.classList.remove('body-loading');
  });
});