// Global sheet data & state
let sheetData = [];
let solvedProblems = new Set();
let currentFilter = 'all';
let currentSearch = '';

// SVG Icons for platforms
const ICONS = {
    gfg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.12 0 2.05-.74 2.36-1.72C16.95 6.75 18 9.24 18 12c0 2.09-.64 4.02-1.74 5.61z"/></svg>`,
    leetcode: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-9.77 9.77a.62.62 0 0 0-.078.078l-.056.056a3.671 3.671 0 0 0-1.008 2.568c0 1.04.4 1.96 1.008 2.568l3.758 3.758a3.671 3.671 0 0 0 2.568 1.008c1.04 0 1.96-.4 2.568-1.008l9.77-9.77a1.374 1.374 0 0 0-.414-2.336l-9.77-9.77A1.374 1.374 0 0 0 13.483 0zm-2.827 10.93a1.374 1.374 0 1 1 0 2.748 1.374 1.374 0 0 1 0-2.748z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    article: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`
};

/**
 * Initialize state, themes, and fetch data
 */
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    loadState();
    setupEventListeners();
    await fetchSheetData();
});

/**
 * Theme Management
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleUI(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleUI(newTheme);
}

function updateThemeToggleUI(theme) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (theme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

/**
 * Load checkbox states from localStorage
 */
function loadState() {
    const saved = localStorage.getItem('atoz_dsa_solved');
    if (saved) {
        try {
            const arr = JSON.parse(saved);
            solvedProblems = new Set(arr);
        } catch (e) {
            console.error("Error parsing solved states", e);
        }
    }
}

/**
 * Save checkbox states to localStorage
 */
function saveState() {
    localStorage.setItem('atoz_dsa_solved', JSON.stringify(Array.from(solvedProblems)));
}

/**
 * Generate stable unique problem identifier
 */
function generateId(stepTitle, subStepTitle, problemTitle) {
    const clean = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${clean(stepTitle)}_${clean(subStepTitle)}_${clean(problemTitle)}`;
}

/**
 * Fetch data.json
 */
async function fetchSheetData() {
    const loadingIndicator = document.getElementById('loading-indicator');
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        sheetData = await response.json();
        
        // Enrich problems with stable IDs
        sheetData.forEach(step => {
            if (step.sub_steps) {
                step.sub_steps.forEach(sub => {
                    if (sub.problems) {
                        sub.problems.forEach(prob => {
                            prob.id = generateId(step.title, sub.title, prob.title);
                        });
                    }
                });
            } else if (step.problems) {
                step.problems.forEach(prob => {
                    prob.id = generateId(step.title, '', prob.title);
                });
            }
        });

        loadingIndicator.classList.add('hidden');
        
        // Setup default counters
        const total = countTotalProblems(sheetData);
        document.getElementById('total-count').textContent = total;

        // Render Page
        renderSheet();
    } catch (error) {
        console.error("Failed to load sheet data", error);
        loadingIndicator.innerHTML = `
            <div style="color: red; font-weight: bold;">⚠️ Error Loading Data</div>
            <p style="margin-top: 0.5rem;">Please ensure you run a local web server (e.g. <code>npm run dev</code>) and that <code>data.json</code> is accessible.</p>
        `;
    }
}

/**
 * Helper to count total problems in parsed hierarchy
 */
function countTotalProblems(data) {
    let count = 0;
    data.forEach(step => {
        if (step.sub_steps) {
            step.sub_steps.forEach(sub => {
                count += (sub.problems || []).length;
            });
        } else {
            count += (step.problems || []).length;
        }
    });
    return count;
}

/**
 * Event Listeners
 */
function setupEventListeners() {
    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Search input
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        if (currentSearch) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
        renderSheet();
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearch = '';
        clearBtn.classList.add('hidden');
        searchInput.focus();
        renderSheet();
    });

    // Filters Toggle
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderSheet();
        });
    });
}

/**
 * Update stats dashboard counters & progress bars
 */
