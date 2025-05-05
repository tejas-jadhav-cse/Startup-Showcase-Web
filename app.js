/**
 * Student Startup Showcase
 * Main application JavaScript
 */

// ==========================================================================
// Security Features - Disable right-click and backlink tracking
// ==========================================================================

// Disable right-click menu
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// Disable backlink tracking by setting referrer policy
const meta = document.createElement('meta');
meta.name = 'referrer';
meta.content = 'no-referrer';
document.head.appendChild(meta);

// ==========================================================================
// 0. Custom Cursor Implementation
// ==========================================================================

// Cursor object with all cursor functionality
const cursor = {
    delay: 8,
    _x: 0,
    _y: 0,
    endX: window.innerWidth / 2,
    endY: window.innerHeight / 2,
    cursorVisible: true,
    cursorEnlarged: false,
    $dot: document.querySelector('.cursor-dot'),
    $outline: document.querySelector('.cursor-dot-outline'),
    
    init: function() {
        // Set up element sizes
        this.dotSize = this.$dot.offsetWidth;
        this.outlineSize = this.$outline.offsetWidth;
        
        this.setupEventListeners();
        this.animateDotOutline();
    },
    
    setupEventListeners: function() {
        const self = this;
        
        // Anchor hovering - enlarge cursor on hovering over links and buttons
        document.querySelectorAll('a, button').forEach(function(el) {
            el.addEventListener('mouseover', function() {
                self.cursorEnlarged = true;
                self.toggleCursorSize();
            });
            el.addEventListener('mouseout', function() {
                self.cursorEnlarged = false;
                self.toggleCursorSize();
            });
        });
        
        // Click events
        document.addEventListener('mousedown', function() {
            self.cursorEnlarged = true;
            self.toggleCursorSize();
        });
        
        document.addEventListener('mouseup', function() {
            self.cursorEnlarged = false;
            self.toggleCursorSize();
        });
        
        document.addEventListener('mousemove', function(e) {
            // Show the cursor
            self.cursorVisible = true;
            self.toggleCursorVisibility();

            // Position the dot
            self.endX = e.pageX;
            self.endY = e.pageY;
            self.$dot.style.top = self.endY + 'px';
            self.$dot.style.left = self.endX + 'px';
        });
        
        // Hide/show cursor
        document.addEventListener('mouseenter', function(e) {
            self.cursorVisible = true;
            self.toggleCursorVisibility();
            self.$dot.style.opacity = 1;
            self.$outline.style.opacity = 1;
        });
        
        document.addEventListener('mouseleave', function(e) {
            self.cursorVisible = false;
            self.toggleCursorVisibility();
            self.$dot.style.opacity = 0;
            self.$outline.style.opacity = 0;
        });
    },
    
    animateDotOutline: function() {
        const self = this;
        
        self._x += (self.endX - self._x) / self.delay;
        self._y += (self.endY - self._y) / self.delay;
        self.$outline.style.top = self._y + 'px';
        self.$outline.style.left = self._x + 'px';
        
        requestAnimationFrame(this.animateDotOutline.bind(self));
    },
    
    toggleCursorSize: function() {
        const self = this;
        
        if (self.cursorEnlarged) {
            self.$dot.style.transform = 'translate(-50%, -50%) scale(0.75)';
            self.$outline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        } else {
            self.$dot.style.transform = 'translate(-50%, -50%) scale(1)';
            self.$outline.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    },
    
    toggleCursorVisibility: function() {
        const self = this;
        
        if (self.cursorVisible) {
            self.$dot.style.opacity = 1;
            self.$outline.style.opacity = 1;
        } else {
            self.$dot.style.opacity = 0;
            self.$outline.style.opacity = 0;
        }
    }
};

// Initialize cursor
cursor.init();

// ==========================================================================
// 1. Data Management & Initialization
// ==========================================================================

// Store startup ideas in memory and localStorage
let startupIdeas = JSON.parse(localStorage.getItem('startupIdeas') || '[]');
let nextId = startupIdeas.length ? Math.max(...startupIdeas.map(s => s.id)) + 1 : 1;

// DOM Elements
const startupForm = document.getElementById('startupForm');
const startupGrid = document.getElementById('startupGrid');
const filterInput = document.getElementById('filter');
const darkModeToggle = document.getElementById('darkModeToggle');
const openSubmitModalBtn = document.getElementById('openSubmitModal');

// ==========================================================================
// 2. Theme Management (Light/Dark Mode)
// ==========================================================================

// Make dark mode default
if (!localStorage.getItem('darkMode') || localStorage.getItem('darkMode') === 'enabled') {
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'enabled');
} else {
    document.documentElement.classList.remove('dark');
}

