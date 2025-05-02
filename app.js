// Store startup ideas in memory and localStorage
let startupIdeas = JSON.parse(localStorage.getItem('startupIdeas') || '[]');
let nextId = startupIdeas.length ? Math.max(...startupIdeas.map(s => s.id)) + 1 : 1;

// DOM Elements
const startupForm = document.getElementById('startupForm');
const startupGrid = document.getElementById('startupGrid');
const filterInput = document.getElementById('filter');
const darkModeToggle = document.getElementById('darkModeToggle');
const openSubmitModalBtn = document.getElementById('openSubmitModal');

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
    document.documentElement.classList.add('dark');
}

// Dark mode toggle functionality
darkModeToggle.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'disabled');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'enabled');
    }
});

// Modal system
let activeModal = null;
function openModal(contentHtml) {
    if (activeModal) closeModal();
    const modalBg = document.createElement('div');
    modalBg.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in-up';
    modalBg.innerHTML = `
        <div class="glass rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in-up">
            <button class="absolute top-3 right-3 text-gray-400 hover:text-pink-400 text-2xl font-bold" id="closeModalBtn">&times;</button>
            ${contentHtml}
        </div>
    `;
    document.body.appendChild(modalBg);
    document.body.style.overflow = 'hidden';
    activeModal = modalBg;
    modalBg.querySelector('#closeModalBtn').onclick = closeModal;
}
function closeModal() {
    if (activeModal) {
        activeModal.remove();
        document.body.style.overflow = '';
        activeModal = null;
    }
}

// Move form into modal
openSubmitModalBtn.addEventListener('click', () => {
    openModal(`
        <h3 class='text-2xl font-semibold mb-4 text-gray-100'>Submit Your Startup Idea</h3>
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
        <h3 class='text-xl font-bold mb-2 text-pink-400'>Contact Founder</h3>
        <p class='mb-4 text-gray-200'>Send a message to <span class='font-semibold'>${escapeHtml(startup.founderName)}</span> about <span class='font-semibold'>${escapeHtml(startup.startupName)}</span>.</p>
        <textarea id='contactMsg' rows='3' class='w-full px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 mb-4' placeholder='Your message...'></textarea>
        <button class='px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow hover:scale-105 transition-all' onclick='closeModal()'>Send</button>
    `);
}
function openPartnershipModal(startup) {
    openModal(`
        <h3 class='text-xl font-bold mb-2 text-purple-400'>Request Partnership</h3>
        <p class='mb-4 text-gray-200'>Request a partnership with <span class='font-semibold'>${escapeHtml(startup.startupName)}</span>.</p>
        <textarea id='partnerMsg' rows='3' class='w-full px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 mb-4' placeholder='Your proposal...'></textarea>
        <button class='px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl shadow hover:scale-105 transition-all' onclick='closeModal()'>Send</button>
    `);
}

// Render all startups
function renderAllStartups() {
    startupGrid.innerHTML = '';
    startupIdeas.forEach(renderStartupCard);
}

// Create and render a startup card
function renderStartupCard(startup) {
    const card = document.createElement('div');
    card.id = `startup-${startup.id}`;
    card.className = 'osmo-card shadow osmo-card transition-theme';
    // Create tag elements
    const tagsHtml = startup.tags.map(tag => 
        `<span class="osmo-badge">${escapeHtml(tag)}</span>`
    ).join('');
    card.innerHTML = `
        <div class="p-6">
            <h4 class="text-xl font-extrabold text-[#18181b] mb-2 tracking-tight">${escapeHtml(startup.startupName)}</h4>
            <p class="text-[#52525b] mb-4 font-medium">${escapeHtml(startup.description)}</p>
            <p class="text-sm text-[#52525b] mb-3">
                <span class="font-medium">Founder:</span> ${escapeHtml(startup.founderName)}
            </p>
            <div class="mb-4 flex flex-wrap">${tagsHtml}</div>
            <div class="flex items-center justify-between space-x-2">
                <button class="upvote-btn flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors osmo-btn px-4 py-1 text-xs" data-id="${startup.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <span class="upvote-count">${startup.upvotes}</span>
                </button>
                <button class="contact-btn osmo-btn px-4 py-1 text-xs font-semibold shadow" data-id="${startup.id}">📞 Contact</button>
                <button class="partner-btn osmo-btn px-4 py-1 text-xs font-semibold shadow" data-id="${startup.id}">🤝 Request Partnership</button>
                <span class="text-xs text-[#52525b]">${formatDate(startup.timestamp)}</span>
            </div>
        </div>
    `;
    startupGrid.appendChild(card);
    card.querySelector('.upvote-btn').addEventListener('click', handleUpvote);
    card.querySelector('.contact-btn').addEventListener('click', () => openContactModal(startup));
    card.querySelector('.partner-btn').addEventListener('click', () => openPartnershipModal(startup));
}

// Handle upvote button click with animation
function handleUpvote(e) {
    const button = e.currentTarget;
    const id = parseInt(button.getAttribute('data-id'));
    const startup = startupIdeas.find(s => s.id === id);
    if (startup) {
        startup.upvotes++;
        localStorage.setItem('startupIdeas', JSON.stringify(startupIdeas));
        button.querySelector('.upvote-count').textContent = startup.upvotes;
        button.classList.add('scale-125', 'text-pink-500');
        setTimeout(() => {
            button.classList.remove('scale-125', 'text-pink-500');
        }, 300);
    }
}

// Debounced filter
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

// Go to Top button
const goTopBtn = document.createElement('button');
goTopBtn.innerHTML = '<svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>';
goTopBtn.className = 'fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg opacity-0 pointer-events-none transition-all duration-300';
goTopBtn.title = 'Go to Top';
document.body.appendChild(goTopBtn);
goTopBtn.onclick = () => window.scrollTo({top:0, behavior:'smooth'});
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        goTopBtn.classList.remove('opacity-0', 'pointer-events-none');
        goTopBtn.classList.add('opacity-100');
    } else {
        goTopBtn.classList.add('opacity-0', 'pointer-events-none');
        goTopBtn.classList.remove('opacity-100');
    }
});

document.documentElement.style.scrollBehavior = 'smooth';

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Show notification message (optional)
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl shadow-lg transform transition-all duration-300 translate-y-0 opacity-100';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Entrance animation utility
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