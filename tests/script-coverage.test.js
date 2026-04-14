/**
 * @jest-environment jsdom
 *
 * Coverage tests for script.js – these tests use require() so Jest/Istanbul
 * instruments the file and real coverage numbers are generated.
 *
 * Strategy:
 *  1. Build the full page DOM that script.js expects.
 *  2. Re-establish the IntersectionObserver mock (setup.js clears all mocks
 *     between tests via jest.clearAllMocks()).
 *  3. Intercept document.addEventListener to capture the DOMContentLoaded
 *     callback before require() fires it, then call it immediately so the
 *     init block runs in a controlled way without accumulating stale listeners.
 *  4. Use jest.isolateModules() + jest.resetModules() so each test gets a
 *     fresh module execution, ensuring Istanbul tracks every path.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Observer mock helpers
// ─────────────────────────────────────────────────────────────────────────────

let observerInstances = [];

function resetObserverMock() {
  observerInstances = [];
  global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
    const instance = {
      observe:    jest.fn(),
      unobserve:  jest.fn(),
      disconnect: jest.fn(),
      _callback:  callback,
    };
    observerInstances.push(instance);
    return instance;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM factory
// ─────────────────────────────────────────────────────────────────────────────

function buildPageDOM() {
  document.head.innerHTML = '';
  document.body.innerHTML = `
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
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
      </div>
    </nav>

    <section id="home" class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Capturing the Summit</h1>
        <a href="#gallery" class="cta-button">Explore My Work</a>
      </div>
    </section>

    <section id="featured" class="featured">
      <div class="featured-item"><img src="f1.jpg" alt="Featured 1"></div>
      <div class="featured-item"><img src="f2.jpg" alt="Featured 2"></div>
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
        <div class="gallery-item" data-category="peaks">
          <img src="peak1.jpg" alt="Mountain Peak 1">
        </div>
        <div class="gallery-item" data-category="climbing">
          <img src="climb1.jpg" alt="Climbing Photo 1">
        </div>
        <div class="gallery-item" data-category="landscape">
          <img src="landscape1.jpg" alt="Landscape Photo 1">
        </div>
        <div class="gallery-item" data-category="peaks">
          <img src="peak2.jpg" alt="Mountain Peak 2">
        </div>
      </div>
    </section>

    <section id="about" class="about">
      <h2 class="section-title">About</h2>
      <div class="about-content">
        <div class="stats">
          <div class="stat"><span class="stat-number">150</span><span class="stat-label">Peaks</span></div>
          <div class="stat"><span class="stat-number">50</span><span class="stat-label">Countries</span></div>
          <div class="stat"><span class="stat-number">1000</span><span class="stat-label">Photos</span></div>
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
            <label for="subject">Subject</label>
            <input type="text" id="subject" name="subject" required>
          </div>
          <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" name="message" rows="5" required></textarea>
          </div>
          <button type="submit" class="submit-btn">Send Message</button>
        </form>
      </div>
    </section>

    <img data-src="lazy1.jpg" class="lazy" alt="Lazy image 1">
    <img data-src="lazy2.jpg" class="lazy" alt="Lazy image 2">
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Script loader
// Intercepts DOMContentLoaded so we control when init runs and avoid
// accumulating stale listeners across tests.
// ─────────────────────────────────────────────────────────────────────────────

function loadScript() {
  let domReadyCb = null;
  const origAdd = document.addEventListener.bind(document);

  // Capture DOMContentLoaded; forward all others
  document.addEventListener = (type, listener, ...rest) => {
    if (type === 'DOMContentLoaded') {
      domReadyCb = listener;
    } else {
      origAdd(type, listener, ...rest);
    }
  };

  jest.isolateModules(() => {
    require('../script.js');
  });

  // Restore and invoke synchronously
  document.addEventListener = origAdd;
  if (domReadyCb) domReadyCb();
}

// ─────────────────────────────────────────────────────────────────────────────
// Test suites
// ─────────────────────────────────────────────────────────────────────────────

describe('script.js – real code execution coverage', () => {

  beforeEach(() => {
    // setup.js runs jest.clearAllMocks() before this, which clears the
    // IntersectionObserver implementation.  Restore it here.
    resetObserverMock();
    buildPageDOM();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetModules();
    document.querySelectorAll('.lightbox, .scroll-progress').forEach(el => el.remove());
  });

  // ── Initialisation ─────────────────────────────────────────────────────────

  describe('Script initialisation', () => {
    test('injects additional CSS styles into <head>', () => {
      loadScript();
      const styleEl = document.head.querySelector('style');
      expect(styleEl).toBeTruthy();
      expect(styleEl.textContent).toContain('.lightbox');
      expect(styleEl.textContent).toContain('.scroll-progress');
    });

    test('creates a scroll-progress bar in <body>', () => {
      loadScript();
      expect(document.querySelector('.scroll-progress')).toBeTruthy();
    });
  });

  // ── Hamburger menu ─────────────────────────────────────────────────────────

  describe('Hamburger menu toggle', () => {
    test('adds "active" to hamburger and nav-menu on first click', () => {
      loadScript();
      const hamburger = document.querySelector('.hamburger');
      const navMenu   = document.querySelector('.nav-menu');

      hamburger.click();

      expect(hamburger.classList.contains('active')).toBe(true);
      expect(navMenu.classList.contains('active')).toBe(true);
    });

    test('removes "active" on second click (toggle off)', () => {
      loadScript();
      const hamburger = document.querySelector('.hamburger');
      const navMenu   = document.querySelector('.nav-menu');

      hamburger.click();
      hamburger.click();

      expect(hamburger.classList.contains('active')).toBe(false);
      expect(navMenu.classList.contains('active')).toBe(false);
    });

    test('clicking a nav-link collapses the open menu', () => {
      loadScript();
      const hamburger = document.querySelector('.hamburger');
      const navMenu   = document.querySelector('.nav-menu');
      const navLink   = document.querySelector('.nav-link');

      hamburger.click();
      navLink.click();

      expect(hamburger.classList.contains('active')).toBe(false);
      expect(navMenu.classList.contains('active')).toBe(false);
    });
  });

  // ── Navbar scroll effect ───────────────────────────────────────────────────

  describe('Navbar scroll effect', () => {
    test('changes navbar style when scrolled past 100 px', () => {
      loadScript();
      const navbar = document.querySelector('.navbar');

      Object.defineProperty(window, 'scrollY', { value: 150, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));

      expect(navbar.style.background).toBe('rgba(255, 255, 255, 0.98)');
      expect(navbar.style.boxShadow).toBe('0 2px 20px rgba(0,0,0,0.1)');
    });

    test('resets navbar style when scrolled back to top', () => {
      loadScript();
      const navbar = document.querySelector('.navbar');

      Object.defineProperty(window, 'scrollY', { value: 200, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));

      Object.defineProperty(window, 'scrollY', { value: 50, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));

      expect(navbar.style.background).toBe('rgba(255, 255, 255, 0.95)');
      expect(navbar.style.boxShadow).toBe('none');
    });
  });

  // ── Smooth scrolling ───────────────────────────────────────────────────────

  describe('Smooth scrolling', () => {
    test('calls window.scrollTo with smooth behaviour for anchor links', () => {
      loadScript();
      const homeSection = document.querySelector('#home');
      Object.defineProperty(homeSection, 'offsetTop', { value: 400, configurable: true });

      const anchor = document.querySelector('a[href="#home"]');
      anchor.click();

      expect(window.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'smooth' })
      );
    });

    test('does not scroll when anchor points to a non-existent target', () => {
      // Add an anchor pointing to a section that does not exist in the DOM
      const a = document.createElement('a');
      a.href = '#does-not-exist';
      a.textContent = 'Dead link';
      document.body.appendChild(a);

      loadScript();

      // Re-add the anchor after loadScript resets listeners, and click it
      const a2 = document.createElement('a');
      a2.href = '#does-not-exist';
      a2.textContent = 'Dead link 2';
      document.body.appendChild(a2);

      // Attach the smooth-scroll listener manually (script already ran)
      // Instead, rebuild and load fresh so the anchor is already there
      buildPageDOM();
      const deadAnchor = document.createElement('a');
      deadAnchor.href = '#does-not-exist';
      deadAnchor.textContent = 'Dead link';
      document.body.appendChild(deadAnchor);

      // Load script with the dangling anchor present
      loadScript();

      window.scrollTo.mockClear();
      deadAnchor.click();

      expect(window.scrollTo).not.toHaveBeenCalled();
    });
  });

  // ── Gallery filtering ──────────────────────────────────────────────────────

  describe('Gallery filtering', () => {
    test('clicked filter button becomes active', () => {
      loadScript();
      const peaksBtn = document.querySelector('[data-filter="peaks"]');
      peaksBtn.click();
      expect(peaksBtn.classList.contains('active')).toBe(true);
    });

    test('"all" filter makes every gallery item visible', () => {
      loadScript();
      document.querySelector('[data-filter="all"]').click();
      document.querySelectorAll('.gallery-item').forEach(item => {
        expect(item.style.display).toBe('block');
        expect(item.classList.contains('show')).toBe(true);
      });
    });

    test('category filter shows matching items immediately', () => {
      loadScript();
      document.querySelector('[data-filter="climbing"]').click();

      document.querySelectorAll('[data-category="climbing"]').forEach(item => {
        expect(item.style.display).toBe('block');
        expect(item.classList.contains('show')).toBe(true);
      });
    });

    test('category filter hides non-matching items after timer', () => {
      loadScript();
      document.querySelector('[data-filter="climbing"]').click();

      const others = document.querySelectorAll('[data-category]:not([data-category="climbing"])');
      others.forEach(item => expect(item.classList.contains('hide')).toBe(true));

      jest.runAllTimers();
      others.forEach(item => expect(item.style.display).toBe('none'));
    });

    test('only one filter button is active after clicking', () => {
      loadScript();
      document.querySelector('[data-filter="landscape"]').click();

      const active = document.querySelectorAll('.filter-btn.active');
      expect(active).toHaveLength(1);
      expect(active[0].getAttribute('data-filter')).toBe('landscape');
    });
  });

  // ── Lightbox ──────────────────────────────────────────────────────────────

  describe('Lightbox', () => {
    test('creates lightbox element on gallery-item click', () => {
      loadScript();
      document.querySelector('.gallery-item').click();

      const lightbox = document.querySelector('.lightbox');
      expect(lightbox).toBeTruthy();
      expect(document.body.style.overflow).toBe('hidden');
      expect(lightbox.querySelector('img')).toBeTruthy();
      expect(lightbox.querySelector('.lightbox-caption')).toBeTruthy();
      expect(lightbox.querySelector('.lightbox-close')).toBeTruthy();
    });

    test('close button removes lightbox and restores body scroll', () => {
      loadScript();
      document.querySelector('.gallery-item').click();
      document.querySelector('.lightbox-close').click();

      expect(document.querySelector('.lightbox')).toBeNull();
      expect(document.body.style.overflow).toBe('auto');
    });

    test('clicking the backdrop (not the content) closes lightbox', () => {
      loadScript();
      document.querySelector('.gallery-item').click();

      const lightbox = document.querySelector('.lightbox');
      const e = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(e, 'target', { value: lightbox, configurable: true });
      lightbox.dispatchEvent(e);

      expect(document.querySelector('.lightbox')).toBeNull();
    });

    test('pressing Escape closes an open lightbox', () => {
      // Track and isolate keydown listeners added by this single test run.
      // We intercept addEventListener to capture the keydown handler, call it
      // directly, then remove it — avoiding the stale-listener accumulation that
      // occurs when document listeners persist across tests in the jsdom env.
      loadScript();

      const capturedKeydownListeners = [];
      const origAdd = document.addEventListener.bind(document);
      jest.spyOn(document, 'addEventListener').mockImplementation((type, cb, ...rest) => {
        if (type === 'keydown') capturedKeydownListeners.push(cb);
        origAdd(type, cb, ...rest);
      });

      document.querySelector('.gallery-item').click();
      document.addEventListener.mockRestore();

      // Should have captured the keydown listener added by the lightbox
      expect(capturedKeydownListeners.length).toBeGreaterThan(0);

      // The lightbox should be open
      expect(document.querySelector('.lightbox')).toBeTruthy();

      // Remove all previously accumulated keydown listeners so only ours fires
      capturedKeydownListeners.forEach(cb => {
        document.removeEventListener('keydown', cb);
      });

      // Call the listener directly with an Escape event so only this lightbox closes
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      capturedKeydownListeners[capturedKeydownListeners.length - 1](escapeEvent);

      expect(document.querySelector('.lightbox')).toBeNull();
      expect(document.body.style.overflow).toBe('auto');
    });

    test('pressing a non-Escape key does not close the lightbox', () => {
      loadScript();
      document.querySelector('.gallery-item').click();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(document.querySelector('.lightbox')).toBeTruthy();
    });
  });

  // ── Parallax ──────────────────────────────────────────────────────────────

  describe('Parallax effect', () => {
    test('applies translateY to hero on scroll', () => {
      loadScript();
      const hero = document.querySelector('.hero');

      window.pageYOffset = 200;
      window.dispatchEvent(new Event('scroll'));

      expect(hero.style.transform).toBe('translateY(-100px)');
    });

    test('zero transform when at top', () => {
      loadScript();
      const hero = document.querySelector('.hero');

      window.pageYOffset = 0;
      window.dispatchEvent(new Event('scroll'));

      expect(hero.style.transform).toBe('translateY(0px)');
    });

    test('does not throw when hero section is absent', () => {
      // Remove the hero section before loading script
      document.querySelector('.hero').remove();

      expect(() => {
        loadScript();
        window.pageYOffset = 100;
        window.dispatchEvent(new Event('scroll'));
      }).not.toThrow();
    });
  });

  // ── Scroll progress indicator ─────────────────────────────────────────────

  describe('Scroll progress indicator', () => {
    test('width updates proportionally to scroll position', () => {
      loadScript();
      const scrollProgress = document.querySelector('.scroll-progress');

      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 2024,
        configurable: true,
      });
      // window.innerHeight is mocked to 1024 in setup.js → scrollTotal = 1000
      window.pageYOffset = 500;
      window.dispatchEvent(new Event('scroll'));

      expect(scrollProgress.style.width).toBe('50%');
    });

    test('width is 0% at top of page', () => {
      loadScript();
      const scrollProgress = document.querySelector('.scroll-progress');

      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 2024,
        configurable: true,
      });
      window.pageYOffset = 0;
      window.dispatchEvent(new Event('scroll'));

      expect(scrollProgress.style.width).toBe('0%');
    });
  });

  // ── Intersection Observer – element animations ────────────────────────────

  describe('Intersection Observer – element animations', () => {
    test('sets initial opacity 0 and transform on animated elements', () => {
      loadScript();
      const els = document.querySelectorAll(
        '.featured-item, .gallery-item, .about-content, .contact-content'
      );
      els.forEach(el => {
        expect(el.style.opacity).toBe('0');
        expect(el.style.transform).toBe('translateY(50px)');
      });
    });

    test('observer.observe is called for animated elements', () => {
      loadScript();
      const firstObserver = observerInstances[0];
      expect(firstObserver.observe).toHaveBeenCalled();
    });

    test('animates in when isIntersecting=true', () => {
      loadScript();
      const animEl   = document.querySelectorAll('.featured-item')[0];
      const observer = observerInstances[0];

      observer._callback([{ target: animEl, isIntersecting: true }]);

      expect(animEl.style.opacity).toBe('1');
      expect(animEl.style.transform).toBe('translateY(0)');
    });

    test('does not animate when isIntersecting=false', () => {
      loadScript();
      const animEl   = document.querySelectorAll('.featured-item')[0];
      const observer = observerInstances[0];

      observer._callback([{ target: animEl, isIntersecting: false }]);

      expect(animEl.style.opacity).toBe('0');
    });
  });

  // ── Section title animations ──────────────────────────────────────────────

  describe('Section title animations', () => {
    test('initial styles applied to section titles', () => {
      loadScript();
      document.querySelectorAll('.section-title').forEach(title => {
        expect(title.style.opacity).toBe('0');
        expect(title.style.transform).toBe('translateY(30px)');
        expect(title.style.transition).toContain('0.8s');
      });
    });
  });

  // ── Counter animation ─────────────────────────────────────────────────────

  describe('Stats counter animation', () => {
    test('counter ends at correct value', () => {
      loadScript();
      const statsObserver = observerInstances[1];
      const statEl        = document.querySelector('.stat-number');
      const original      = statEl.textContent; // "150"

      statsObserver._callback([{ target: statEl, isIntersecting: true }]);
      jest.runAllTimers();

      expect(statEl.textContent).toBe(original);
    });

    test('does not change content when not intersecting', () => {
      loadScript();
      const statsObserver = observerInstances[1];
      const statEl        = document.querySelector('.stat-number');
      const original      = statEl.textContent;

      statsObserver._callback([{ target: statEl, isIntersecting: false }]);
      jest.runAllTimers();

      expect(statEl.textContent).toBe(original);
    });

    test('handles stat-number with non-numeric suffix like "100+"', () => {
      loadScript();
      const statsObserver = observerInstances[1];
      const statEl        = document.querySelector('.stat-number');
      statEl.textContent  = '100+';

      statsObserver._callback([{ target: statEl, isIntersecting: true }]);
      jest.runAllTimers();

      expect(statEl.textContent).toBe('100');
    });
  });

  // ── Featured item hover effects ───────────────────────────────────────────

  describe('Featured item hover effects', () => {
    test('sets zIndex to 10 on mouseenter', () => {
      loadScript();
      const item = document.querySelector('.featured-item');
      item.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      expect(item.style.zIndex).toBe('10');
    });

    test('sets zIndex to 1 on mouseleave', () => {
      loadScript();
      const item = document.querySelector('.featured-item');
      item.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      item.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      expect(item.style.zIndex).toBe('1');
    });
  });

  // ── Lazy image loading ────────────────────────────────────────────────────

  describe('Lazy image loading', () => {
    test('registers lazy images with imageObserver', () => {
      loadScript();
      const imageObserver = observerInstances[2];
      expect(imageObserver.observe).toHaveBeenCalled();
    });

    test('swaps data-src to src when image enters viewport', () => {
      loadScript();
      const lazyImg   = document.querySelector('img[data-src]');
      const dataSrc   = lazyImg.getAttribute('data-src');
      lazyImg.classList.add('lazy');

      const imageObserver = observerInstances[2];
      imageObserver._callback([{ target: lazyImg, isIntersecting: true }], imageObserver);

      expect(lazyImg.src).toContain(dataSrc);
      expect(lazyImg.classList.contains('lazy')).toBe(false);
    });

    test('calls unobserve after loading a lazy image', () => {
      loadScript();
      const lazyImg       = document.querySelector('img[data-src]');
      const imageObserver = observerInstances[2];

      imageObserver._callback([{ target: lazyImg, isIntersecting: true }], imageObserver);

      expect(imageObserver.unobserve).toHaveBeenCalledWith(lazyImg);
    });

    test('does not load image when not intersecting', () => {
      loadScript();
      const lazyImg   = document.querySelector('img[data-src]');
      const dataSrc   = lazyImg.getAttribute('data-src');
      const imageObserver = observerInstances[2];

      imageObserver._callback([{ target: lazyImg, isIntersecting: false }], imageObserver);

      // src should not have been swapped
      expect(lazyImg.getAttribute('src')).not.toBe(dataSrc);
      expect(imageObserver.unobserve).not.toHaveBeenCalled();
    });
  });

  // ── Contact form ──────────────────────────────────────────────────────────

  describe('Contact form submission', () => {
    function fillAndSubmit() {
      const form = document.querySelector('.contact-form');
      form.querySelector('#name').value    = 'Jane Doe';
      form.querySelector('#email').value   = 'jane@example.com';
      form.querySelector('#subject').value = 'Hello';
      form.querySelector('#message').value = 'World';
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      return form;
    }

    test('disables submit button during submission', () => {
      loadScript();
      const submitBtn = document.querySelector('.submit-btn');

      fillAndSubmit();

      expect(submitBtn.textContent).toBe('Sending...');
      expect(submitBtn.disabled).toBe(true);
    });

    test('shows alert after the 2-second API delay', () => {
      loadScript();
      fillAndSubmit();
      jest.runAllTimers();

      expect(global.alert).toHaveBeenCalledWith(
        "Thank you for your message! I'll get back to you soon."
      );
    });

    test('re-enables submit button after submission completes', () => {
      loadScript();
      fillAndSubmit();
      jest.runAllTimers();

      const submitBtn = document.querySelector('.submit-btn');
      expect(submitBtn.textContent).toBe('Send Message');
      expect(submitBtn.disabled).toBe(false);
    });

    test('resets form fields after submission', () => {
      loadScript();
      const form = fillAndSubmit();
      jest.runAllTimers();

      expect(form.querySelector('#name').value).toBe('');
      expect(form.querySelector('#email').value).toBe('');
      expect(form.querySelector('#message').value).toBe('');
    });
  });

  // ── No contact form edge case ──────────────────────────────────────────────

  describe('No contact form present', () => {
    test('script initialises without errors when contact form is absent', () => {
      document.querySelector('.contact').innerHTML =
        '<h2 class="section-title">Contact</h2><div class="contact-content"></div>';

      expect(() => loadScript()).not.toThrow();
    });
  });
});
