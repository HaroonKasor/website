/**
 * Main JavaScript File
 * Handles all interactive features of the landing page
 */

// ========================================
// Constants & Configuration
// ========================================
const CONFIG = {
    scrollThreshold: 50,
    observerThreshold: 0.1,
    smoothScrollDuration: 800,
};

// ========================================
// DOM Elements
// ========================================
const DOM = {
    header: document.getElementById('header'),
    navToggle: document.getElementById('nav-toggle'),
    navMenu: document.getElementById('nav-menu'),
    navLinks: document.querySelectorAll('.nav__link'),
};

// ========================================
// Sticky Header on Scroll
// ========================================
function initStickyHeader() {
    const handleScroll = throttle(() => {
        if (window.scrollY > CONFIG.scrollThreshold) {
            DOM.header.classList.add('scrolled');
        } else {
            DOM.header.classList.remove('scrolled');
        }
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
}

// ========================================
// Mobile Navigation Toggle
// ========================================
function initMobileNav() {
    if (DOM.navToggle && DOM.navMenu) {
        DOM.navToggle.addEventListener('click', () => {
            DOM.navToggle.classList.toggle('active');
            DOM.navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = DOM.navMenu.classList.contains('active') 
                ? 'hidden' 
                : '';
        });
        
        // Close menu when clicking on a nav link
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                DOM.navToggle.classList.remove('active');
                DOM.navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!DOM.navMenu.contains(e.target) && !DOM.navToggle.contains(e.target)) {
                DOM.navToggle.classList.remove('active');
                DOM.navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// ========================================
// Smooth Scrolling for Anchor Links
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const headerHeight = DOM.header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - headerHeight;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// Intersection Observer for Scroll Animations
// ========================================
function initScrollAnimations() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        console.log('IntersectionObserver not supported');
        return;
    }
    
    const observerOptions = {
        threshold: CONFIG.observerThreshold,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    const animatedElements = document.querySelectorAll(
        '.feature-card, .feature-item, .product__card, .testimonial-card, .pricing-card, .stat-item'
    );
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ========================================
// Active Navigation Link on Scroll
// ========================================
function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    
    const handleScroll = throttle(() => {
        const scrollY = window.pageYOffset;
        const headerHeight = DOM.header.offsetHeight;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
}

// ========================================
// Lazy Loading Images
// ========================================
function initLazyLoading() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        return;
    }
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    // Only initialize if there are lazy-loadable images
    if (lazyImages.length === 0) {
        return;
    }
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ========================================
// Counter Animation for Statistics
// ========================================

function initCounterAnimations() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        console.log('IntersectionObserver not supported for counter animations');
        return;
    }
    
    const counters = document.querySelectorAll('.stat__number, .stat-item__number');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const text = counter.textContent;
                
                // Extract number from text (remove commas, +, etc.)
                const numberMatch = text.match(/[\d,]+/);
                if (numberMatch) {
                    const target = parseInt(numberMatch[0].replace(/,/g, ''));
                    const prefix = text.split(numberMatch[0])[0];
                    const suffix = text.split(numberMatch[0])[1];
                    
                    counter.textContent = prefix + '0' + suffix;
                    
                    setTimeout(() => {
                        let current = 0;
                        const increment = target / 60; // Animate over ~1 second at 60fps
                        
                        const updateCounter = () => {
                            current += increment;
                            if (current < target) {
                                counter.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.textContent = prefix + target.toLocaleString() + suffix;
                            }
                        };
                        
                        updateCounter();
                    }, 200);
                    
                    counterObserver.unobserve(counter);
                }
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// ========================================
// Form Validation (if forms exist)
// ========================================
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic validation
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });
            
            if (isValid) {
                // Handle form submission
                console.log('Form submitted successfully');
                // You can add AJAX submission here
            }
        });
    });
}

// ========================================
// Performance Optimization
// ========================================

// Throttle function for scroll events (defined early for use in other functions)
function throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce function for performance optimization
function debounce(func, wait = 20) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// Accessibility Enhancements
// ========================================
function initAccessibility() {
    // Add keyboard navigation for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
    
    interactiveElements.forEach(element => {
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
        
        // Add Enter key support for non-button elements
        element.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !element.matches('a')) {
                element.click();
            }
        });
    });
    
    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#home';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -100px;
        left: 0;
        background: var(--color-primary);
        color: white;
        padding: 10px 20px;
        z-index: 10000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-100px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ========================================
// Console Welcome Message
// ========================================
function showWelcomeMessage() {
    const styles = [
        'color: #6366F1',
        'font-size: 20px',
        'font-weight: bold',
        'padding: 10px'
    ].join(';');
    
    console.log('%c👋 Welcome to LaunchPad!', styles);
    console.log('%cBuilt with ❤️ using HTML, CSS, and Vanilla JavaScript', 'color: #8B5CF6; font-size: 14px;');
}

// ========================================
// Initialize All Features
// ========================================
function init() {
    // Show welcome message
    showWelcomeMessage();
    
    // Initialize all features
    initStickyHeader();
    initMobileNav();
    initSmoothScroll();
    initScrollAnimations();
    initActiveNavLink();
    initLazyLoading();
    initCounterAnimations();
    initFormValidation();
    initAccessibility();
    
    // Log initialization
    console.log('✅ All features initialized successfully');
}

// ========================================
// Run on DOM Content Loaded
// ========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already ready
    init();
}

// ========================================
// Export for testing (if needed)
// ========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        init,
        initStickyHeader,
        initMobileNav,
        initSmoothScroll,
        debounce,
        throttle
    };
}
