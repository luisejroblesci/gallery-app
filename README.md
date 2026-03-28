# Peak Moments - Mountaineering Photography Landing Page

A modern, responsive landing page designed to showcase mountaineering photography with a fluid, professional design inspired by high-end portfolio sites.

## Features

### **Design & Layout**
- **Hero Section**: Full-screen parallax background with a compelling call-to-action
- **Featured Expeditions**: Grid layout highlighting your best work
- **Portfolio Gallery**: Filterable image gallery with categories
- **About Section**: Professional storytelling with statistics
- **Contact Form**: Clean, functional contact interface
- **Responsive Design**: Optimized for all devices, from mobile to desktop

### **Visual Elements**
- **Modern Typography**: Playfair Display for headings, Inter for body text
- **Smooth Animations**: Scroll-triggered animations and hover effects
- **Lightbox Gallery**: Click images to view them in a full-screen lightbox
- **Parallax Effects**: Subtle parallax scrolling for visual depth
- **Color Scheme**: Professional mountain-inspired palette

### **Interactive Features**
- **Mobile Navigation**: Hamburger menu for mobile devices
- **Gallery Filtering**: Filter photos by category (Peaks, Climbing, Landscape)
- **Smooth Scrolling**: Seamless navigation between sections
- **Contact Form**: Form submission with validation
- **Progress Indicator**: Scroll progress bar at the top of the page
- **Animated Statistics**: Counter animations for key metrics

## File Structure

```
project/
├── index.html          # Main HTML structure
├── styles.css          # All CSS styling and responsive design
├── script.js           # JavaScript functionality and interactions
├── package.json        # Project metadata and npm scripts
├── jest.config.js      # Jest test configuration
├── tests/              # Test suite (unit, integration, and flaky tests)
├── README.md           # This documentation file
└── FLAKY_TESTS_README.md  # Documentation for the flaky test suite
```

## Testing

This project includes a comprehensive test suite using [Jest](https://jestjs.io/), covering navigation, gallery, forms, animations, and integration behavior. It also includes 44 intentionally flaky tests for CI and agent testing purposes. See [FLAKY_TESTS_README.md](./FLAKY_TESTS_README.md) for details.

```bash
# Run all tests
npm test

# Run only flaky tests
npm run test:flaky

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Customization Guide

### **Replacing Images**

The current site uses Unsplash placeholder images. To use your own photos:

1. **Replace image URLs** in `index.html`:
   - Hero background (line ~119)
   - Featured expedition images (lines ~56, 63, 70)
   - Gallery images (lines ~89, 96, 103, etc.)
   - About section image (line ~173)

2. **Image requirements**:
   - **Hero**: 2070x1380px or larger for best quality
   - **Gallery**: 800x800px (square) for a consistent layout
   - **Featured**: Various sizes (large: 2070x1380, others: 800x600)
   - **Format**: JPG or WebP for best performance

### **Content Customization**

#### **Branding & Contact**
- **Site title**: Change "Peak Moments" in the navigation and footer
- **Contact details**: Update the email, phone, and location in the contact section
- **Social links**: Add your actual social media URLs in the footer

#### **About Section**
- **Statistics**: Update the expedition count, countries visited, and highest summit
- **Bio text**: Replace with your personal mountaineering story
- **Achievements**: Add your specific accomplishments

#### **Gallery Categories**
To add or modify categories:
1. Update filter buttons in HTML (lines ~77–80)
2. Add the corresponding `data-category` attribute to gallery items
3. Update the filter JavaScript logic if needed

### **Styling Customization**

#### **Color Scheme**
Edit CSS variables in `styles.css` (lines 8–19):
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
- **Change fonts**: Update the Google Fonts link in the HTML `<head>`

#### **Layout Adjustments**
- **Container width**: Modify the `.container` max-width (line 33)
- **Section spacing**: Adjust padding in the section classes
- **Grid layouts**: Modify `grid-template-columns` for different layouts

### **Responsive Breakpoints**

The site uses the following responsive breakpoints:
- **768px**: Tablet and below
- **480px**: Mobile phones

Customize breakpoints in the media queries section of `styles.css`.

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile browsers**: iOS Safari, Chrome Mobile
- **Features used**: CSS Grid, Flexbox, Intersection Observer API

## Performance Tips

1. **Optimize images**: Use WebP format and compress images before uploading
2. **Lazy loading**: Already implemented for below-the-fold images
3. **CDN**: Consider using a CDN for image delivery
4. **Minification**: Minify CSS and JS files for production builds

## Deployment

### **Simple Hosting**
Upload all files to any web hosting service:
- GitHub Pages
- Netlify
- Vercel
- Traditional web hosting

### **Domain Setup**
1. Point your domain to the hosting service
2. Update contact information in the site
3. Set up an SSL certificate (usually automatic with modern hosting)

## Advanced Features

### **Adding a Blog Section**
To add a blog or expedition journal:
1. Create a new HTML section after the gallery
2. Add blog post cards with excerpts
3. Link to individual blog post pages

### **Contact Form Backend**
The current form is frontend-only. To make it functional:
1. Use a service such as Formspree, Netlify Forms, or EmailJS
2. Add the form action URL to the form element
3. Update the JavaScript to handle real form submissions

### **SEO Optimization**
- Add meta descriptions and keywords
- Include Open Graph tags for social sharing
- Create an XML sitemap
- Add structured data for a photography business

## Troubleshooting

### **Images not loading**
- Check that image URLs are accessible
- Verify file paths are correct
- Ensure CORS headers are set if loading from external domains

### **Mobile menu not working**
- Check the JavaScript console for errors
- Verify that the hamburger click event is bound correctly
- Ensure CSS classes are consistently named

### **Animations not smooth**
- Check browser compatibility
- Respect reduced motion preferences for accessibility (`prefers-reduced-motion`)
- Optimize large images that may cause rendering lag

## Support

For issues or questions about customizing this template:
1. Check the browser console for JavaScript errors
2. Validate HTML and CSS syntax
3. Test on different devices and browsers

---

*Capture the summit, share the journey, inspire the adventure.*
