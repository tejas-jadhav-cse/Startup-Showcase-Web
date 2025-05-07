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
        <div class="flex flex-col items-center mb-6">
            <label for="modalLogoUpload" class="w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-all relative overflow-hidden group">
                <input type="file" id="modalLogoUpload" accept="image/*" class="hidden" />
                <img id="modalLogoPreview" class="absolute inset-0 w-full h-full object-cover rounded-full hidden" alt="Logo Preview" />
                <span id="modalLogoPlaceholder" class="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 text-3xl flex items-center justify-center w-full h-full">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5v-9m-4.5 4.5h9"/></svg>
                </span>
            </label>
            <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-4 mb-1">Submit Your Startup Idea</h3>
            <p class="text-sm text-gray-400">Share your vision and inspire the community!</p>
        </div>
        <form id='modalStartupForm'>
            <div class='grid grid-cols-1 gap-4'>
                <div>
                    <label for='modalStartupName' class='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Startup Name</label>
                    <input type='text' id='modalStartupName' placeholder='e.g. EcoLearn' required class='px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 transition-all w-full' autocomplete='off'>
                </div>
                <div>
                    <label for='modalFounderName' class='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Founder Name</label>
                    <input type='text' id='modalFounderName' placeholder='e.g. Jamie Chen' required class='px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 transition-all w-full' autocomplete='off'>
                </div>
                <div>
                    <label for='modalDescription' class='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Description</label>
                    <textarea id='modalDescription' placeholder='Describe your idea in a few sentences...' required rows='3' maxlength='300' class='px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 transition-all w-full'></textarea>
                    <span class='text-xs text-gray-400'>Max 300 characters</span>
                </div>
                <div>
                    <label for='modalTags' class='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Tags <span class='text-gray-400'>(comma-separated)</span></label>
                    <input type='text' id='modalTags' placeholder='e.g. education, tech, sustainability' required class='px-4 py-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 transition-all w-full' autocomplete='off'>
                </div>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-sm text-gray-700 dark:text-gray-300">Want to share social media?</span>
                    <button type="button" id="toggleSocialMedia" class="relative w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none">
                        <span id="toggleDot" class="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-gray-900 rounded-full shadow transition-all duration-300"></span>
                    </button>
                </div>
                <div id="socialFields" class="grid grid-cols-1 gap-3 mt-2 overflow-hidden transition-all duration-500 max-h-0 opacity-0 pointer-events-none">
                    <div class="flex items-center gap-2">
                        <span class="w-5 h-5 text-pink-500"> <svg fill="currentColor" viewBox="0 0 24 24"><path d="M7.5 2C4.462 2 2 4.462 2 7.5v9C2 19.538 4.462 22 7.5 22h9c3.038 0 5.5-2.462 5.5-5.5v-9C22 4.462 19.538 2 16.5 2h-9zm0 1.5h9A4 4 0 0 1 20.5 7.5v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9A4 4 0 0 1 7.5 3.5zm4.5 2.25a4.25 4.25 0 1 0 0 8.5 4.25 4.25 0 0 0 0-8.5zm0 1.5a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5zm5.25 1.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg></span>
                        <input type="url" id="socialInstagram" placeholder="Instagram profile URL" class="flex-1 px-3 py-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition-all" autocomplete="off">
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-5 h-5 text-blue-500"> <svg fill="currentColor" viewBox="0 0 24 24"><path d="M22.162 5.656c-.793.352-1.645.59-2.54.698a4.48 4.48 0 0 0 1.963-2.475 8.94 8.94 0 0 1-2.828 1.08A4.48 4.48 0 0 0 11.07 9.03c0 .352.04.695.116 1.022C7.728 9.89 4.1 8.1 1.67 5.149a4.48 4.48 0 0 0-.606 2.254c0 1.555.792 2.927 2.002 3.732a4.48 4.48 0 0 1-2.03-.561v.057a4.48 4.48 0 0 0 3.6 4.393c-.193.053-.397.082-.607.082-.148 0-.292-.014-.432-.04a4.48 4.48 0 0 0 4.18 3.11A8.98 8.98 0 0 1 2 19.54a12.7 12.7 0 0 0 6.88 2.017c8.26 0 12.78-6.84 12.78-12.78 0-.195-.004-.39-.013-.583a9.13 9.13 0 0 0 2.24-2.34z"/></svg></span>
                        <input type="url" id="socialX" placeholder="X (Twitter) profile URL" class="flex-1 px-3 py-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition-all" autocomplete="off">
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-5 h-5 text-blue-700"> <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11.75 19h-2.25v-8.5h2.25v8.5zm-1.125-9.75c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm15.375 9.75h-2.25v-4.25c0-1.012-.018-2.312-1.409-2.312-1.409 0-1.625 1.1-1.625 2.236v4.326h-2.25v-8.5h2.162v1.162h.031c.301-.57 1.035-1.168 2.131-1.168 2.279 0 2.7 1.5 2.7 3.448v5.058zm-12.25-8.5h-.018v8.5h2.25v-8.5h-2.232zm0 0"/></svg></span>
                        <input type="url" id="socialLinkedin" placeholder="LinkedIn profile URL" class="flex-1 px-3 py-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition-all" autocomplete="off">
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="w-5 h-5 text-red-500"> <svg fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.999 2.999 0 0 0-2.112-2.112C19.163 3.5 12 3.5 12 3.5s-7.163 0-9.386.574a2.999 2.999 0 0 0-2.112 2.112C0 8.409 0 12 0 12s0 3.591.502 5.814a2.999 2.999 0 0 0 2.112 2.112C4.837 20.5 12 20.5 12 20.5s7.163 0 9.386-.574a2.999 2.999 0 0 0 2.112-2.112C24 15.591 24 12 24 12s0-3.591-.502-5.814zM9.545 15.568V8.432l6.545 3.568-6.545 3.568z"/></svg></span>
                        <input type="url" id="socialYoutube" placeholder="YouTube channel URL" class="flex-1 px-3 py-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 transition-all" autocomplete="off">
                    </div>
                </div>
            </div>
            <div class='mt-8 flex justify-end'>
                <button type='submit' class='px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-md hover:scale-105 transition-all text-lg'>
                    Submit Idea
                </button>
            </div>
        </form>
    `);

    // Logo upload preview logic
    const logoInput = document.getElementById('modalLogoUpload');
    const logoPreview = document.getElementById('modalLogoPreview');
    const logoPlaceholder = document.getElementById('modalLogoPlaceholder');
    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                logoPreview.src = ev.target.result;
                logoPreview.classList.remove('hidden');
                logoPlaceholder.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            logoPreview.src = '';
            logoPreview.classList.add('hidden');
            logoPlaceholder.classList.remove('hidden');
        }
    });

    // Social media toggle logic
    const toggleBtn = document.getElementById('toggleSocialMedia');
    const toggleDot = document.getElementById('toggleDot');
    const socialFields = document.getElementById('socialFields');
    let socialOpen = false;
    toggleBtn.addEventListener('click', () => {
        socialOpen = !socialOpen;
        if (socialOpen) {
            socialFields.style.maxHeight = '500px';
            socialFields.style.opacity = '1';
            socialFields.style.pointerEvents = 'auto';
            toggleBtn.classList.add('bg-blue-500');
            toggleDot.style.transform = 'translateX(16px)';
        } else {
            socialFields.style.maxHeight = '0';
            socialFields.style.opacity = '0';
            socialFields.style.pointerEvents = 'none';
            toggleBtn.classList.remove('bg-blue-500');
            toggleDot.style.transform = 'translateX(0)';
        }
    });

    // Handle form submission
    document.getElementById('modalStartupForm').onsubmit = (e) => {
        e.preventDefault();
        
        const startupName = document.getElementById('modalStartupName').value.trim();
        const founderName = document.getElementById('modalFounderName').value.trim();
        const description = document.getElementById('modalDescription').value.trim();
        const tagsInput = document.getElementById('modalTags').value.trim();
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        // Socials (optional)
        const socialInstagram = document.getElementById('socialInstagram').value.trim();
        const socialX = document.getElementById('socialX').value.trim();
        const socialLinkedin = document.getElementById('socialLinkedin').value.trim();
        const socialYoutube = document.getElementById('socialYoutube').value.trim();
        // Logo (optional)
        let logoData = '';
        if (logoInput.files[0]) {
            logoData = logoPreview.src;
        }
        const newStartup = {
            id: nextId++,
            startupName,
            founderName,
            description,
            tags,
            upvotes: 0,
            timestamp: new Date().toISOString(),
            logo: logoData,
            socials: {
                instagram: socialInstagram,
                x: socialX,
                linkedin: socialLinkedin,
                youtube: socialYoutube
            }
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
    const navLinks = document.getElementById('nav-links');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    
    if (mobileMenuToggle && navLinks) {
        // Ensure menu is hidden on mobile and visible on desktop at page load
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            navLinks.classList.add('hidden');
            navLinks.classList.remove('showing');
        } else {
            // Desktop view - always show the menu
            navLinks.classList.remove('hidden');
            navLinks.classList.remove('fixed');
        }
        
        // Toggle menu on hamburger click
        mobileMenuToggle.addEventListener('click', () => {
            if (navLinks.classList.contains('hidden')) {
                // Show menu
                navLinks.classList.remove('hidden');
                navLinks.classList.add('showing');
                setTimeout(() => {
                    navLinks.classList.remove('showing');
                }, 300);
            } else {
                // Hide menu
                navLinks.classList.add('hiding');
                setTimeout(() => {
                    navLinks.classList.add('hidden');
                    navLinks.classList.remove('hiding');
                }, 300);
            }
            
            // Animate hamburger button
            mobileMenuToggle.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.2)' },
                { transform: 'scale(1)' }
            ], { duration: 300 });
        });
        
        // Close mobile menu when clicking a nav link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    navLinks.classList.add('hiding');
                    setTimeout(() => {
                        navLinks.classList.add('hidden');
                        navLinks.classList.remove('hiding');
                    }, 300);
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const isMobile = window.innerWidth < 768;
            if (!isMobile) {
                // Desktop view - always show the menu
                navLinks.classList.remove('hiding', 'showing', 'hidden', 'fixed');
            } else if (!navLinks.classList.contains('showing') && !navLinks.classList.contains('hiding')) {
                // Mobile view - hide menu unless actively showing or hiding
                navLinks.classList.add('hidden');
            }
        });
    }
    
    // Initialize nav scroll effect
    initNavScroll();
}

/**
 * Add scroll effect to the navigation bar
 */
function initNavScroll() {
    const navbar = document.querySelector('.gradient-navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Set initial state based on scroll position
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }
}

// Initialize mobile navigation
document.addEventListener('DOMContentLoaded', function() {
    initMobileNav();
});

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