// Dark mode toggle functionality with animation
const darkModeIcon = document.getElementById('darkModeIcon');
darkModeToggle.addEventListener('click', () => {
    // Animate button
    darkModeToggle.animate([
        { transform: 'rotate(0deg) scale(1)' },
        { transform: 'rotate(20deg) scale(1.2)' },
        { transform: 'rotate(-20deg) scale(1.2)' },
        { transform: 'rotate(0deg) scale(1)' }
    ], { duration: 400 });
    
    // Animate icon
    if (darkModeIcon) {
        darkModeIcon.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.3) rotate(15deg)' },
            { transform: 'scale(1)' }
        ], { duration: 400 });
    }
    
    // Toggle dark mode class and save preference
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'disabled');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'enabled');
    }
});

// ==========================================================================
// 3. Modal System
// ==========================================================================

let activeModal = null;

/**
 * Open a modal with custom HTML content
 * @param {string} contentHtml - HTML content to display in the modal
 */
function openModal(contentHtml) {
    if (activeModal) closeModal();
    
    const modalBg = document.createElement('div');
    modalBg.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in-up';
    modalBg.innerHTML = `
        <div class="glass rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in-up">
            <button class="absolute top-3 right-3 text-gray-400 hover:text-pink-400 text-2xl" id="closeModalBtn">&times;</button>
            ${contentHtml}
        </div>
    `;
    
    document.body.appendChild(modalBg);
    document.body.style.overflow = 'hidden';
    activeModal = modalBg;
    modalBg.querySelector('#closeModalBtn').onclick = closeModal;
}

/**
 * Close the currently active modal
 */
function closeModal() {
    if (activeModal) {
        activeModal.remove();
        document.body.style.overflow = '';
        activeModal = null;
    }
}

// ==========================================================================
// 4. Form Handling & Submission
// ==========================================================================

// Move form into modal for startup idea submission
openSubmitModalBtn.addEventListener('click', () => {
    openModal(`
        <h3 class='text-2xl mb-4 text-gray-100'>Submit Your Startup Idea</h3>
        <form id='modalStartupForm'>
            <div class='grid grid-cols-1 gap-4'>
                <input type='text' id='modalStartupName' placeholder='Startup Name' required class='px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-pink-500 transition-theme'>
                <input type='text' id='modalFounderName' placeholder='Founder Name' required class='px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-pink-500 transition-theme'>
                <textarea id='modalDescription' placeholder='Description' required rows='3' class='px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-pink-500 transition-theme'></textarea>
                <input type='text' id='modalTags' placeholder='Tags (comma-separated)' required class='px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-pink-500 transition-theme'>
            </div>
            <div class='mt-6 flex justify-end'>
                <button type='submit' class='px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-2xl shadow-md hover:scale-105 transition-all'>Submit Idea</button>
            </div>
        </form>
    `);
    
    // Handle form submission
    document.getElementById('modalStartupForm').onsubmit = (e) => {
        e.preventDefault();
        
        const startupName = document.getElementById('modalStartupName').value.trim();
        const founderName = document.getElementById('modalFounderName').value.trim();
        const description = document.getElementById('modalDescription').value.trim();
        const tagsInput = document.getElementById('modalTags').value.trim();
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        
        const newStartup = {
            id: nextId++,
            startupName,
            founderName,
            description,
            tags,
            upvotes: 0,
            timestamp: new Date().toISOString()
        };
        
        startupIdeas.unshift(newStartup);
        localStorage.setItem('startupIdeas', JSON.stringify(startupIdeas));
        renderAllStartups();
        closeModal();
        showNotification('Startup idea submitted successfully!');
    };
});

