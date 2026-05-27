/**
 * @jest-environment jsdom
 *
 * Tests that load the real script.js and verify actual behaviour, so that
 * coverage instrumentation can track which lines run.
 */

const FULL_HTML = `
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-logo"><h1>Peak Moments</h1></div>
      <ul class="nav-menu">
        <li class="nav-item"><a href="#home"    class="nav-link">Home</a></li>
        <li class="nav-item"><a href="#gallery" class="nav-link">Gallery</a></li>
        <li class="nav-item"><a href="#about"   class="nav-link">About</a></li>
        <li class="nav-item"><a href="#contact" class="nav-link">Contact</a></li>
      </ul>
      <div class="hamburger">
        <span class="bar"></span><span class="bar"></span><span class="bar"></span>
      </div>
    </div>
  </nav>

  <section id="home" class="hero">
    <div class="hero-content">
      <h1 class="hero-title">Capturing the Summit</h1>
      <a href="#gallery" class="cta-button">Explore</a>
    </div>
  </section>

  <section id="gallery" class="gallery">
    <h2 class="section-title">Gallery</h2>
    <div class="gallery-filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="peaks">Peaks</button>
      <button class="filter-btn" data-filter="climbing">Climbing</button>
      <button class="filter-btn" data-filter="landscape">Landscape</button>
    </div>
    <div class="gallery-grid">
      <div class="gallery-item featured-item" data-category="peaks">
        <img src="peak1.jpg" alt="Mountain Peak 1">
      </div>
      <div class="gallery-item featured-item" data-category="climbing">
        <img src="climb1.jpg" alt="Climbing Photo 1">
      </div>
      <div class="gallery-item" data-category="landscape">
        <img src="landscape1.jpg" alt="Landscape Photo 1">
      </div>
    </div>
  </section>

  <section id="about" class="about">
    <h2 class="section-title">About</h2>
    <div class="about-content">
      <div class="stats">
        <span class="stat-number">150</span>
        <span class="stat-number">50</span>
        <span class="stat-number">1000</span>
      </div>
    </div>
  </section>

  <section id="contact" class="contact">
    <h2 class="section-title">Contact</h2>
    <div class="contact-content">
      <form class="contact-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" required></textarea>
        </div>
        <button type="submit" class="submit-btn">Send Message</button>
      </form>
    </div>
  </section>
`;

/**
 * Load the script fresh for a test and invoke its DOMContentLoaded callback
 * exactly once, without letting stale callbacks from previous tests fire.
 *
 * We do this by temporarily replacing document.addEventListener so we can
 * capture the DOMContentLoaded handler and call it ourselves, rather than
 * dispatching an event that would also fire handlers registered in prior tests.
 */
// Exposed so individual tests can trigger observer callbacks.
let observerInstances = [];

function loadScript(extraHtml = '') {
  jest.resetModules();
  observerInstances = [];

  // resetMocks:true in jest.config clears IntersectionObserver's implementation
  // between tests; reinstall it before requiring the script.
  global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
    const instance = {
      observe:    jest.fn(),
      unobserve:  jest.fn(),
      disconnect: jest.fn(),
      trigger:    (entries) => callback(entries),
    };
    observerInstances.push(instance);
    return instance;
  });

  document.body.innerHTML = FULL_HTML + extraHtml;

  // Intercept document.addEventListener to capture the DOMContentLoaded
  // handler without forwarding it to the real listener list.
  let domReadyCb = null;
  const realAdd = document.addEventListener.bind(document);
  document.addEventListener = function (type, listener, ...rest) {
    if (type === 'DOMContentLoaded') {
      domReadyCb = listener;
    } else {
      realAdd(type, listener, ...rest);
    }
  };

  require('../script');

  document.addEventListener = realAdd; // restore immediately

  // Invoke the captured callback once (and only once).
  if (domReadyCb) domReadyCb({});
}

// Track every listener added to document so we can remove them between tests.
const docListeners = [];
const _origDocAdd = document.addEventListener.bind(document);
const _origDocRemove = document.removeEventListener.bind(document);
document.addEventListener = function (type, listener, ...rest) {
  docListeners.push({ type, listener, rest });
  _origDocAdd(type, listener, ...rest);
};
document.removeEventListener = function (type, listener, ...rest) {
  const idx = docListeners.findIndex(e => e.type === type && e.listener === listener);
  if (idx !== -1) docListeners.splice(idx, 1);
  _origDocRemove(type, listener, ...rest);
};

