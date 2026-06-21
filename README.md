# AtoZ DSA Tracker ⚡

A beautiful, high-performance, and fully responsive personal progress tracker for mastering Data Structures and Algorithms. The tracker maps out **454 essential DSA coding problems** structured across 18 key topics, letting you easily track your learning path, search, filter, and access coding portals in a premium dark/light mode interface.

---

## Key Features

- **Progress Dashboard**: Glassmorphic dashboard showing overall completion statistics, a circular progress indicator, and a glowing overall progress bar.
- **Accordion Topic Blocks**: Smooth accordion expansions for the 18 main topics and their sub-steps. Each topic card includes its own progress tracker (e.g. `1/30` problems solved).
- **Persistent Progress Tracker**: Question checked states are tracked and saved in your browser's `localStorage`. Your progress stays safe and is restored instantly across page reloads.
- **Search & Filters**: 
  - Real-time search bar that filters problems by title instantly across all topics.
  - Tab filters to toggle between displaying *All*, *Pending*, or *Completed* questions.
- **Platform Access Badges**: Direct, clean links to GeeksforGeeks, LeetCode, and YouTube video solutions (without any external referral codes or UTM query tracking).
- **Theme Switcher**: Fluid dark theme (default) and a clean light theme toggle.
- **Mobile First & Responsive**: Desktop renders tables, while screen sizes below `768px` morph cells into beautifully aligned responsive card grids.

---

## Tech Stack

- **Structure**: Semantic HTML5 markup
- **Styling**: Vanilla CSS3 (CSS Variables for themes, CSS Grid, Flexbox, and transition curves)
- **Logic**: Vanilla ES6 JavaScript (local storage state persistence, dynamic render engine)
- **Bundler & Tooling**: Vite for hot-reloading local development server

---

## Getting Started

Follow these steps to run the application locally on your machine:

### 1. Install Dependencies
Make sure you have Node.js installed, then run:
```bash
npm install
```

### 2. Start the Development Server
Launch the local web server:
```bash
npm run dev
```
Once started, open your browser and navigate to the localhost URL outputted in the terminal (usually `http://localhost:5173/`).

### 3. Build for Production
To bundle and optimize the project for production deployment:
```bash
npm run build
```
This generates the final deployment-ready static files in the `dist/` directory.

---

## File Structure

```text
├── index.html          # Main HTML markup, SEO tags, and container layout
├── styles.css          # Core CSS stylesheet, variables, responsive design, and animations
├── app.js              # State manager, checkbox listeners, filters, search, and DOM builder
├── data.json           # Clean database of 454 parsed DSA problems and portal links
├── package.json        # Vite dev and build script configurations
├── package-lock.json   # Package locks for deterministic node installs
└── dist/               # Compiled static assets directory for deployment
```

---

## License & Attribution

Designed and Developed by Kaushal Sharma for personal use.

&copy; 2026 Kaushal Sharma. All rights reserved.
