/* =================================
   Lenis Scroll
================================= */ 

let resizeTimeout;
const lenis = new Lenis({
  duration: 1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  smoothTouch: false,
});

function lenisScroll() {
  function raf(time) {
    if (!document.body.classList.contains('ov-hidden')) {
      lenis.raf(time);
    }
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

function refreshLenis() {
  clearTimeout(resizeTimeout); // Cancel previous resize calls
  resizeTimeout = setTimeout(() => {
    requestAnimationFrame(() => {
      lenis.resize(); // Recalculate dimensions inside requestAnimationFrame for smoother transitions
    });
  }, 300); // Adjust delay as needed
}

// Refresh Lenis when the page fully loads
window.addEventListener("load", refreshLenis);

/* =================================
   Main Menu Link Hover Opacity
================================= */ 

function setActiveLink() {
  if (window.innerWidth <= 992) return;

  const links = document.querySelectorAll('#main-menu a');

  const applyOpacity = (hoveredLink = null) => {
    links.forEach(link => {
      link.style.opacity =
        hoveredLink ? (link === hoveredLink ? '1' : '0.3') : '1';
    });
  };

  // Attach hover events
  links.forEach(link => {
    link.addEventListener('mouseenter', () => applyOpacity(link));
    link.addEventListener('mouseleave', () => applyOpacity());
  });

  applyOpacity(); // Optional: Reset all on page load
}

setActiveLink();

/* =================================
    Preserve Animations
================================= */ 

function initAnimations() {

  function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top < window.innerHeight && 
    rect.bottom > 0 && 
    rect.left < window.innerWidth && 
    rect.right > 0 
  );
}

  /* =================================
 Fade In Elements On Scroll
================================= */ 

function fadeInElements() {
  const fadeInElements = document.querySelectorAll('.fade-blur, .fade-upNone');

  function onScroll() {
    fadeInElements.forEach(element => {
        if (isElementInViewport(element)) {
            element.classList.add('visible');
        }
    });
  }
  window.addEventListener('scroll', onScroll);
  onScroll();
}

  /* =================================
    Blur Letters on Fade In Scroll
  ================================= */ 

  function blurLetters() {
  const elements = document.querySelectorAll('.blur-scroll');

  function wrapTextNodes(node) {
    const fragment = document.createDocumentFragment();

    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '') {
        const parts = child.textContent.split(/(\s+)/); // keep spaces
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
        const wrappedChildren = wrapTextNodes(child);
        clone.appendChild(wrappedChildren);
        fragment.appendChild(clone);
      } else {
        fragment.appendChild(child.cloneNode(true)); // SVG or other
      }
    });

    return fragment;
  }

  elements.forEach(el => {
    const wrapped = wrapTextNodes(el);
    el.innerHTML = '';
    el.appendChild(wrapped);
  });

  // Observer for animation
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const textSpans = entry.target.querySelectorAll('span span');
        const svgWrapper = entry.target.querySelectorAll('.icon-wrapper');
        const allSpans = [...textSpans, ...svgWrapper];

        allSpans.forEach(span => {
          const delay = Math.random() * 700;
          setTimeout(() => {
            span.classList.add('visible');
          }, delay);
        });

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  elements.forEach(el => observer.observe(el));
}

  /* =================================
    Circle Grow
  ================================= */ 

  function circleGrow() {
  const circle = document.querySelector('.hero__round--bg-circle');
  const projects = document.querySelectorAll('.work__list--item');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  if (circle) observer.observe(circle);
  projects.forEach(project => observer.observe(project));
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
          const words = node.textContent.trim().split(/\s+/);
          words.forEach((word, index) => {
            const span = document.createElement('span');
            span.textContent = word;
            newContent.appendChild(span);
            if (index < words.length - 1) {
              newContent.appendChild(document.createTextNode(' '));
            }
          });
        } else {
          // Preserve any existing HTML elements (e.g. spans)
          newContent.appendChild(node.cloneNode(true));
        }
      });

      header.innerHTML = '';
      header.appendChild(newContent);

      const spans = header.querySelectorAll('span');

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            spans.forEach((span, i) => {
              span.style.transitionDelay = `${i * 100}ms`;
            });
            header.classList.add('visible');
            observer.unobserve(header);
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(header);
    });
  }

