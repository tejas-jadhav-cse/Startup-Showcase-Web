/**
 * Modern Footer Component JavaScript
 * Handles dynamic functionality and interactions for the footer
 */

// Self-executing function to avoid global namespace pollution
(function() {
    // DOM Elements
    const footer = document.querySelector('.modern-footer');
    const backToTopBtn = document.getElementById('back-to-top');
    const newsletterForm = document.querySelector('.newsletter-form');
    const footerLinks = document.querySelectorAll('.footer-link');
    const currentYearElement = document.getElementById('currentYear');
    const socialLinks = document.querySelectorAll('.social-icon-link');
    
    /**
     * Update copyright year to current year
     */
    function updateCopyrightYear() {
        if (currentYearElement) {
            const currentYear = new Date().getFullYear();
            currentYearElement.textContent = currentYear.toString();
        }
    }
    
    /**
     * Setup smooth scrolling for footer navigation links
     */
    function setupSmoothScroll() {
        footerLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop,
                            behavior: 'smooth'
                        });
                        
                        // Update URL hash without jumping
                        history.pushState(null, null, targetId);
                    }
                }
            });
        });
    }
    
    /**
     * Handles the back to top button functionality
     */
    function setupBackToTopButton() {
        if (!backToTopBtn) return;
        
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
                
                // Add floating animation when visible for a while
                setTimeout(() => {
                    if (backToTopBtn.classList.contains('visible')) {
                        backToTopBtn.classList.add('animate');
                    }
                }, 2000);
            } else {
                backToTopBtn.classList.remove('visible', 'animate');
            }
        });
        
        // Scroll to top when clicked
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    /**
     * Handle newsletter form submission
     */
    function setupNewsletterForm() {
        if (!newsletterForm) return;
        
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const checkbox = this.querySelector('.newsletter-checkbox');
            
            if (emailInput && emailInput.value) {
                // Simple validation
                if (!isValidEmail(emailInput.value)) {
                    showFormMessage('Please enter a valid email address', 'error');
                    return;
                }
                
                if (checkbox && !checkbox.checked) {
                    showFormMessage('Please agree to receive updates', 'error');
                    return;
                }
                
                // Simulate form submission
                showFormMessage('Thank you for subscribing!', 'success');
                emailInput.value = '';
                if (checkbox) checkbox.checked = false;
                
                // Here you would typically send data to a server
                console.log('Newsletter subscription:', emailInput.value);
            }
        });
    }
    
    /**
     * Add parallax effect to footer decorative elements
     */
    function setupParallaxEffects() {
        const shape1 = document.querySelector('.footer-shape-1');
        const shape2 = document.querySelector('.footer-shape-2');
        
        if (shape1 && shape2) {
            window.addEventListener('mousemove', (e) => {
                // Only apply effect on desktop
                if (window.innerWidth > 768) {
                    const mouseX = e.clientX / window.innerWidth;
                    const mouseY = e.clientY / window.innerHeight;
                    
                    shape1.style.transform = `translate(${mouseX * 40}px, ${mouseY * 40}px)`;
                    shape2.style.transform = `translate(${-mouseX * 40}px, ${-mouseY * 40}px)`;
                }
            });
        }
    }
    
    /**
     * Track analytics for footer interactions
     */
    function trackFooterInteractions() {
        // Track social link clicks
        socialLinks.forEach(link => {
            link.addEventListener('click', function() {
                const platform = this.getAttribute('aria-label');
                console.log('Social link clicked:', platform);
                
                // You would typically send this to an analytics service
                // Example: analytics.trackEvent('social_click', { platform });
            });
        });
    }
    
    /**
     * Show success or error messages for the newsletter form
     */
    function showFormMessage(message, type = 'success') {
        // Remove any existing message
        const existingMessage = newsletterForm.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        // Add to form
        newsletterForm.appendChild(messageElement);
        
        // Remove after delay
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => messageElement.remove(), 300);
        }, 3000);
    }
    
    /**
     * Email validation helper
     */
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    /**
     * Add focus accessibility features
     */
    function setupAccessibility() {
        // Make social links more accessible
        socialLinks.forEach(link => {
            link.addEventListener('focus', function() {
                this.classList.add('focused');
            });
            
            link.addEventListener('blur', function() {
                this.classList.remove('focused');
            });
        });
    }
    
    /**
     * Initialize footer functionality
     */
    function initFooter() {
        updateCopyrightYear();
        setupSmoothScroll();
        setupBackToTopButton();
        setupNewsletterForm();
        setupParallaxEffects();
        trackFooterInteractions();
        setupAccessibility();
        console.log('Modern footer component initialized');
    }
    
    // Run initialization when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFooter);
    } else {
        initFooter();
    }
})();