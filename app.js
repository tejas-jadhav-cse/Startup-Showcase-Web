// Store startup ideas in memory
let startupIdeas = [];
let nextId = 1;

// DOM Elements
const startupForm = document.getElementById('startupForm');
const startupGrid = document.getElementById('startupGrid');
const filterInput = document.getElementById('filter');
const darkModeToggle = document.getElementById('darkModeToggle');

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

// Form submission handler
startupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const startupName = document.getElementById('startupName').value.trim();
    const founderName = document.getElementById('founderName').value.trim();
    const description = document.getElementById('description').value.trim();
    const tagsInput = document.getElementById('tags').value.trim();
    
    // Process tags (split by comma and trim whitespace)
    const tags = tagsInput.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
    
    // Create new startup idea object
    const newStartup = {
        id: nextId++,
        startupName,
        founderName,
        description,
        tags,
        upvotes: 0,
        timestamp: new Date().toISOString()
    };
    
    // Add to array and render
    startupIdeas.push(newStartup);
    renderStartupCard(newStartup);
    
    // Reset the form
    startupForm.reset();

    // Show success message (optional)
    showNotification('Startup idea submitted successfully!');
});

// Create and render a startup card
function renderStartupCard(startup) {
    const card = document.createElement('div');
    card.id = `startup-${startup.id}`;
    card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-theme hover:shadow-lg';
    
    // Create tag elements
    const tagsHtml = startup.tags.map(tag => 
        `<span class="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded-full mr-2 mb-2">${escapeHtml(tag)}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="p-6">
            <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">${escapeHtml(startup.startupName)}</h4>
            <p class="text-gray-700 dark:text-gray-300 mb-4">${escapeHtml(startup.description)}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span class="font-medium">Founder:</span> ${escapeHtml(startup.founderName)}
            </p>
            <div class="mb-4">
                ${tagsHtml}
            </div>
            <div class="flex items-center justify-between">
                <button class="upvote-btn flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" data-id="${startup.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <span class="upvote-count">${startup.upvotes}</span>
                </button>
                <span class="text-xs text-gray-500 dark:text-gray-500">${formatDate(startup.timestamp)}</span>
            </div>
        </div>
    `;
    
    // Add to the grid
    startupGrid.prepend(card);
    
    // Add upvote event listener
    card.querySelector('.upvote-btn').addEventListener('click', handleUpvote);
}

// Handle upvote button click
function handleUpvote(e) {
    const button = e.currentTarget;
    const id = parseInt(button.getAttribute('data-id'));
    
    // Find the startup and increase upvotes
    const startup = startupIdeas.find(s => s.id === id);
    if (startup) {
        startup.upvotes++;
        
        // Update the upvote count in the DOM
        button.querySelector('.upvote-count').textContent = startup.upvotes;
        
        // Add a visual feedback
        button.classList.add('text-indigo-600', 'dark:text-indigo-400');
        setTimeout(() => {
            button.classList.remove('text-indigo-600', 'dark:text-indigo-400');
        }, 300);
    }
}

// Filter startups by tag or keyword
filterInput.addEventListener('input', () => {
    const filterText = filterInput.value.toLowerCase().trim();
    
    // If empty, show all cards
    if (!filterText) {
        document.querySelectorAll('#startupGrid > div').forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    // Filter and show/hide cards
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
});

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
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 opacity-100';
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add some sample data for demonstration (optional - can be removed)
function addSampleStartups() {
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
    
    // Add each sample to the array and render
    samples.forEach(sample => {
        const startup = {
            ...sample,
            id: nextId++,
            timestamp: new Date().toISOString()
        };
        startupIdeas.push(startup);
        renderStartupCard(startup);
    });
}

// Initialize with sample data
window.addEventListener('DOMContentLoaded', () => {
    addSampleStartups();
});