// function fadeBg() {
//   const sections = document.querySelectorAll('.fade-bg-section');

//   const observer = new IntersectionObserver(entries => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         entry.target.classList.add('visible');
//       }
//     });
//   }, {
//     threshold: 0.5 // Adjust for when it should trigger
//   });

//   sections.forEach(section => {
//     observer.observe(section);
//   });
// }

//   fadeBg();
  circleGrow();
  blurLetters();
  staggerFade();
  fadeInElements();
}  

document.addEventListener('DOMContentLoaded', () => {
  const contentEl = document.querySelector('#content');

  function normalizeUrl(url) {
    const a = document.createElement('a');
    a.href = url;
    let path = a.pathname.replace(/\/index\.html$/, '/');
    return a.protocol + '//' + a.host + path;
  }

  async function loadPage(url) {
  contentEl.classList.add('fade-out');
  await new Promise(resolve => setTimeout(resolve, 300));

  const res = await fetch(url);
  const html = await res.text();

  const parser = new DOMParser();
  const newDoc = parser.parseFromString(html, 'text/html');

  // Replace #content
  const newContent = newDoc.querySelector('#content');
  contentEl.innerHTML = newContent.innerHTML;
  contentEl.classList.remove('fade-out');

  // Update title
  const newTitle = newDoc.querySelector('title');
  if (newTitle) {
    document.title = newTitle.innerText;
  }

  // (Optional) Update meta description or other tags
  const newMetaDescription = newDoc.querySelector('meta[name="description"]');
  if (newMetaDescription) {
    let currentMeta = document.querySelector('meta[name="description"]');
    if (currentMeta) {
      currentMeta.setAttribute('content', newMetaDescription.getAttribute('content'));
    } else {
      document.head.appendChild(newMetaDescription.cloneNode(true));
    }
  }

    // Scroll to top by default
    window.scrollTo(0, 0);

    initAnimations();

    // After content loads, scroll to anchor if present
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const hash = url.substring(hashIndex + 1);
      const targetEl = document.getElementById(hash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('a[data-link]');
    if (!link) return;

    const url = link.href;
    const hash = url.includes('#') ? url.split('#')[1] : null;

    const currentUrl = normalizeUrl(window.location.href);
    const linkUrl = normalizeUrl(url);

    if (linkUrl === currentUrl && hash) {
      e.preventDefault();
      const targetEl = document.getElementById(hash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    e.preventDefault();
    loadPage(url);
    history.pushState(null, '', url);
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    loadPage(location.href);
  });
});



// document.addEventListener('DOMContentLoaded', () => {
//   const parallaxElements = document.querySelectorAll('.parallax');
//   const visibleElements = new Set();

//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//       const el = entry.target;
//       if (entry.isIntersecting) {
//         visibleElements.add(el);
//       } else {
//         visibleElements.delete(el);
//       }
//     });
//   }, {
//     threshold: 0 // Trigger as soon as any part is visible
//   });

//   parallaxElements.forEach(el => observer.observe(el));

//   window.addEventListener('scroll', () => {
//     const scrollY = window.scrollY;

//     visibleElements.forEach(el => {
//       const speed = parseFloat(el.dataset.speed);
//       el.style.transform = `translateY(${scrollY * speed}px)`;
//     });
//   });
// });

/* Loader */

// document.addEventListener('DOMContentLoaded', () => {
//   const loader = document.getElementById('loader');
//   const loaderPercent = document.getElementById('loader-percent');
//   const content = document.getElementById('content');

//   let progress = 0;
//   const interval = setInterval(() => {
//     progress += 1;
//     loaderPercent.textContent = `${progress}%`;

//     if (progress >= 100) {
//       clearInterval(interval);

//       // Hide loader
//       loader.classList.add('hidden');

//       // Reveal content
//       content.style.opacity = 1;
//     }
//   }, 20); // 100 * 20ms = 2 seconds total load time
// });

/* =================================
   Blur Letters on Link Hover
================================= */ 

document.addEventListener('DOMContentLoaded', () => {
  const blurElements = document.querySelectorAll('.blur');

  blurElements.forEach(el => {
    const nodes = Array.from(el.childNodes);

    nodes.forEach(node => {
      // Skip if it's the SVG span or any existing span with children
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        (node.tagName === 'SPAN' || node.querySelector)
      ) return;

      // Wrap individual characters of text nodes
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
        const fragment = document.createDocumentFragment();

        node.textContent.split('').forEach(char => {
          const span = document.createElement('span');
          span.textContent = char;
          span.style.display = 'inline-block';
          fragment.appendChild(span);
        });

        el.replaceChild(fragment, node);
      }
    });

    // Add blur effect on hover
    el.addEventListener('mouseenter', () => {
      const spans = el.querySelectorAll('span');

      spans.forEach(span => {
        const delayOut = Math.random() * 150;
        const delayIn = 200 + Math.random() * 250;

        setTimeout(() => {
          span.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
          span.style.opacity = '0';
          span.style.filter = 'blur(4px)';
        }, delayOut);

        setTimeout(() => {
          span.style.transition = 'opacity 0.4s ease, filter 0.4s ease';
          span.style.opacity = '1';
          span.style.filter = 'blur(0)';
        }, delayIn);
      });
    });
  });
});



