// Calendar functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    setupEventListeners();
    initializeTimeGrid();
    updateCurrentTimeIndicator();
    
    // Update current time indicator every minute
    setInterval(updateCurrentTimeIndicator, 60000);
});

function initializeTimeGrid() {
    createTimeLabels();
    createHourLines();
}

function createTimeLabels() {
    const timeLabelsContainer = document.querySelector('.time-labels');
    if (!timeLabelsContainer) return;

    // Create labels from 8:00 to 20:00
    for (let hour = 8; hour <= 20; hour++) {
        const label = document.createElement('div');
        label.className = 'absolute text-sm text-gray-500 font-medium';
        label.style.top = `${(hour - 8) * 60}px`;
        label.textContent = `${hour.toString().padStart(2, '0')}:00`;
        timeLabelsContainer.appendChild(label);
    }
}

function createHourLines() {
    const timeLinesContainer = document.querySelector('.time-lines');
    if (!timeLinesContainer) return;

    // Create hour lines from 8:00 to 20:00
    for (let hour = 8; hour <= 20; hour++) {
        // Full hour line
        const line = document.createElement('div');
        line.className = 'absolute w-full border-t border-gray-200';
        line.style.top = `${(hour - 8) * 60}px`;
        timeLinesContainer.appendChild(line);

        // Half-hour line (except for the last hour)
        if (hour < 20) {
            const halfHourLine = document.createElement('div');
            halfHourLine.className = 'absolute w-full border-t border-gray-100';
            halfHourLine.style.top = `${(hour - 8) * 60 + 30}px`;
            timeLinesContainer.appendChild(halfHourLine);
        }
    }
}

function updateCurrentTimeIndicator() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Only show indicator during business hours (8:00-20:00)
    if (hours >= 8 && hours <= 20) {
        const indicator = document.querySelector('.current-time-indicator');
        if (indicator) {
            const minutesSince8am = (hours - 8) * 60 + minutes;
            indicator.style.top = `${minutesSince8am}px`;
            indicator.style.display = 'block';
        }
    }
}

function initializeCalendar() {
    const today = new Date();
    const calendarBody = document.querySelector('.calendar-grid tbody');
    if (calendarBody) {
        populateCalendarDays(calendarBody, today);
    }
}

function populateCalendarDays(calendarBody, date) {
    calendarBody.innerHTML = '';
    
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    let currentWeek = document.createElement('tr');
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyCell = document.createElement('td');
        emptyCell.className = 'py-1 text-gray-400';
        currentWeek.appendChild(emptyCell);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        if (currentWeek.children.length === 7) {
            calendarBody.appendChild(currentWeek);
            currentWeek = document.createElement('tr');
        }
        
        const cell = document.createElement('td');
        cell.textContent = day;
        cell.className = 'py-1 calendar-cell cursor-pointer hover:bg-gray-50 transition-colors';
        
        if (day === date.getDate()) {
            cell.classList.add('selected', 'bg-blue-50', 'text-blue-600', 'font-medium');
        }
        
        currentWeek.appendChild(cell);
    }
    
    while (currentWeek.children.length < 7) {
        const emptyCell = document.createElement('td');
        emptyCell.className = 'py-1 text-gray-400';
        currentWeek.appendChild(emptyCell);
    }
    
    calendarBody.appendChild(currentWeek);
}

function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.fa-chevron-left').forEach(button => {
        button.parentElement.addEventListener('click', () => {
            // Handle previous navigation
            console.log('Previous clicked');
        });
    });
    
    document.querySelectorAll('.fa-chevron-right').forEach(button => {
        button.parentElement.addEventListener('click', () => {
            // Handle next navigation
            console.log('Next clicked');
        });
    });

    // Calendar cell clicks
    document.querySelectorAll('.calendar-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            document.querySelectorAll('.calendar-cell').forEach(c => 
                c.classList.remove('selected', 'bg-blue-50', 'text-blue-600', 'font-medium')
            );
            cell.classList.add('selected', 'bg-blue-50', 'text-blue-600', 'font-medium');
        });
    });

    // Grid column hover effects
    document.querySelectorAll('.grid-column').forEach(column => {
        column.addEventListener('mouseover', () => {
            column.classList.add('bg-gray-50');
        });
        
        column.addEventListener('mouseout', () => {
            column.classList.remove('bg-gray-50');
        });
    });
}

// Tooltip functionality
document.querySelectorAll('.tooltip').forEach(tooltip => {
    tooltip.addEventListener('mouseenter', (e) => {
        const text = e.currentTarget.getAttribute('data-tooltip');
        if (text) {
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'tooltip-content';
            tooltipEl.textContent = text;
            e.currentTarget.appendChild(tooltipEl);
        }
    });
    
    tooltip.addEventListener('mouseleave', (e) => {
        const tooltipContent = e.currentTarget.querySelector('.tooltip-content');
        if (tooltipContent) {
            tooltipContent.remove();
        }
    });
});
