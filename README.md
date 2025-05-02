# Student Startup Showcase

A responsive web application for students to share and discover startup ideas.

## Features

- **Responsive Design**: Optimized for both mobile and desktop viewing using Tailwind CSS
- **Dark Mode**: Toggle between light and dark themes with persistent user preference
- **Startup Idea Submission**: Form for submitting new startup ideas with various fields
- **Dynamic Card Display**: Submitted ideas appear as styled cards in a responsive grid
- **Upvoting System**: Users can upvote startup ideas they like
- **Filtering**: Filter startup ideas by tags or keywords
- **Sample Data**: Includes demonstration data to showcase the app's functionality

## Technology Stack

- **HTML5**: For structure and content
- **Tailwind CSS**: For responsive styling and UI components
- **Vanilla JavaScript**: For interactivity and DOM manipulation

## How to Use

1. Open `index.html` in any modern web browser
2. Browse existing startup ideas in the responsive card grid
3. Submit your own startup idea using the form
4. Use the filter function to find specific types of startups
5. Upvote ideas you find interesting

## Project Structure

- `index.html`: Main HTML file containing the structure and UI
- `app.js`: JavaScript file containing all the functionality and logic
- `README.md`: Documentation for the project

## Features Implementation

### Dark Mode Toggle

The app includes a dark mode toggle that uses Tailwind's dark mode feature. The preference is saved to local storage for persistence.

### Responsive Design

Using Tailwind's responsive utilities, the app adapts to different screen sizes:
- Single column layout on mobile
- Two columns on tablets
- Three columns on desktop

### Form Submission

The form captures startup details including:
- Startup Name
- Founder Name
- Description
- Tags (comma-separated)

### Card Display

Each startup idea is rendered as a card showing:
- Startup name
- Description
- Founder name
- Tags (as styled badges)
- Upvote button with counter
- Submission date

### Filtering System

The filter input allows users to search through:
- Startup names
- Descriptions
- Founder names
- Tags

## Future Enhancements

- User accounts and authentication
- Persistent storage using a backend database
- Comments section for each startup
- Sharing functionality for social media
- Sorting options (newest, most upvoted, etc.)