document.addEventListener('DOMContentLoaded', () => {
    // navCount();
    initAnimations();
    lenisScroll();
});



// const toggleBtn = document.getElementById('toggle-theme');
// const currentTheme = localStorage.getItem('theme');

// if (currentTheme) {
//   document.documentElement.setAttribute('data-theme', currentTheme);
// }

// toggleBtn.addEventListener('click', () => {
//   const current = document.documentElement.getAttribute('data-theme');
//   const newTheme = current === 'light' ? 'dark' : 'light';
//   document.documentElement.setAttribute('data-theme', newTheme);
//   localStorage.setItem('theme', newTheme);
// });



// class PageController {
//   constructor() {
//     gsap.registerPlugin(ScrollTrigger, CustomEase);
//     this.mm = gsap.matchMedia();
//   }

//   initPerPage() {
//     this.mm.add("(min-width: 769px)", () => {
//       this.initScrollAnimations();

//       // Debounced resize listener
//       let resizeTimeout;
//       window.addEventListener("resize", () => {
//         clearTimeout(resizeTimeout);
//         resizeTimeout = setTimeout(() => {
//           this.initScrollAnimations();
//         }, 100);
//       });
//     });

//     // Optional: global ScrollTrigger for another section
//     ScrollTrigger.create({
//       trigger: ".mwg_landing2",
//       start: "top top",
//       endTrigger: ".mwg_landing3",
//       end: "top bottom",
//       onEnter: () => this.handleScrollState("018"),
//       onEnterBack: () => this.handleScrollState("018"),
//       onLeaveBack: () => this.handleScrollState("046")
//     });

//     ScrollTrigger.refresh();
//   }

//   initScrollAnimations() {
//     const e = document.querySelector(".mwg_landing2");
//     const t = e.querySelector(".pin");
//     const o = e.querySelectorAll(".card");

//     if (!e || !t || o.length === 0) return;

//     ScrollTrigger.getAll().forEach(st => st.kill());
//     gsap.killTweensOf(o);

//     ScrollTrigger.create({
//       trigger: t,
//       start: "top top",
//       end: "bottom bottom",
//       pin: true,
//       pinSpacing: false,
//       scrub: true
//     });

//     gsap.set(o, {
//       yPercent: 50,
//       y: 0.5 * window.innerHeight + 1
//     });

//     const tl = gsap.timeline({
//       paused: false,
//       scrollTrigger: {
//         trigger: e,
//         start: "top top",
//         end: "bottom bottom",
//         scrub: true
//       }
//     });

//     tl.to(o, {
//       yPercent: -50,
//       y: -0.5 * window.innerHeight,
//       duration: 1,
//       stagger: -0.12,
//       ease: CustomEase.create("custom", "M0,0 C0,0 0.098,0.613 0.5,0.5 0.899,0.386 1,1 1,1")
//     }, "sameStep");

//     tl.to(o, {
//       rotation: () => 20 * (Math.random() - 0.5),
//       stagger: -0.12,
//       duration: 0.5,
//       ease: "power3.out"
//     }, "sameStep");

//     tl.to(o, {
//       rotation: 0,
//       stagger: -0.12,
//       duration: 0.5,
//       ease: "power3.in"
//     }, "sameStep+=0.5");

