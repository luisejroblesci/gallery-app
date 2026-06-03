# Peak Moments - Mountaineering Photography Landing Page

A modern, responsive landing page designed to showcase mountaineering photography with a fluid, professional design inspired by high-end portfolio sites.

## Features

### **Design & Layout**
- **Hero Section**: Full-screen parallax background with compelling call-to-action
- **Featured Expeditions**: Grid layout highlighting your best work
- **Portfolio Gallery**: Filterable image gallery with categories
- **About Section**: Professional storytelling with statistics
- **Contact Form**: Clean, functional contact interface
- **Responsive Design**: Perfect on all devices from mobile to desktop

### **Visual Elements**
- **Modern Typography**: Playfair Display for headings, Inter for body text
- **Smooth Animations**: Scroll-triggered animations and hover effects
- **Lightbox Gallery**: Click images to view in full-screen lightbox
- **Parallax Effects**: Subtle parallax scrolling for depth
- **Color Scheme**: Professional mountain-inspired palette

### **Interactive Features**
- **Mobile Navigation**: Hamburger menu for mobile devices
- **Gallery Filtering**: Filter photos by category (Peaks, Climbing, Landscape)
- **Smooth Scrolling**: Seamless navigation between sections
- **Contact Form**: Form submission with validation
- **Progress Indicator**: Scroll progress bar at top of page
- **Animated Statistics**: Counter animations for impressive numbers

## File Structure

```
peak-moments/
├── .circleci/
│   └── config.yml          # CircleCI CI/CD pipeline configuration
├── tests/
│   ├── setup.js            # Jest global test setup
│   ├── animations.test.js  # Animation behavior tests
│   ├── form.test.js        # Contact form tests
│   ├── gallery.test.js     # Gallery and filtering tests
│   ├── integration.test.js # End-to-end integration tests
│   ├── navigation.test.js  # Navigation and scrolling tests
│   ├── flaky-timing.test.js
│   ├── flaky-dom.test.js
│   ├── flaky-network.test.js
│   ├── flaky-randomness.test.js
│   ├── flaky-memory.test.js
│   └── flaky-environment.test.js
├── script.js               # JavaScript functionality and interactions
├── styles.css              # All CSS styling and responsive design
├── jest.config.js          # Jest test runner configuration
├── package.json
├── FLAKY_TESTS_README.md   # Documentation for intentional flaky test suite
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) v14 or later
- npm (bundled with Node.js)

## Getting Started

```bash
# Install dependencies
npm install

# Serve locally (requires Python 3)
npm run serve
```

Then open `http://localhost:8000` in your browser.

## Testing

The project uses [Jest](https://jestjs.io/) with a jsdom environment.

```bash
# Run all tests
npm test

# Run only flaky tests
npm run test:flaky

# Run with coverage report
npm run test:coverage

# Run in watch mode
npm run test:watch
```

Coverage output is written to the `coverage/` directory.

> See [FLAKY_TESTS_README.md](./FLAKY_TESTS_README.md) for documentation on the intentional flaky test suite included in this repo.

## CI/CD

This project uses **CircleCI** (`build-and-test` workflow) to run the full test suite on every push. Configuration lives in `.circleci/config.yml`.

## Customization Guide

### **Replacing Images**

The current site uses Unsplash placeholder images. To use your own photos:

1. **Replace image URLs** in the HTML source:
   - Hero background
   - Featured expedition images
   - Gallery images
   - About section image

2. **Image requirements**:
   - **Hero**: 2070×1380px or larger for best quality
   - **Gallery**: 800×800px (square) for consistent layout
   - **Featured**: Large images at 2070×1380, others at 800×600
   - **Format**: JPG or WebP for best performance

### **Content Customization**

#### **Branding & Contact**
- **Site title**: Change "Peak Moments" in navigation and footer
- **Contact details**: Update email, phone, and location in the contact section
- **Social links**: Add your actual social media URLs in the footer

#### **About Section**
- **Statistics**: Update expedition count, countries visited, highest summit
- **Bio text**: Replace with your personal mountaineering story
- **Achievements**: Add your specific accomplishments

#### **Gallery Categories**
To add or modify categories:
1. Update filter buttons in the HTML
2. Add a corresponding `data-category` attribute to gallery items
3. Update filter logic in `script.js` if needed

### **Styling Customization**

#### **Color Scheme**
Edit CSS custom properties at the top of `styles.css`:

```css
:root {
    --primary-color: #2c3e50;    /* Main dark color */
    --accent-color: #f39c12;     /* Orange accent */
    --text-color: #333;          /* Body text */
    /* ... other colors */
}
```

#### **Typography**
- **Headings**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, clean)
- To change fonts, update the Google Fonts link in the HTML `<head>`

#### **Layout Adjustments**
- **Container width**: Modify `.container` max-width in `styles.css`
- **Section spacing**: Adjust padding on section classes
- **Grid layouts**: Modify `grid-template-columns` for different column configurations

### **Responsive Breakpoints**

The site is responsive with breakpoints at:
- **768px**: Tablet and below
- **480px**: Mobile phones

Customize breakpoints in the media queries section of `styles.css`.

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile browsers**: iOS Safari, Chrome Mobile
- **Features used**: CSS Grid, Flexbox, Intersection Observer

## Performance Tips

1. **Optimize images**: Use WebP format and compress images before uploading
2. **Lazy loading**: Already implemented for below-fold images
3. **CDN**: Consider using a CDN to serve images closer to visitors
4. **Minification**: Minify CSS and JS for production builds

## Deployment

### **Static Hosting**
Upload all files to any static hosting service:
- [GitHub Pages](https://pages.github.com/)
- [Netlify](https://netlify.com/)
- [Vercel](https://vercel.com/)
- Traditional web hosting (FTP/SFTP)

### **Domain Setup**
1. Point your domain to the hosting service
2. Update contact information in the site
3. Set up SSL certificate (usually automatic with modern hosts)

## Advanced Features

### **Adding a Blog Section**
To add a blog/expedition journal:
1. Create a new HTML section after the gallery
2. Add blog post cards with excerpts
3. Link to individual blog post pages

### **Contact Form Backend**
The current form is frontend-only. To make it functional:
1. Use a service like [Formspree](https://formspree.io/), [Netlify Forms](https://www.netlify.com/products/forms/), or [EmailJS](https://www.emailjs.com/)
2. Set the `action` attribute on the form element to your service endpoint
3. Update `script.js` to handle real submissions

### **SEO Optimization**
- Add meta descriptions and keywords to the HTML `<head>`
- Include Open Graph tags for social sharing previews
- Create an XML sitemap
- Add structured data (JSON-LD) for a photography business

## Troubleshooting

### **Images not loading**
- Verify image URLs are publicly accessible
- Check that file paths are correct relative to the HTML file
- Ensure CORS headers are set if loading images from a different domain

### **Mobile menu not working**
- Check the browser console for JavaScript errors
- Verify the hamburger button click event is bound correctly in `script.js`
- Ensure CSS class names match between HTML and JS

### **Animations not smooth**
- Check browser compatibility for the specific animation API being used
- Add `prefers-reduced-motion` media query support for accessibility
- Optimize or lazy-load large images that may cause layout jank

## License

MIT — see `package.json` for details. Author: Luis Robles.