// Contact and Partnership modals
function openContactModal(startup) {
    openModal(`
        <h3 class='text-xl mb-2 text-pink-400'>Contact Founder</h3>
        <p class='mb-4 text-gray-200'>Send a message to <span>${escapeHtml(startup.founderName)}</span> about <span>${escapeHtml(startup.startupName)}</span>.</p>
        <textarea id='contactMsg' rows='3' class='w-full px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 mb-4' placeholder='Your message...'></textarea>
        <button class='px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow hover:scale-105 transition-all' onclick='closeModal()'>Send</button>
    `);
}

function openPartnershipModal(startup) {
    openModal(`
        <h3 class='text-xl mb-2 text-purple-400'>Request Partnership</h3>
        <p class='mb-4 text-gray-200'>Request a partnership with <span>${escapeHtml(startup.startupName)}</span>.</p>
        <textarea id='partnerMsg' rows='3' class='w-full px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 mb-4' placeholder='Your proposal...'></textarea>
        <button class='px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl shadow hover:scale-105 transition-all' onclick='closeModal()'>Send</button>
    `);
}

// ==========================================================================
// 5. Startup Card Rendering
// ==========================================================================

/**
 * Render all startup ideas to the grid
 */
function renderAllStartups() {
    startupGrid.innerHTML = '';
    
    let totalUpvotes = 0;
    startupIdeas.forEach(s => totalUpvotes += s.upvotes);
    
    startupIdeas.forEach(renderStartupCard);
    
    animateCounter(document.getElementById('statStartups'), startupIdeas.length, 'Startups');
    animateCounter(document.getElementById('statUpvotes'), totalUpvotes, 'Upvotes');
}

/**
 * Create and render a single startup card
 * @param {Object} startup - The startup idea object
 */
function renderStartupCard(startup) {
    const card = document.createElement('div');
    card.id = `startup-${startup.id}`;
    card.className = 'osmo-card shadow osmo-card transition-theme animate-fade-in-up';
    
    // Create tag elements
    const tagsHtml = startup.tags.map(tag => 
        `<span class="osmo-badge" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="p-6">
            <div class="flex justify-between items-start mb-2">
                <h4 class="text-xl tracking-tight text-[#18181b]">${escapeHtml(startup.startupName)}</h4>
                <span class="startup-date date-badge" data-id="${startup.id}">${formatDate(startup.timestamp)}</span>
            </div>
            <p class="text-[#52525b] mb-4 font-normal">${escapeHtml(startup.description)}</p>
            <p class="text-sm text-[#52525b] mb-3">
                <span style="font-weight:400">Founder:</span> ${escapeHtml(startup.founderName)}
            </p>
            <div class="mb-4 flex flex-wrap">${tagsHtml}</div>
            <div class="card-actions flex items-center justify-between gap-2">
                <button class="upvote-btn card-btn flex items-center gap-1" data-id="${startup.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <span class="upvote-count">${startup.upvotes}</span>
                </button>
                <button class="contact-btn card-btn" data-id="${startup.id}">
                    <span class="btn-icon">📞</span>
                    <span class="btn-text">Contact</span>
                </button>
                <button class="partner-btn card-btn" data-id="${startup.id}">
                    <span class="btn-icon">🤝</span>
                    <span class="btn-text">Partner</span>
                </button>
            </div>
        </div>
    `;
    
    startupGrid.appendChild(card);
    
    // Add event listeners to card buttons
    card.querySelector('.upvote-btn').addEventListener('click', handleUpvote);
    card.querySelector('.contact-btn').addEventListener('click', () => openContactModal(startup));
    card.querySelector('.partner-btn').addEventListener('click', () => openPartnershipModal(startup));
    
    // Tag click for filtering
    card.querySelectorAll('.osmo-badge').forEach(badge => {
        badge.addEventListener('click', (e) => {
            filterInput.value = badge.textContent;
            filterInput.dispatchEvent(new Event('input'));
        });
    });
}

// ==========================================================================
// 6. Interaction Handlers
// ==========================================================================

/**
 * Handle upvote button click with animation
 * @param {Event} e - Click event
 */
function handleUpvote(e) {
    const button = e.currentTarget;
    const id = parseInt(button.getAttribute('data-id'));
    const startup = startupIdeas.find(s => s.id === id);
    
    if (startup) {
        startup.upvotes++;
        localStorage.setItem('startupIdeas', JSON.stringify(startupIdeas));
        button.querySelector('.upvote-count').textContent = startup.upvotes;
        
        // Animation
        button.classList.add('scale-125', 'text-pink-500');
        setTimeout(() => {
            button.classList.remove('scale-125', 'text-pink-500');
        }, 300);
    }
}

// Debounced filter for search functionality
let filterTimeout;
filterInput.addEventListener('input', () => {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
        const filterText = filterInput.value.toLowerCase().trim();
        
        startupIdeas.forEach(startup => {
            const cardElement = document.getElementById(`startup-${startup.id}`);
            if (!cardElement) return;
            
            const matchesFilter =
                startup.startupName.toLowerCase().includes(filterText) ||
                startup.description.toLowerCase().includes(filterText) ||
                startup.founderName.toLowerCase().includes(filterText) ||
                startup.tags.some(tag => tag.toLowerCase().includes(filterText));
            
            cardElement.style.display = matchesFilter ? 'block' : 'none';
        });
    }, 200);
});

