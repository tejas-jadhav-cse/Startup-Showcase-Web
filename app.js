/**
 * Student Startup Showcase
 * Main application JavaScript
 */

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
            <h4 class="text-xl mb-2 tracking-tight text-[#18181b]">${escapeHtml(startup.startupName)}</h4>
            <p class="text-[#52525b] mb-4 font-normal">${escapeHtml(startup.description)}</p>
            <p class="text-sm text-[#52525b] mb-3">
                <span style="font-weight:400">Founder:</span> ${escapeHtml(startup.founderName)}
            </p>
            <div class="mb-4 flex flex-wrap">${tagsHtml}</div>
            <div class="flex items-center justify-between space-x-2">
                <button class="upvote-btn flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors osmo-btn px-4 py-1 text-xs" data-id="${startup.id}" style="font-weight:400;">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <span class="upvote-count">${startup.upvotes}</span>
                </button>
                <button class="contact-btn osmo-btn px-4 py-1 text-xs shadow" data-id="${startup.id}">📞 Contact</button>
                <button class="partner-btn osmo-btn px-4 py-1 text-xs shadow" data-id="${startup.id}">🤝 Request Partnership</button>
                <span class="text-xs text-[#52525b]">${formatDate(startup.timestamp)}</span>
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

// Go to Top button implementation
const goTopBtn = document.createElement('button');
goTopBtn.innerHTML = '<svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>';
goTopBtn.className = 'fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg opacity-0 pointer-events-none transition-all duration-300';
goTopBtn.title = 'Go to Top';
document.body.appendChild(goTopBtn);

goTopBtn.onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        goTopBtn.classList.remove('opacity-0', 'pointer-events-none');
        goTopBtn.classList.add('opacity-100');
    } else {
        goTopBtn.classList.add('opacity-0', 'pointer-events-none');
        goTopBtn.classList.remove('opacity-100');
    }
});

// Enable smooth scrolling
document.documentElement.style.scrollBehavior = 'smooth';

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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