function updateProgress() {
    const totalProblems = countTotalProblems(sheetData);
    const solvedCount = solvedProblems.size;
    const percent = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

    // Update Overall Numbers
    document.getElementById('solved-count').textContent = solvedCount;
    document.getElementById('progress-percent').textContent = `${percent}%`;
    document.getElementById('progress-bar-fill').style.width = `${percent}%`;

    // Circular Progress Ring animation
    // Circle circumference = 2 * pi * r = 2 * 3.14159 * 34 = ~213.628
    const circle = document.getElementById('progress-ring-circle');
    if (circle) {
        const circumference = 213.628;
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    // Update progress stats on each step header badge
    sheetData.forEach(step => {
        const stepId = cleanId(step.title);
        const badge = document.getElementById(`badge-${stepId}`);
        const stepCard = document.getElementById(`card-${stepId}`);
        
        if (badge && stepCard) {
            let stepTotal = 0;
            let stepSolved = 0;
            
            if (step.sub_steps) {
                step.sub_steps.forEach(sub => {
                    (sub.problems || []).forEach(prob => {
                        stepTotal++;
                        if (solvedProblems.has(prob.id)) stepSolved++;
                    });
                });
            } else {
                (step.problems || []).forEach(prob => {
                    stepTotal++;
                    if (solvedProblems.has(prob.id)) stepSolved++;
                });
            }

            badge.textContent = `${stepSolved}/${stepTotal}`;
            
            // Toggle complete color coding
            if (stepTotal > 0 && stepSolved === stepTotal) {
                stepCard.classList.add('completed');
            } else {
                stepCard.classList.remove('completed');
            }
        }
    });
}

/**
 * Render steps, sub-steps and tables based on active search & filters
 */
function renderSheet() {
    const container = document.getElementById('steps-container');
    container.innerHTML = '';
    
    let totalRenderedProblems = 0;

    sheetData.forEach(step => {
        const subStepsToRender = [];
        
        if (step.sub_steps) {
            step.sub_steps.forEach(sub => {
                const filteredProblems = (sub.problems || []).filter(prob => {
                    // Filter match
                    const isSolved = solvedProblems.has(prob.id);
                    if (currentFilter === 'pending' && isSolved) return false;
                    if (currentFilter === 'completed' && !isSolved) return false;
                    
                    // Search match
                    if (currentSearch) {
                        const q = currentSearch.toLowerCase();
                        return prob.title.toLowerCase().includes(q);
                    }
                    return true;
                });
                
                if (filteredProblems.length > 0) {
                    subStepsToRender.push({
                        ...sub,
                        problems: filteredProblems
                    });
                    totalRenderedProblems += filteredProblems.length;
                }
            });
        } else {
            // Direct problems (if any)
            const filteredProblems = (step.problems || []).filter(prob => {
                const isSolved = solvedProblems.has(prob.id);
                if (currentFilter === 'pending' && isSolved) return false;
                if (currentFilter === 'completed' && !isSolved) return false;
                
                if (currentSearch) {
                    const q = currentSearch.toLowerCase();
                    return prob.title.toLowerCase().includes(q);
                }
                return true;
            });
            
            if (filteredProblems.length > 0) {
                subStepsToRender.push({
                    title: '', // Empty sub-step title indicates direct rendering
                    problems: filteredProblems
                });
                totalRenderedProblems += filteredProblems.length;
            }
        }

        // If this step has sub-steps or problems that survived filters, render it!
        if (subStepsToRender.length > 0) {
            const stepEl = createStepElement(step, subStepsToRender);
            container.appendChild(stepEl);
        }
    });

    // Empty state logic
    const emptyState = document.getElementById('empty-state');
    if (totalRenderedProblems === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    // Always sync progress stats after rendering
    updateProgress();
}

/**
 * Creates step element (Main Accordion block)
 */
function createStepElement(step, subSteps) {
    const stepId = cleanId(step.title);
    const card = document.createElement('div');
    card.id = `card-${stepId}`;
    card.className = 'step-card card';
    
    // Check if it was previously active (preserve accordion state during renders)
    const prevActive = document.querySelector(`#card-${stepId}.active`);
    if (prevActive) {
        card.classList.add('active');
    }

    const header = document.createElement('button');
    header.className = 'step-header';
    header.innerHTML = `
        <div class="step-title-wrapper">
            <span class="step-title">${step.title}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span id="badge-${stepId}" class="step-progress-badge">0/0</span>
            <svg class="step-arrow-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </div>
    `;

    const content = document.createElement('div');
    content.className = 'step-content';
    
    const inner = document.createElement('div');
    inner.className = 'step-content-inner';

    subSteps.forEach(sub => {
        if (sub.title) {
            const subEl = createSubStepElement(sub);
            inner.appendChild(subEl);
        } else {
            // Render problems directly (no sub-step container)
            const table = createProblemsTable(sub.problems);
            inner.appendChild(table);
        }
    });

    content.appendChild(inner);
    card.appendChild(header);
    card.appendChild(content);

    // Expand / collapse logic
    header.addEventListener('click', () => {
        card.classList.toggle('active');
    });

    return card;
}

/**
 * Creates sub-step element (Nested accordion block)
 */
function createSubStepElement(subStep) {
    const subStepId = cleanId(subStep.title);
    const card = document.createElement('div');
    card.className = 'sub-step-card';
    
    // Check if it was previously active
    const prevActive = document.querySelector(`.sub-step-card[data-id="${subStepId}"].active`);
    if (prevActive) {
        card.classList.add('active');
    }
    card.setAttribute('data-id', subStepId);

    const header = document.createElement('button');
    header.className = 'sub-step-header';
    header.innerHTML = `
        <span class="sub-step-title">${subStep.title}</span>
        <svg class="step-arrow-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
    `;

    const content = document.createElement('div');
    content.className = 'sub-step-content';

    const inner = document.createElement('div');
    inner.className = 'sub-step-content-inner';
    
    const table = createProblemsTable(subStep.problems);
    inner.appendChild(table);

    content.appendChild(inner);
    card.appendChild(header);
    card.appendChild(content);

    header.addEventListener('click', () => {
        card.classList.toggle('active');
    });

    return card;
}

/**
 * Creates responsive problems table
 */
function createProblemsTable(problems) {
    const table = document.createElement('table');
    table.className = 'problems-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th class="col-status">Status</th>
                <th class="col-title">Problem</th>
                <th class="col-link">GfG</th>
                <th class="col-link">LeetCode</th>
                <th class="col-link">Solution</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    problems.forEach(prob => {
        const isSolved = solvedProblems.has(prob.id);
        const tr = document.createElement('tr');
        tr.className = `problem-row ${isSolved ? 'solved' : ''}`;
        tr.id = `row-${prob.id}`;

        // Status Checkbox
        const tdStatus = document.createElement('td');
        tdStatus.className = 'col-status';
        tdStatus.innerHTML = `
            <label class="checkbox-container">
                <input type="checkbox" ${isSolved ? 'checked' : ''} data-id="${prob.id}">
                <span class="checkmark"></span>
            </label>
        `;

        // Problem Title
        const tdTitle = document.createElement('td');
        tdTitle.className = 'col-title';
        if (prob.article_link) {
            tdTitle.innerHTML = `
                <a href="${prob.article_link}" target="_blank" rel="noopener" class="problem-title-link">
                    ${prob.title}
                    ${ICONS.article}
                </a>
            `;
        } else {
            tdTitle.innerHTML = `<span class="problem-title-text">${prob.title}</span>`;
        }

        // GfG link
        const tdGfg = document.createElement('td');
        tdGfg.className = 'col-link';
        if (prob.gfg_link) {
            tdGfg.innerHTML = `<a href="${prob.gfg_link}" target="_blank" rel="noopener" class="btn-platform btn-gfg" aria-label="Solve on GeeksforGeeks">${ICONS.gfg}</a>`;
        } else {
            tdGfg.innerHTML = `<button class="btn-platform disabled" aria-disabled="true">${ICONS.gfg}</button>`;
        }

        // LeetCode link
        const tdLeet = document.createElement('td');
        tdLeet.className = 'col-link';
        if (prob.leetcode_link) {
            tdLeet.innerHTML = `<a href="${prob.leetcode_link}" target="_blank" rel="noopener" class="btn-platform btn-leetcode" aria-label="Solve on LeetCode">${ICONS.leetcode}</a>`;
        } else {
            tdLeet.innerHTML = `<button class="btn-platform disabled" aria-disabled="true">${ICONS.leetcode}</button>`;
        }

        // Solution link (YouTube)
        const tdSol = document.createElement('td');
        tdSol.className = 'col-link';
        if (prob.solution_link) {
            tdSol.innerHTML = `<a href="${prob.solution_link}" target="_blank" rel="noopener" class="btn-platform btn-youtube" aria-label="Watch video solution">${ICONS.youtube}</a>`;
        } else {
            tdSol.innerHTML = `<button class="btn-platform disabled" aria-disabled="true">${ICONS.youtube}</button>`;
        }

        tr.appendChild(tdStatus);
        tr.appendChild(tdTitle);
        tr.appendChild(tdGfg);
        tr.appendChild(tdLeet);
        tr.appendChild(tdSol);
        tbody.appendChild(tr);

        // Bind checkbox click event
        const checkbox = tdStatus.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            if (e.target.checked) {
                solvedProblems.add(id);
                tr.classList.add('solved');
            } else {
                solvedProblems.delete(id);
                tr.classList.remove('solved');
            }
            saveState();
            updateProgress();
        });
    });

    return table;
}

/**
 * Simple helper to format text strings into element ids safely
 */
function cleanId(title) {
    return (title || '').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();
}