// ==========================================================================
// 7. UI Utilities & Helper Functions
// ==========================================================================

// Return to Top button implementation
const returnToTopBtn = document.getElementById('returnToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        returnToTopBtn.style.opacity = '1';
        returnToTopBtn.style.transform = 'translateY(0)';
        returnToTopBtn.style.pointerEvents = 'auto';
    } else {
        returnToTopBtn.style.opacity = '0';
        returnToTopBtn.style.transform = 'translateY(20px)';
        returnToTopBtn.style.pointerEvents = 'none';
    }
});

returnToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Enable smooth scrolling
document.documentElement.style.scrollBehavior = 'smooth';

/**
 * Format date for display with responsive options
 * @param {string} dateString - ISO date string
 * @param {boolean} compact - Whether to use compact format for small screens
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    
    // Check if we should use compact format based on screen width
    const isSmallScreen = window.innerWidth < 640;
    
    // Different format options based on screen size
    const options = isSmallScreen 
        ? { month: 'short', day: 'numeric' } 
        : { year: 'numeric', month: 'short', day: 'numeric' };
    
    return date.toLocaleDateString(undefined, options);
}

// Add window resize listener to update dates when screen size changes
window.addEventListener('resize', debounce(() => {
    // Update all date displays when screen size changes
    if (startupIdeas.length > 0) {
        document.querySelectorAll('.startup-date').forEach(dateElement => {
            const id = parseInt(dateElement.getAttribute('data-id'));
            const startup = startupIdeas.find(s => s.id === id);
            if (startup) {
                dateElement.textContent = formatDate(startup.timestamp);
            }
        });
    }
}, 250));

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Time to wait in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
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

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} str - Input string to escape
 * @returns {string} Escaped HTML string
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Show notification message with optional confetti effect
 * @param {string} message - Message to display
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl shadow-lg transform transition-all duration-300 translate-y-0 opacity-100';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Confetti burst on submit
    if (message.toLowerCase().includes('submitted')) {
        launchConfetti();
    }
    
    setTimeout(() => {
        notification.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Animate counter with incrementing numbers
 * @param {HTMLElement} el - Element to update
 * @param {number} target - Target number to count to
 * @param {string} label - Label to append after the number
 */
function animateCounter(el, target, label) {
    if (!el) return;
    
    let start = 0;
    const duration = 700;
    const step = Math.ceil(target / (duration / 16));
    
    function update() {
        start += step;
        if (start >= target) {
            el.textContent = `${target} ${label}`;
        } else {
            el.textContent = `${start} ${label}`;
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// ==========================================================================
// 8. Visual Effects & Animations
// ==========================================================================

/**
 * Launch confetti animation effect
 */
function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';
    
    const ctx = canvas.getContext('2d');
    const confetti = [];
    const colors = ['#7f5af0', '#43e6fc', '#ff6ac1', '#3b82f6', '#fbbf24'];
    
    for (let i = 0; i < 80; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            r: Math.random() * 8 + 4,
            d: Math.random() * 80 + 20,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 10
        });
    }
    
    let frame = 0;
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confetti.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
            ctx.fillStyle = c.color;
            ctx.fill();
        });
        
        update();
        frame++;
        
        if (frame < 60) requestAnimationFrame(draw);
        else canvas.style.display = 'none';
    }
    
    function update() {
        confetti.forEach(c => {
            c.y += Math.cos(frame / 10 + c.d) + 2 + c.r / 2;
            c.x += Math.sin(frame / 15) * 2;
        });
    }
    
    draw();
}