//     ScrollTrigger.refresh();
//   }

//   handleScrollState(code) {
//     console.log("Scroll state changed to:", code);
//     // You can replace this with real logic
//   }
// }

// // ✅ Instantiate and initialize
// const page = new PageController();
// page.initPerPage();


// gsap.registerPlugin(ScrollTrigger);

//     const section = document.querySelector('.scroll-section');
//     const items = section.querySelectorAll('.item');

//     // Hide all but first item
//     items.forEach((item, index) => {
//       if (index !== 0) {
//         gsap.set(item, { yPercent: 100 });
//       }
//     });

//     const timeline = gsap.timeline({
//       scrollTrigger: {
//         trigger: section,
//         start: "top top",
//         end: () => `+=${items.length * 100}%`,
//         scrub: true,
//         pin: true,
//         invalidateOnRefresh: true,
//         // markers: true,
//       },
//       defaults: { ease: "none" }
//     });

//     items.forEach((item, index) => {
//       timeline.to(item, {
//         scale: 0.95,
//         borderRadius: "10px"
//       });

//       if (index < items.length - 1) {
//         timeline.to(items[index + 1], {
//           yPercent: 0
//         }, "<");
//       }
//     });

//     // On resize, refresh ScrollTrigger properly
//     let resizeTimeout2;
//     window.addEventListener("resize", () => {
//       clearTimeout(resizeTimeout2);
//       const scrollPos = window.scrollY;
//       resizeTimeout2 = setTimeout(() => {
//         ScrollTrigger.refresh();
//         window.scrollTo(0, scrollPos);
//       }, 200);
//     });











// class PageController {
//   constructor() {
//     gsap.registerPlugin(ScrollTrigger);
//     this.mm = gsap.matchMedia();
//     this.stackedScrollTimeline = null; // Keep track of the timeline
//     this.resizeHandler = null;
//   }

//   initPerPage() {
//     // this.mm.add("(min-width: 769px)", () => {
//       this.initStackedScroll();

//       // Debounced resize listener
//       if (this.resizeHandler) {
//         window.removeEventListener("resize", this.resizeHandler);
//       }

//       this.resizeHandler = () => {
//         clearTimeout(this.resizeTimeout);
//         this.resizeTimeout = setTimeout(() => {
//           this.initStackedScroll();
//           ScrollTrigger.refresh();
//         }, 100);
//       };

//       window.addEventListener("resize", this.resizeHandler);
//     // });

//     ScrollTrigger.refresh();
//   }

//   initStackedScroll() {
//     const section = document.querySelector('.scroll-section');
//     const items = section?.querySelectorAll('.item');
//     if (!section || !items || items.length === 0) return;

//     // Kill previous ScrollTriggers and animations
//     ScrollTrigger.getAll().forEach(trigger => trigger.kill());
//     gsap.killTweensOf(items);

//     // Hide all but the first item
//     items.forEach((item, index) => {
//       gsap.set(item, {
//         yPercent: index === 0 ? 0 : 100,
//         autoAlpha: index === 0 ? 1 : 0
//       });
//     });

//     // Create timeline
//     const timeline = gsap.timeline({
//       scrollTrigger: {
//         trigger: section,
//         start: "top top",
//         end: () => `+=${items.length * 100}%`,
//         scrub: true,
//         pin: ".scroll-container", // 👈 important!
//         invalidateOnRefresh: true,
//       },
//       defaults: { ease: "none" }
//     });

//     // Animate through items
//     items.forEach((item, index) => {
//       timeline.to(item, {
//         scale: 0.95,
//         // top: "100px"
//         // borderRadius: "10px"
//       });

//       if (index < items.length - 1) {
//         timeline.to(items[index + 1], {
//           yPercent: 0,
//           autoAlpha: 1
//         }, "<");
//       }
//     });

//     // Save reference
//     this.stackedScrollTimeline = timeline;
//   }

//   // Optional: hook for tracking section state (not required but useful)
//   handleScrollState(code) {
//     console.log("Scroll state changed to:", code);
//   }
// }

// // ✅ Instantiate and initialize
// const page = new PageController();
// page.initPerPage();


const hoverImage = document.querySelector('.hover-image');
const hoverItems = document.querySelectorAll('.hover-item');

let currentHovered = null;
let hideTimeout = null;

hoverItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    currentHovered = item;

    // Clear any pending hide timeout because we're entering a new item
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    const imgSrc = item.dataset.img;
    if (imgSrc && hoverImage) {
      hoverImage.src = imgSrc;
      hoverImage.classList.add('visible');
    }
  });

  item.addEventListener('mousemove', (e) => {
    if (!hoverImage.classList.contains('visible')) return;

    const x = e.clientX;
    const y = e.clientY;

    const imageWidth = hoverImage.offsetWidth;
    const imageHeight = hoverImage.offsetHeight;

    hoverImage.style.left = `${x - imageWidth / 2}px`;
    hoverImage.style.top = `${y - imageHeight / 2}px`;
  });

  item.addEventListener('mouseleave', (e) => {
    // Use a short delay to check if the mouse entered another hover-item,
    // so the image doesn't flicker between items
    hideTimeout = setTimeout(() => {
      // If the mouse is not currently over any hover-item, hide image
      if (!document.querySelector('.hover-item:hover')) {
        hoverImage.classList.remove('visible');
        setTimeout(() => {
          hoverImage.src = '';
        }, 300);
        currentHovered = null;
      }
      hideTimeout = null;
    }, 50); // 50ms delay — adjust if necessary
  });
});




/* =================================
    Page Transition & Loader Setup
================================= */

// function createTransitionGrid(grid, squareSize) {
//   const cols = Math.ceil(window.innerWidth / squareSize);
//   const rows = Math.ceil(window.innerHeight / squareSize);
//   const total = cols * rows;

//   grid.style.gridTemplateColumns = `repeat(${cols}, ${squareSize}px)`;
//   grid.style.gridAutoRows = `${squareSize}px`;
//   grid.innerHTML = '';

//   for (let i = 0; i < total; i++) {
//     const square = document.createElement('div');
//     square.classList.add('square');
//     grid.appendChild(square);
//   }

//   return grid.querySelectorAll('.square');
// }


/* =================================
   Page Transition
================================= */

// function pageTransition(callback) {
//   const transition = document.querySelector('#page-transition');
//   const grid = transition.querySelector('.page-grid');
//   transition.classList.remove('hidden');

//   const squareSize = window.innerWidth <= 480 ? 60 : window.innerWidth <= 768 ? 100 : 120;
//   const cols = Math.ceil(window.innerWidth / squareSize);
//   const rows = Math.ceil(window.innerHeight / squareSize);
//   const totalSquares = cols * rows;

//   grid.style.gridTemplateColumns = `repeat(${cols}, ${squareSize}px)`;
//   grid.style.gridAutoRows = `${squareSize}px`;
//   grid.innerHTML = '';

//   for (let i = 0; i < totalSquares; i++) {
//     const square = document.createElement('div');
//     square.classList.add('square');
//     grid.appendChild(square);
//   }

//   const squares = grid.querySelectorAll('.square');
//   squares.forEach(square => {
//     const delay = Math.random() * 200;
//     setTimeout(() => square.classList.add('visible'), delay);
//   });

//   setTimeout(() => {
//     callback();

//     squares.forEach(square => {
//       const delay = Math.random() * 300;
//       setTimeout(() => square.classList.add('fade-out'), delay);
//     });

//     setTimeout(() => {
//       transition.classList.add('hidden');
//       grid.innerHTML = '';
//     }, 800);
//   }, 500);
// }



// Goes in AJAX request

  //   pageTransition(() => {
  //     loadPage(url);
  //     history.pushState(null, '', url);
  //   });
  // });

  // window.addEventListener('popstate', () => {
  //   pageTransition(() => loadPage(location.href));
  // });




  /* =================================
   Hide Header on Project Pages
================================= */

// function checkAndHideHeader() {
//   const header = document.getElementById('header');
//   const content = document.querySelector('#content');

//   if (!header || !content) return;

//   const shouldHide = content.dataset.hideHeader === 'true';
//   header.style.display = shouldHide ? 'none' : '';
// }


    // 👇 Header logic
    // const header = document.getElementById('header');
    // const hideHeader = newDoc.querySelector('#content')?.dataset.hideHeader;

    // if (hideHeader === 'true') {
    //   header.style.display = 'none';
    // } else {
    //   header.style.display = '';
    // }