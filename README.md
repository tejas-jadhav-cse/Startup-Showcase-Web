# 🚀 Student Startup Showcase

<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen" alt="Status: Active">
  <img src="https://img.shields.io/badge/Version-1.0-blue" alt="Version: 1.0">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License: MIT">
  <img src="https://img.shields.io/badge/Made%20with-❤️-red" alt="Made with love">
</div>

A responsive web application for students to share and discover innovative startup ideas, built with modern web technologies.

<details>
<summary>✨ Key Features</summary>

- **📱 Responsive Design**: Optimized for both mobile and desktop viewing using Tailwind CSS
- **🌓 Dark Mode**: Toggle between light and dark themes with persistent user preference
- **📝 Startup Idea Submission**: Form for submitting new startup ideas with various fields
- **🎴 Dynamic Card Display**: Submitted ideas appear as styled cards in a responsive grid
- **👍 Upvoting System**: Users can upvote startup ideas they like
- **🔍 Filtering**: Filter startup ideas by tags or keywords
- **💾 Sample Data**: Includes demonstration data to showcase the app's functionality
</details>

## 🛠️ Technology Stack

<div align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
</div>

- **HTML5**: For structure and content
- **Tailwind CSS**: For responsive styling and UI components
- **Vanilla JavaScript**: For interactivity and DOM manipulation

## 📋 Quick Start

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/student-startup-showcase.git
   ```
2. Open `index.html` in any modern web browser
3. Browse existing startup ideas in the responsive card grid
4. Submit your own startup idea using the form
5. Use the filter function to find specific types of startups

## 🗂️ Project Structure

```
student-startup-showcase/
├── index.html     # Main HTML file with UI structure
├── styles.css     # Custom CSS styles
├── app.js         # JavaScript functionality and logic
└── README.md      # Project documentation
```

## 🌟 Features Implementation

### 🌓 Dark Mode Toggle

The app includes a sleek dark mode toggle that uses Tailwind's dark mode feature. User preferences are saved to local storage for a consistent experience across visits.

```javascript
// Dark mode toggle functionality
document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  // Save preference to localStorage
});
```

### 📱 Responsive Design

Using Tailwind's responsive utilities, the app adapts seamlessly to different screen sizes:
- Single column layout on mobile devices
- Two columns on tablets
- Three columns on desktop displays

### 📝 Form Submission

The intuitive form captures comprehensive startup details including:
- Startup Name
- Founder Name
- Description
- Tags (comma-separated)
- Optional image URL

### 🎴 Card Display

Each startup idea is rendered as an elegantly designed card showing:
- Startup name
- Description
- Founder name
- Tags (as styled badges)
- Upvote button with counter
- Submission date

## 🔮 Future Enhancements

- 🔐 User accounts and authentication
- 💽 Persistent storage using a backend database
- 💬 Comments section for each startup
- 🔗 Sharing functionality for social media
- 🔄 Sorting options (newest, most upvoted, etc.)

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  Created with ❤️ by <b>Tejas Jadhav</b><br>
  Maintained by <b>SECT Community</b> © 2025
</div>