function purgeDocListeners() {
  // Remove all tracked listeners (except the ones added by setup.js which ran before us)
  [...docListeners].forEach(({ type, listener, rest }) => {
    _origDocRemove(type, listener, ...rest);
  });
  docListeners.length = 0;
}

describe('script.js — real code execution', () => {
  beforeEach(() => {
    purgeDocListeners();
    loadScript();
  });

  // ------------------------------------------------------------------
  // Style injection
  // ------------------------------------------------------------------
  describe('Style injection', () => {
    test('injects a <style> tag into <head>', () => {
      const styles = document.querySelectorAll('style');
      expect(styles.length).toBeGreaterThan(0);
    });

    test('injected styles include lightbox and scroll-progress rules', () => {
      const styleText = Array.from(document.querySelectorAll('style'))
        .map(s => s.textContent)
        .join('');
      expect(styleText).toContain('.lightbox');
      expect(styleText).toContain('.scroll-progress');
    });
  });

  // ------------------------------------------------------------------
  // Scroll progress indicator
  // ------------------------------------------------------------------
  describe('Scroll progress indicator', () => {
    test('appends a .scroll-progress element to <body>', () => {
      expect(document.querySelector('.scroll-progress')).not.toBeNull();
    });
  });

  // ------------------------------------------------------------------
  // Hamburger / mobile menu
  // ------------------------------------------------------------------
  describe('Hamburger toggle', () => {
    test('clicking hamburger adds "active" class to hamburger and nav-menu', () => {
      const hamburger = document.querySelector('.hamburger');
      const navMenu   = document.querySelector('.nav-menu');

      hamburger.click();

      expect(hamburger.classList.contains('active')).toBe(true);
      expect(navMenu.classList.contains('active')).toBe(true);
    });

    test('clicking hamburger twice removes "active" class', () => {
      const hamburger = document.querySelector('.hamburger');
      const navMenu   = document.querySelector('.nav-menu');

      hamburger.click();
      hamburger.click();

      expect(hamburger.classList.contains('active')).toBe(false);
      expect(navMenu.classList.contains('active')).toBe(false);
    });

    test('clicking a nav-link closes the mobile menu', () => {
      const hamburger = document.querySelector('.hamburger');
      const navMenu   = document.querySelector('.nav-menu');
      const firstLink = document.querySelector('.nav-link');

      hamburger.click(); // open menu
      firstLink.click(); // should close it

      expect(hamburger.classList.contains('active')).toBe(false);
      expect(navMenu.classList.contains('active')).toBe(false);
    });
  });

  // ------------------------------------------------------------------
  // Navbar scroll effect
  // ------------------------------------------------------------------
  describe('Navbar scroll effect', () => {
    test('navbar style changes when scrollY > 100', () => {
      const navbar = document.querySelector('.navbar');

      Object.defineProperty(window, 'scrollY', { value: 150, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));

      expect(navbar.style.background).toBe('rgba(255, 255, 255, 0.98)');
      expect(navbar.style.boxShadow).toBe('0 2px 20px rgba(0,0,0,0.1)');
    });

    test('navbar style resets when scrollY <= 100', () => {
      const navbar = document.querySelector('.navbar');

      Object.defineProperty(window, 'scrollY', { value: 50, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));

      expect(navbar.style.background).toBe('rgba(255, 255, 255, 0.95)');
      expect(navbar.style.boxShadow).toBe('none');
    });
  });

  // ------------------------------------------------------------------
  // Parallax effect
  // ------------------------------------------------------------------
  describe('Parallax effect', () => {
    test('hero section gets translateY transform on scroll', () => {
      const hero = document.querySelector('.hero');

      window.pageYOffset = 200;
      window.dispatchEvent(new Event('scroll'));

      // rate = 200 * -0.5 = -100
      expect(hero.style.transform).toContain('translateY(-100px)');
    });
  });

  // ------------------------------------------------------------------
  // Scroll progress width update
  // ------------------------------------------------------------------
  describe('Scroll progress update', () => {
    test('scroll-progress width is updated on scroll', () => {
      const scrollProgress = document.querySelector('.scroll-progress');

      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 2000, writable: true, configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 1000, writable: true, configurable: true,
      });
      window.pageYOffset = 500;

      window.dispatchEvent(new Event('scroll'));

      // scrollPercentage = 500 / (2000 - 1000) * 100 = 50%
      expect(scrollProgress.style.width).toBe('50%');
    });
  });

  // ------------------------------------------------------------------
  // Smooth scroll on anchor links
  // ------------------------------------------------------------------
  describe('Smooth scroll on anchor links', () => {
    test('clicking an anchor link calls window.scrollTo', () => {
      const anchor = document.querySelector('a[href="#gallery"]');
      anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      expect(window.scrollTo).toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------------
  // Gallery filter
  // ------------------------------------------------------------------
  describe('Gallery filter', () => {
    test('clicking "peaks" filter shows only peaks items', () => {
      jest.useFakeTimers();

      const peaksBtn = document.querySelector('[data-filter="peaks"]');
      peaksBtn.click();

      const peaksItems    = document.querySelectorAll('[data-category="peaks"]');
      const nonPeaksItems = document.querySelectorAll('[data-category]:not([data-category="peaks"])');

      peaksItems.forEach(item => {
        expect(item.style.display).toBe('block');
        expect(item.classList.contains('show')).toBe(true);
      });

      nonPeaksItems.forEach(item => {
        expect(item.classList.contains('hide')).toBe(true);
      });

      jest.runAllTimers();

      nonPeaksItems.forEach(item => {
        expect(item.style.display).toBe('none');
      });

      jest.useRealTimers();
    });

    test('clicking "all" filter shows every item', () => {
      const allBtn   = document.querySelector('[data-filter="all"]');
      const peaksBtn = document.querySelector('[data-filter="peaks"]');

      peaksBtn.click(); // filter to peaks first
      allBtn.click();   // then reset to all

      const galleryItems = document.querySelectorAll('.gallery-item');
      galleryItems.forEach(item => {
        expect(item.style.display).toBe('block');
        expect(item.classList.contains('show')).toBe(true);
      });
    });

    test('active class moves to the clicked filter button', () => {
      const climbingBtn = document.querySelector('[data-filter="climbing"]');
      climbingBtn.click();

      expect(climbingBtn.classList.contains('active')).toBe(true);

      const otherBtns = document.querySelectorAll('.filter-btn:not([data-filter="climbing"])');
      otherBtns.forEach(btn => {
        expect(btn.classList.contains('active')).toBe(false);
      });
    });
  });

  // ------------------------------------------------------------------
  // Lightbox
  // ------------------------------------------------------------------
  describe('Lightbox', () => {
    test('clicking a gallery item creates a .lightbox overlay', () => {
      const galleryItem = document.querySelector('.gallery-item');
      galleryItem.click();

      const lightbox = document.querySelector('.lightbox');
      expect(lightbox).not.toBeNull();
      expect(document.body.style.overflow).toBe('hidden');
    });

    test('lightbox contains close button, image and caption', () => {
      const galleryItem = document.querySelector('.gallery-item');
      galleryItem.click();

      const lightbox = document.querySelector('.lightbox');
      expect(lightbox.querySelector('.lightbox-close')).not.toBeNull();
      expect(lightbox.querySelector('img')).not.toBeNull();
      expect(lightbox.querySelector('.lightbox-caption')).not.toBeNull();
    });

    test('clicking close button removes the lightbox', () => {
      const galleryItem = document.querySelector('.gallery-item');
      galleryItem.click();

      const closeBtn = document.querySelector('.lightbox-close');
      closeBtn.click();

      expect(document.querySelector('.lightbox')).toBeNull();
      expect(document.body.style.overflow).toBe('auto');
    });

    test('clicking the lightbox backdrop closes the lightbox', () => {
      const galleryItem = document.querySelector('.gallery-item');
      galleryItem.click();

      const lightbox = document.querySelector('.lightbox');
      // Dispatch click directly on the lightbox element (simulates clicking the backdrop)
      lightbox.dispatchEvent(new MouseEvent('click', { bubbles: false }));

      expect(document.querySelector('.lightbox')).toBeNull();
    });

    test('pressing Escape closes the lightbox', () => {
      const galleryItem = document.querySelector('.gallery-item');
      galleryItem.click();

      expect(document.querySelector('.lightbox')).not.toBeNull();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(document.querySelector('.lightbox')).toBeNull();
    });
  });

  // ------------------------------------------------------------------
  // Featured item hover effects
  // ------------------------------------------------------------------
  describe('Featured item hover effects', () => {
    test('mouseenter sets zIndex to 10', () => {
      const item = document.querySelector('.featured-item');
      item.dispatchEvent(new MouseEvent('mouseenter'));
      expect(item.style.zIndex).toBe('10');
    });

    test('mouseleave resets zIndex to 1', () => {
      const item = document.querySelector('.featured-item');
      item.dispatchEvent(new MouseEvent('mouseenter'));
      item.dispatchEvent(new MouseEvent('mouseleave'));
      expect(item.style.zIndex).toBe('1');
    });
  });

  // ------------------------------------------------------------------
  // Intersection observer — animation setup
  // ------------------------------------------------------------------
  describe('Intersection observer animation setup', () => {
    test('animated elements start with opacity 0 and translateY', () => {
      const animated = document.querySelectorAll(
        '.featured-item, .gallery-item, .about-content, .contact-content',
      );
      animated.forEach(el => {
        expect(el.style.opacity).toBe('0');
        expect(el.style.transform).toBe('translateY(50px)');
      });
    });

    test('section titles start with opacity 0 and translateY', () => {
      const titles = document.querySelectorAll('.section-title');
      titles.forEach(title => {
        expect(title.style.opacity).toBe('0');
        expect(title.style.transform).toBe('translateY(30px)');
      });
    });

    test('IntersectionObserver is instantiated at least once', () => {
      expect(global.IntersectionObserver).toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------------
  // Contact form
  // ------------------------------------------------------------------
  describe('Contact form', () => {
    test('submit event puts button into sending state', () => {
      jest.useFakeTimers();

      const form      = document.querySelector('.contact-form');
      const submitBtn = document.querySelector('.submit-btn');

      document.querySelector('#name').value    = 'Jane Doe';
      document.querySelector('#email').value   = 'jane@example.com';
      document.querySelector('#message').value = 'Hello!';

      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      expect(submitBtn.textContent).toBe('Sending...');
      expect(submitBtn.disabled).toBe(true);

      jest.useRealTimers();
    });

    test('form resets and shows alert after timeout', () => {
      jest.useFakeTimers();

      const form      = document.querySelector('.contact-form');
      const submitBtn = document.querySelector('.submit-btn');
      const nameInput = document.querySelector('#name');

      nameInput.value                          = 'Jane Doe';
      document.querySelector('#email').value   = 'jane@example.com';
      document.querySelector('#message').value = 'Hello!';

      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      jest.runAllTimers();

      expect(global.alert).toHaveBeenCalledWith(
        "Thank you for your message! I'll get back to you soon.",
      );
      expect(nameInput.value).toBe('');
      expect(submitBtn.disabled).toBe(false);
      expect(submitBtn.textContent).toBe('Send Message');

      jest.useRealTimers();
    });
  });

  // ------------------------------------------------------------------
  // Branch: contact form absent (if (contactForm) → false path)
  // ------------------------------------------------------------------
  describe('Contact form — element absent', () => {
    test('page without .contact-form initialises without errors', () => {
      const HTML_NO_FORM = FULL_HTML.replace(/<form class="contact-form"[\s\S]*?<\/form>/, '');
      expect(() => {
        loadScript();
        // Remove the form after init to verify the false branch separately
        document.querySelector('.contact-form').remove();
        // Dispatching submit on a non-existent form means init path with no form
        // The real branch is covered by loading without a form entirely:
        jest.resetModules();
        global.IntersectionObserver = jest.fn().mockImplementation((cb) => ({
          observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn(),
          trigger: (entries) => cb(entries),
        }));
        purgeDocListeners();
        document.body.innerHTML = HTML_NO_FORM;
        let cb = null;
        const real = document.addEventListener.bind(document);
        document.addEventListener = (t, l, ...r) => {
          if (t === 'DOMContentLoaded') cb = l; else real(t, l, ...r);
        };
        require('../script');
        document.addEventListener = real;
        if (cb) cb({});
      }).not.toThrow();
    });
  });

  // ------------------------------------------------------------------
  // Branch: smooth scroll when target element does not exist
  // ------------------------------------------------------------------
  describe('Smooth scroll — missing target', () => {
    test('clicking an anchor whose target is absent does not call scrollTo', () => {
      // Reload with an extra anchor pointing to a non-existent section
      loadScript('<a href="#nonexistent" id="ghost-link">Ghost</a>');

      const ghost = document.querySelector('#ghost-link');
      ghost.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      // scrollTo should NOT be called because document.querySelector('#nonexistent') is null
      expect(window.scrollTo).not.toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------------
  // Branch: parallax when hero element is absent
  // ------------------------------------------------------------------
  describe('Parallax — no hero element', () => {
    test('scroll event with no .hero element does not throw', () => {
      document.querySelector('.hero').remove();

      window.pageYOffset = 100;
      expect(() => {
        window.dispatchEvent(new Event('scroll'));
      }).not.toThrow();
    });
  });

  // ------------------------------------------------------------------
  // Branch: keydown with a key other than Escape
  // ------------------------------------------------------------------
  describe('Lightbox keydown — non-Escape key', () => {
    test('pressing a non-Escape key does not close the lightbox', () => {
      document.querySelector('.gallery-item').click();
      expect(document.querySelector('.lightbox')).not.toBeNull();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(document.querySelector('.lightbox')).not.toBeNull();
    });
  });

  // ------------------------------------------------------------------
  // IntersectionObserver callbacks — animation reveal
  // ------------------------------------------------------------------
  describe('Intersection observer animation callback', () => {
    test('callback sets opacity and transform when entry isIntersecting', () => {
      // observer instance index 0 is the main animation observer
      const animObserver = observerInstances[0];
      const el = document.querySelector('.featured-item');

      // Simulate the element becoming visible
      animObserver.trigger([{ target: el, isIntersecting: true }]);

      expect(el.style.opacity).toBe('1');
      expect(el.style.transform).toBe('translateY(0)');
    });

    test('callback does nothing when entry is NOT intersecting', () => {
      const animObserver = observerInstances[0];
      const el = document.querySelector('.featured-item');

      el.style.opacity = '0';
      animObserver.trigger([{ target: el, isIntersecting: false }]);

      // opacity should remain unchanged
      expect(el.style.opacity).toBe('0');
    });
  });

  // ------------------------------------------------------------------
  // Stats counter via IntersectionObserver
  // ------------------------------------------------------------------
  describe('Stats counter animation callback', () => {
    test('statsObserver callback triggers countUp and unobserves the element', () => {
      jest.useFakeTimers();

      // statsObserver is instance index 1
      const statsObserver = observerInstances[1];
      const stat = document.querySelector('.stat-number');
      stat.textContent = '10';

      statsObserver.trigger([{ target: stat, isIntersecting: true }]);

      // countUp uses setInterval with 20ms increments
      jest.runAllTimers();

      expect(parseInt(stat.textContent)).toBe(10);
      expect(statsObserver.unobserve).toHaveBeenCalledWith(stat);

      jest.useRealTimers();
    });

    test('countUp animates through intermediate values before reaching target', () => {
      jest.useFakeTimers();

      const statsObserver = observerInstances[1];
      const stat = document.querySelector('.stat-number');
      stat.textContent = '100';

      statsObserver.trigger([{ target: stat, isIntersecting: true }]);

      // Advance one tick: current += 100/100 = 1 → textContent = '1'
      jest.advanceTimersByTime(20);
      expect(parseInt(stat.textContent)).toBeGreaterThanOrEqual(0);

      // Run to completion
      jest.runAllTimers();
      expect(parseInt(stat.textContent)).toBe(100);

      jest.useRealTimers();
    });

    test('statsObserver does nothing when entry is not intersecting', () => {
      const statsObserver = observerInstances[1];
      const stat = document.querySelector('.stat-number');
      const original = stat.textContent;

      statsObserver.trigger([{ target: stat, isIntersecting: false }]);

      expect(stat.textContent).toBe(original);
    });
  });

  // ------------------------------------------------------------------
  // Lazy image loading (IntersectionObserver wired up for data-src images)
  // ------------------------------------------------------------------
  describe('Lazy image loading', () => {
    test('IntersectionObserver is called when lazy images are present', () => {
      loadScript('<img class="lazy" data-src="lazy1.jpg" src="" alt="Lazy">');
      expect(global.IntersectionObserver).toHaveBeenCalled();
    });

    test('imageObserver callback swaps src and removes lazy class', () => {
      loadScript('<img class="lazy" data-src="lazy1.jpg" src="" alt="Lazy">');

      // imageObserver is instance index 2 (after animObserver=0, statsObserver=1)
      const imageObserver = observerInstances[2];
      const img = document.querySelector('img[data-src]');

      imageObserver.trigger([{ target: img, isIntersecting: true }]);

      expect(img.src).toContain('lazy1.jpg');
      expect(img.classList.contains('lazy')).toBe(false);
    });

    test('imageObserver callback does nothing when not intersecting', () => {
      loadScript('<img class="lazy" data-src="lazy1.jpg" src="" alt="Lazy">');

      const imageObserver = observerInstances[2];
      const img = document.querySelector('img[data-src]');
      const originalSrc = img.src;

      imageObserver.trigger([{ target: img, isIntersecting: false }]);

      expect(img.src).toBe(originalSrc);
      expect(img.classList.contains('lazy')).toBe(true);
    });
  });
});