// ==========================================================================
// 9. Initial Setup & Initialization
// ==========================================================================

// Text scramble animation for hero title
window.addEventListener('DOMContentLoaded', () => {
    // Text scramble effect
    const scrambleEl = document.querySelector('.animate-text-scramble');
    if (scrambleEl) {
        const chars = '!<>-_\/[]{}—=+*^?#________';
        const text = scrambleEl.textContent;
        let frame = 0;
        let scramble = '';
        
        function scrambleStep() {
            scramble = text.split('').map((c, i) => {
                if (i < frame) return c;
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
            
            scrambleEl.textContent = scramble;
            frame++;
            
            if (frame <= text.length) {
                setTimeout(scrambleStep, 30);
            } else {
                scrambleEl.textContent = text;
            }
        }
        
        scrambleStep();
    }
});

// Entrance animation utility - add to document head
const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in-up {0%{opacity:0;transform:translateY(40px);}100%{opacity:1;transform:translateY(0);}}
.animate-fade-in-up {animation: fade-in-up 0.7s cubic-bezier(.39,.575,.565,1) both;}
`;
document.head.appendChild(style);

// Initialize with sample data if empty
window.addEventListener('DOMContentLoaded', () => {
    if (startupIdeas.length === 0) {
        const samples = [
            {
                startupName: "EcoLearn",
                founderName: "Jamie Chen",
                description: "An interactive platform that teaches environmental sustainability through gamified learning experiences.",
                tags: ["education", "environment", "tech"],
                upvotes: 15
            },
            {
                startupName: "MealMatch",
                founderName: "Priya Singh",
                description: "An app that reduces food waste by connecting restaurants with surplus food to students on a budget.",
                tags: ["food", "sustainability", "mobile"],
                upvotes: 23
            },
            {
                startupName: "CodeBuddy",
                founderName: "Marcus Johnson",
                description: "AI-powered programming assistant that helps students debug their code and learn programming concepts.",
                tags: ["tech", "education", "AI"],
                upvotes: 18
            }
        ];
        
        samples.forEach(sample => {
            const startup = {
                ...sample,
                id: nextId++,
                timestamp: new Date().toISOString()
            };
            startupIdeas.push(startup);
        });
        
        localStorage.setItem('startupIdeas', JSON.stringify(startupIdeas));
    }
    
    renderAllStartups();
});

// ==========================================================================
// 10. Featured Startup Functionality
// ==========================================================================

/**
 * Select and display a featured startup from the available startup ideas
 */
function updateFeaturedStartup() {
    if (startupIdeas.length === 0) return;
    
    // Sort by upvotes and select the highest one
    const sortedStartups = [...startupIdeas].sort((a, b) => b.upvotes - a.upvotes);
    const featured = sortedStartups[0];
    
    // Update the featured section
    document.getElementById('featuredName').textContent = featured.startupName;
    document.getElementById('featuredFounder').textContent = featured.founderName;
    document.getElementById('featuredDesc').textContent = featured.description;
    document.getElementById('featuredMetric').textContent = featured.upvotes;
    
    // Clear and update tags
    const tagsContainer = document.getElementById('featuredTags');
    tagsContainer.innerHTML = '';
    featured.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'osmo-badge';
        tagEl.textContent = tag;
        tagsContainer.appendChild(tagEl);
    });
    
    // Set up view details button
    document.getElementById('viewFeaturedBtn').onclick = () => {
        // Find and scroll to the featured startup card
        const card = document.getElementById(`startup-${featured.id}`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight the card with animation
            card.classList.add('highlight-pulse');
            setTimeout(() => card.classList.remove('highlight-pulse'), 2000);
        }
    };
}

// ==========================================================================
// 11. Testimonials Carousel
// ==========================================================================

let currentTestimonial = 0;
const testimonialSlider = document.getElementById('testimonialSlider');
const testimonialSlides = document.querySelectorAll('.testimonial-slide');
const testimonialDots = document.getElementById('testimonialDots');
const totalTestimonials = testimonialSlides.length;

// Initialize testimonial dots
if (testimonialDots) {
    testimonialDots.innerHTML = '';
    for (let i = 0; i < totalTestimonials; i++) {
        const dot = document.createElement('button');
        dot.className = `w-3 h-3 rounded-full ${i === 0 ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`;
        dot.onclick = () => moveToTestimonial(i);
        testimonialDots.appendChild(dot);
    }
}

/**
 * Move the testimonial slider to show the specified testimonial
 * @param {number} index - The index of the testimonial to show
 */
function moveToTestimonial(index) {
    if (index < 0) index = totalTestimonials - 1;
    if (index >= totalTestimonials) index = 0;
    
    currentTestimonial = index;
    
    if (testimonialSlider) {
        testimonialSlider.style.transform = `translateX(-${currentTestimonial * 100}%)`;
        
        // Update dots
        const dots = testimonialDots.querySelectorAll('button');
        dots.forEach((dot, i) => {
            dot.className = `w-3 h-3 rounded-full ${i === currentTestimonial ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`;
        });
    }
}

// Set up testimonial carousel navigation
document.getElementById('prevTestimonial')?.addEventListener('click', () => {
    moveToTestimonial(currentTestimonial - 1);
});

document.getElementById('nextTestimonial')?.addEventListener('click', () => {
    moveToTestimonial(currentTestimonial + 1);
});

// Auto-advance the testimonials
setInterval(() => {
    if (document.visibilityState === 'visible') {
        moveToTestimonial(currentTestimonial + 1);
    }
}, 6000);

// ==========================================================================
// 12. FAQ Accordion
// ==========================================================================

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');
    
    question.addEventListener('click', () => {
        // Toggle current FAQ item
        answer.classList.toggle('hidden');
        icon.style.transform = answer.classList.contains('hidden') ? 'rotate(0)' : 'rotate(180deg)';
        
        // Close other FAQ items
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                const otherAnswer = otherItem.querySelector('.faq-answer');
                const otherIcon = otherItem.querySelector('.faq-icon');
                
                if (!otherAnswer.classList.contains('hidden')) {
                    otherAnswer.classList.add('hidden');
                    otherIcon.style.transform = 'rotate(0)';
                }
            }
        });
    });
});

// ==========================================================================
// 13. Analytics Dashboard
// ==========================================================================

// Function to populate dashboard metrics
function updateDashboard() {
    const totalStartups = startupIdeas.length;
    
    let totalUpvotes = 0;
    let totalViews = 0;
    let totalPartnerships = 0;
    
    startupIdeas.forEach(startup => {
        totalUpvotes += startup.upvotes;
        
        // Simulate view counts (in a real app, you would track these)
        const viewCount = Math.floor(startup.upvotes * 3.5 + Math.random() * 20);
        totalViews += viewCount;
        
        // Simulate partnership counts
        const partnershipCount = Math.floor(startup.upvotes * 0.2);
        totalPartnerships += partnershipCount;
    });
    
    // Update dashboard metrics with animation
    animateCounter(document.getElementById('dashboardTotalStartups'), totalStartups, '');
    animateCounter(document.getElementById('dashboardTotalUpvotes'), totalUpvotes, '');
    animateCounter(document.getElementById('dashboardTotalViews'), totalViews, '');
    animateCounter(document.getElementById('dashboardTotalPartnerships'), totalPartnerships, '');
    
    // If we have a growth chart element, update it
    const growthChartEl = document.getElementById('growthChart');
    if (growthChartEl) {
        renderGrowthChart(growthChartEl, 'weekly');
    }
}

// Chart toggle event listeners
document.getElementById('weeklyView')?.addEventListener('click', function() {
    this.className = 'px-4 py-2 text-sm rounded-full bg-blue-500 text-white';
    document.getElementById('monthlyView').className = 'px-4 py-2 text-sm rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    document.getElementById('yearlyView').className = 'px-4 py-2 text-sm rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    renderGrowthChart(document.getElementById('growthChart'), 'weekly');
});

document.getElementById('monthlyView')?.addEventListener('click', function() {
    this.className = 'px-4 py-2 text-sm rounded-full bg-blue-500 text-white';
    document.getElementById('weeklyView').className = 'px-4 py-2 text-sm rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    document.getElementById('yearlyView').className = 'px-4 py-2 text-sm rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    renderGrowthChart(document.getElementById('growthChart'), 'monthly');
});

document.getElementById('yearlyView')?.addEventListener('click', function() {
    this.className = 'px-4 py-2 text-sm rounded-full bg-blue-500 text-white';
    document.getElementById('weeklyView').className = 'px-4 py-2 text-sm rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    document.getElementById('monthlyView').className = 'px-4 py-2 text-sm rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    renderGrowthChart(document.getElementById('growthChart'), 'yearly');
});

/**
 * Render a growth chart in the specified canvas element
 * @param {HTMLCanvasElement} canvas - The canvas element to render the chart
 * @param {string} timeframe - The timeframe to display: 'weekly', 'monthly', or 'yearly'
 */
function renderGrowthChart(canvas, timeframe) {
    if (!canvas || !canvas.getContext) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up chart dimensions
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    // Get data based on timeframe
    let labels, startupData, upvoteData;
    
    switch (timeframe) {
        case 'weekly':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            startupData = [2, 3, 5, 4, 6, 8, 7];
            upvoteData = [5, 8, 12, 15, 20, 25, 28];
            break;
        case 'monthly':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            startupData = [5, 8, 12, 15, 18, 22, 27, 32, 38, 45, 52, 60];
            upvoteData = [15, 25, 40, 60, 85, 110, 140, 180, 220, 265, 320, 380];
            break;
        case 'yearly':
            labels = ['2020', '2021', '2022', '2023', '2024', '2025'];
            startupData = [12, 45, 85, 130, 210, 380];
            upvoteData = [45, 120, 250, 480, 720, 1250];
            break;
    }
    
    // Draw the chart axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#4B5563' : '#E5E7EB';
    ctx.stroke();
    
    // Calculate step sizes
    const xStep = width / (labels.length - 1);
    const maxData = Math.max(...upvoteData);
    const yScale = height / maxData;
    
    // Draw X-axis labels
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#6B7280';
    
    labels.forEach((label, i) => {
        const x = padding + i * xStep;
        ctx.fillText(label, x, canvas.height - padding + 20);
    });
    
    // Draw startup data line
    ctx.beginPath();
    startupData.forEach((value, i) => {
        const x = padding + i * xStep;
        const y = canvas.height - padding - value * yScale;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.strokeStyle = '#3B82F6'; // Blue
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw upvote data line
    ctx.beginPath();
    upvoteData.forEach((value, i) => {
        const x = padding + i * xStep;
        const y = canvas.height - padding - value * yScale;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.strokeStyle = '#7F5AF0'; // Purple
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw data points for startups
    startupData.forEach((value, i) => {
        const x = padding + i * xStep;
        const y = canvas.height - padding - value * yScale;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#3B82F6';
        ctx.fill();
    });
    
    // Draw data points for upvotes
    upvoteData.forEach((value, i) => {
        const x = padding + i * xStep;
        const y = canvas.height - padding - value * yScale;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#7F5AF0';
        ctx.fill();
    });
    
    // Draw legend
    const legendY = padding / 2;
    
    // Startup legend
    ctx.beginPath();
    ctx.rect(padding, legendY - 5, 15, 2);
    ctx.fillStyle = '#3B82F6';
    ctx.fill();
    ctx.fillText('Startups', padding + 25, legendY);
    
    // Upvote legend
    ctx.beginPath();
    ctx.rect(padding + 100, legendY - 5, 15, 2);
    ctx.fillStyle = '#7F5AF0';
    ctx.fill();
    ctx.fillText('Upvotes', padding + 125, legendY);
}

// ==========================================================================
// 14. Subscription Form
// ==========================================================================

const subscriptionForm = document.getElementById('subscriptionForm');

if (subscriptionForm) {
    subscriptionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        
        // Get selected interests
        const interests = [];
        document.querySelectorAll('input[name="interests"]:checked').forEach(checkbox => {
            interests.push(checkbox.value);
        });
        
        // In a real application, you would send this data to your server
        console.log('Subscription data:', { firstName, lastName, email, interests });
        
        // Show success notification
        showNotification(`Thanks for subscribing, ${firstName}! We'll keep you updated on the latest startup news.`);
        
        // Reset the form
        subscriptionForm.reset();
    });
}

// ==========================================================================
// 15. Mobile Navigation
// ==========================================================================

/**
 * Initialize mobile navigation menu
 */
function initMobileNav() {
    const navLinks = document.querySelector('.nav-links');
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'md:hidden p-2 rounded-lg hover:bg-gray-800 transition-theme fixed right-4 top-4 z-50 bg-gray-900 bg-opacity-50 backdrop-blur-sm';
    hamburgerBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    `;
    
    // Add the hamburger button to the navbar
    const navbarContainer = document.querySelector('.gradient-navbar .container');
    if (navbarContainer) {
        navbarContainer.insertBefore(hamburgerBtn, navLinks);
        
        // On smaller screens, hide nav links by default and show on hamburger click
        if (window.innerWidth < 768) {
            navLinks.classList.add('hidden');
            navLinks.classList.add('flex-col');
            navLinks.classList.add('absolute');
            navLinks.classList.add('top-16');
            navLinks.classList.add('right-4');
            navLinks.classList.add('bg-gray-900');
            navLinks.classList.add('bg-opacity-90');
            navLinks.classList.add('backdrop-blur-md');
            navLinks.classList.add('p-4');
            navLinks.classList.add('rounded-lg');
            navLinks.classList.add('shadow-xl');
            navLinks.classList.add('z-50');
            navLinks.classList.add('space-y-3');
            navLinks.classList.add('w-48');
            navLinks.classList.add('border');
            navLinks.classList.add('border-gray-700');
        }
        
        hamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('hidden');
            
            // Animate hamburger button
            hamburgerBtn.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.2)' },
                { transform: 'scale(1)' }
            ], { duration: 300 });
            
            // Add slide-in animation to the menu
            if (!navLinks.classList.contains('hidden')) {
                navLinks.animate([
                    { transform: 'translateX(20px)', opacity: 0 },
                    { transform: 'translateX(0)', opacity: 1 }
                ], { duration: 200, easing: 'ease-out' });
            }
        });
        
        // Close mobile menu when clicking a nav link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    navLinks.classList.add('hidden');
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                navLinks.classList.remove('hidden', 'flex-col', 'absolute', 'top-16', 'right-4', 
                                          'bg-gray-900', 'bg-opacity-90', 'backdrop-blur-md', 
                                          'p-4', 'rounded-lg', 'shadow-xl', 'z-50', 'space-y-3',
                                          'w-48', 'border', 'border-gray-700');
            } else {
                navLinks.classList.add('hidden', 'flex-col', 'absolute', 'top-16', 'right-4', 
                                       'bg-gray-900', 'bg-opacity-90', 'backdrop-blur-md', 
                                       'p-4', 'rounded-lg', 'shadow-xl', 'z-50', 'space-y-3',
                                       'w-48', 'border', 'border-gray-700');
            }
        });
    }
}

// ==========================================================================
// 16. Theme-Specific CSS Variable Updater
// ==========================================================================

/**
 * Update CSS variables based on current theme
 */
function updateThemeVariables() {
    const isDark = document.documentElement.classList.contains('dark');
    
    // Update chart if it exists
    const growthChartEl = document.getElementById('growthChart');
    if (growthChartEl) {
        const activeButton = document.querySelector('.bg-blue-500');
        if (activeButton) {
            const timeframe = activeButton.id.replace('View', '');
            renderGrowthChart(growthChartEl, timeframe);
        } else {
            renderGrowthChart(growthChartEl, 'weekly');
        }
    }
}

// Listen for dark mode toggle to update theme-specific elements
document.getElementById('darkModeToggle')?.addEventListener('click', () => {
    // Wait for the DOM to update with the new theme
    setTimeout(updateThemeVariables, 100);
});

// ==========================================================================
// 17. Initialize Additional Features
// ==========================================================================

// Initialize all the new features when the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Text scramble and other existing code...
    
    // Initialize new features
    updateFeaturedStartup();
    initMobileNav();
    updateDashboard();
    updateThemeVariables();
    
    // Add CSS for the highlight pulse effect
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes highlight-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(127, 90, 240, 0); }
            50% { box-shadow: 0 0 0 10px rgba(127, 90, 240, 0.3); }
        }
        .highlight-pulse {
            animation: highlight-pulse 1s ease-in-out 2;
        }
    `;
    document.head.appendChild(style);
});