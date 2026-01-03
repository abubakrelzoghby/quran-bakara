// Global data storage - loaded from API
let DATA = null;
let CURRENT_WEEK = 1;

// LocalStorage keys and reading status structure
const READING_STATUS_KEY = 'baqaraReadingStatus';

// In-memory cache for server-side progress (from progress.json)
let REMOTE_PROGRESS = null;

// Simple 6-digit numeric passwords for each person (per device verification)
// NOTE: change here only if you want to regenerate passwords
const PERSON_PASSWORDS = {
    'مريم': '482913',
    'يحيى': '750246',
    'أحمد': '319578'
};

// Load reading status from localStorage
function loadReadingStatus() {
    try {
        const raw = localStorage.getItem(READING_STATUS_KEY);
        if (!raw) {
            return { persons: {} };
        }
        const parsed = JSON.parse(raw);
        if (!parsed.persons || typeof parsed.persons !== 'object') {
            return { persons: {} };
        }
        return parsed;
    } catch (e) {
        return { persons: {} };
    }
}

// Save reading status to localStorage
function saveReadingStatus(status) {
    try {
        localStorage.setItem(READING_STATUS_KEY, JSON.stringify(status));
    } catch (e) {
        // ignore storage errors
    }
}

// Build a unique key for a specific person's day in a specific week
function getDayKey(personName, weekNumber, dayNumber) {
    return `${personName}__week${weekNumber}-day${dayNumber}`;
}

// Check if a specific day is marked as completed for a person
function isDayCompleted(personName, weekNumber, dayNumber) {
    const key = getDayKey(personName, weekNumber, dayNumber);

    // Prefer remote/server state if available
    if (REMOTE_PROGRESS && Object.prototype.hasOwnProperty.call(REMOTE_PROGRESS, key)) {
        return !!REMOTE_PROGRESS[key];
    }

    // Fallback to localStorage state
    const status = loadReadingStatus();
    const person = status.persons[personName];
    if (!person || !person.completedDays) return false;
    return !!person.completedDays[key];
}

// Set completed state for a specific day for a person (local cache only)
function setDayCompleted(personName, weekNumber, dayNumber, completed) {
    const status = loadReadingStatus();
    if (!status.persons[personName]) {
        status.persons[personName] = { verified: false, completedDays: {} };
    }
    const person = status.persons[personName];
    if (!person.completedDays) {
        person.completedDays = {};
    }
    const key = getDayKey(personName, weekNumber, dayNumber);
    if (completed) {
        person.completedDays[key] = true;
    } else {
        delete person.completedDays[key];
    }
    saveReadingStatus(status);

    // Also update in-memory remote cache if it exists
    if (REMOTE_PROGRESS) {
        if (completed) {
            REMOTE_PROGRESS[key] = true;
        } else {
            delete REMOTE_PROGRESS[key];
        }
    }
}

// Load progress from server (progress.json via get_progress.php)
async function loadRemoteProgress() {
    try {
        const response = await fetch('api/get_progress.php', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        const data = await response.json();
        if (data && typeof data === 'object') {
            REMOTE_PROGRESS = data;
        } else {
            REMOTE_PROGRESS = {};
        }
    } catch (e) {
        // If server not available (e.g. opened via file://), keep REMOTE_PROGRESS null
        REMOTE_PROGRESS = null;
    }
}

// Save a single day state to the server
async function saveDayCompletedRemote(personName, weekNumber, dayNumber, completed) {
    const key = getDayKey(personName, weekNumber, dayNumber);
    try {
        const response = await fetch('api/save_progress.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key, completed })
        });
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        const data = await response.json();
        if (data && data.all && typeof data.all === 'object') {
            REMOTE_PROGRESS = data.all;
        } else {
            // Fallback: update local REMOTE_PROGRESS if present
            if (!REMOTE_PROGRESS) REMOTE_PROGRESS = {};
            if (completed) {
                REMOTE_PROGRESS[key] = true;
            } else {
                delete REMOTE_PROGRESS[key];
            }
        }
    } catch (e) {
        // Keep local state, but log error in console for debugging
        console.error('Failed to save remote progress', e);
    }
}

// Check if person is verified on this device (password entered once)
function isPersonVerified(personName) {
    const status = loadReadingStatus();
    const person = status.persons[personName];
    return !!(person && person.verified);
}

// Mark person as verified on this device
function setPersonVerified(personName) {
    const status = loadReadingStatus();
    if (!status.persons[personName]) {
        status.persons[personName] = { verified: true, completedDays: {} };
    } else {
        status.persons[personName].verified = true;
        if (!status.persons[personName].completedDays) {
            status.persons[personName].completedDays = {};
        }
    }
    saveReadingStatus(status);
}

// Determine CSS class for a given day based on date and completion status
function getDayCssClass(personName, dateForDay, weekNumber, dayNumber) {
    // Special handling for compensation day (day 7)
    if (dayNumber === 7) {
        // Check if all reading days (1-6) are completed
        let allDaysCompleted = true;
        for (let day = 1; day <= 6; day++) {
            if (!isDayCompleted(personName, weekNumber, day)) {
                allDaysCompleted = false;
                break;
            }
        }
        
        // If all days completed → green, otherwise → yellow (warning)
        return allDaysCompleted ? 'day-complete' : 'day-compensation-warning';
    }

    const today = new Date();
    // Normalize times to compare dates only
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayMidnight = new Date(dateForDay.getFullYear(), dateForDay.getMonth(), dateForDay.getDate());

    const completed = isDayCompleted(personName, weekNumber, dayNumber);

    // If completed, always show as completed (green), regardless of date
    if (completed) {
        return 'day-complete';
    }

    // Not completed: choose color based on time relative to today
    if (dayMidnight.getTime() === todayMidnight.getTime()) {
        // Today and not completed yet
        return 'day-today';
    }

    if (dayMidnight < todayMidnight) {
        // Past and not completed
        return 'day-past-incomplete';
    }

    // Future and not completed
    return 'day-future';
}

// Load data from API
async function loadData() {
    if (DATA !== null) {
        return Promise.resolve(DATA);
    }
    
    try {
        const response = await fetch('api/get_data.php', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        const apiData = await response.json();
        
        // Store data in global variable
        DATA = {
            config: apiData.config,
            sections: apiData.sections,
            rotationPattern: apiData.rotationPattern
        };
        
        // Store current week
        if (apiData.currentWeek) {
            CURRENT_WEEK = apiData.currentWeek;
        }
        
        return DATA;
    } catch (e) {
        console.error('Failed to load data from API', e);
        // Fallback: return empty data structure
        return {
            config: { startDate: "2025-12-12", people: ["مريم", "يحيى", "أحمد"], daysPerWeek: 7, readingDays: 6, compensationDay: 7 },
            sections: [],
            rotationPattern: [[0, 1, 2], [1, 2, 0], [2, 0, 1]]
        };
    }
}

// Configuration from loaded data
function getConfig() {
    const config = DATA.config;
    return {
        startDate: new Date(config.startDate),
        people: config.people,
        daysPerWeek: config.daysPerWeek,
        readingDays: config.readingDays,
        compensationDay: config.compensationDay
    };
}

// Get section data by ID
function getSection(sectionId) {
    return DATA.sections.find(s => s.id === sectionId);
}

// Get part data for a section and day
function getPart(sectionId, day) {
    const section = getSection(sectionId);
    if (!section) return null;
    return section.parts.find(p => p.day === day);
}

// Format date in Arabic
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ar-EG', options);
}

// Get day name in Arabic
function getDayName(date) {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
}

// Get CSS class name for person
function getPersonClassName(person) {
    const classMap = {
        'مريم': 'maryam',
        'يحيى': 'yahya',
        'أحمد': 'ahmed'
    };
    return classMap[person] || 'person';
}

// Calculate dates for a specific week
function getWeekDates(weekNumber) {
    const config = getConfig();
    if (!config) return [];
    
    const startDate = config.startDate;
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (weekNumber - 1) * 7);
    
    const dates = [];
    for (let i = 0; i < config.daysPerWeek; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        dates.push(date);
    }
    
    return dates;
}

// Get current week number (from API or calculated)
function getCurrentWeekNumber() {
    if (CURRENT_WEEK > 0) {
        return CURRENT_WEEK;
    }
    
    // Fallback calculation if API data not loaded yet
    const config = getConfig();
    if (!config) return 1;
    
    const today = new Date();
    const startDate = config.startDate;
    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffDays / 7) + 1;
    
    if (weekNumber < 1) return 1;
    return weekNumber;
}

// Generate schedule data for current week only
function generateSchedule() {
    const config = getConfig();
    if (!config || !DATA) return [];
    
    const schedule = [];
    const currentWeek = getCurrentWeekNumber();
    
    // Only generate current week
    const week = currentWeek;
    const weekData = {
        weekNumber: week,
        dates: getWeekDates(week),
        days: []
    };
    
    // Rotation pattern repeats every 3 weeks
    const rotationIndex = (week - 1) % 3;
    const rotation = DATA.rotationPattern[rotationIndex];
    
    for (let day = 1; day <= config.daysPerWeek; day++) {
        const dayData = {
            dayNumber: day,
            date: weekData.dates[day - 1],
            assignments: []
        };
        
        // Assign each person their section for this week
        config.people.forEach((person, personIndex) => {
            const sectionIndex = rotation[personIndex];
            const section = DATA.sections[sectionIndex];
            const part = getPart(section.id, day);
            
            dayData.assignments.push({
                person: person,
                personIndex: personIndex,
                section: section,
                part: part
            });
        });
        
        weekData.days.push(dayData);
    }
    
    schedule.push(weekData);
    
    return schedule;
}

// Format part display (simple version)
function formatPartDisplay(part) {
    if (!part || part.day === 7) {
        return 'يوم الاستدراك';
    }
    return `ص ${part.page} من آية ${part.verseStart} إلى ${part.verseEnd}`;
}

// Show part details in modal
function showPartDetails(person, section, part) {
    const modal = document.getElementById('part-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = `${person} - ${section.name}`;
    
    let html = '';
    if (part && part.day === 7) {
        html = '<div class="modal-detail-item"><span class="modal-detail-label">اليوم:</span> <span class="modal-detail-value">يوم الاستدراك</span></div>';
    } else if (part) {
        html = `
            <div class="modal-detail-item">
                <span class="modal-detail-label">اليوم:</span> 
                <span class="modal-detail-value">يوم ${part.day}</span>
            </div>
            <div class="modal-detail-item">
                <span class="modal-detail-label">الصفحة:</span> 
                <span class="modal-detail-value">ص ${part.page}</span>
            </div>
            <div class="modal-detail-item">
                <span class="modal-detail-label">الآيات:</span> 
                <span class="modal-detail-value">من آية ${part.verseStart} إلى آية ${part.verseEnd}</span>
            </div>
            <div class="modal-detail-item">
                <span class="modal-detail-label">أول آية:</span> 
                <span class="modal-detail-value">${part.firstVerse}</span>
            </div>
        `;
    }
    
    modalBody.innerHTML = html;
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('part-modal');
    modal.style.display = 'none';
}

// Create table for a week
function createWeekTable(weekData) {
    const config = getConfig();
    if (!config) return null;
    
    const weekSection = document.createElement('div');
    weekSection.className = 'week-section';
    
    const weekTitle = document.createElement('h2');
    weekTitle.className = 'week-title';
    const startDate = formatDate(weekData.dates[0]);
    const endDate = formatDate(weekData.dates[6]);
    weekTitle.textContent = `الأسبوع ${weekData.weekNumber} (${startDate} - ${endDate})`;
    weekSection.appendChild(weekTitle);
    
    const table = document.createElement('table');
    table.className = 'schedule-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['اليوم', 'التاريخ', ...config.people].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    weekData.days.forEach(dayData => {
        const row = document.createElement('tr');
        
        // Day number
        const dayCell = document.createElement('td');
        dayCell.className = 'day-number';
        const dayName = getDayName(dayData.date);
        dayCell.textContent = `${dayName} - يوم ${dayData.dayNumber}`;
        dayCell.setAttribute('data-label', 'اليوم');
        row.appendChild(dayCell);
        
        // Date
        const dateCell = document.createElement('td');
        dateCell.className = 'date-cell';
        dateCell.innerHTML = formatDate(dayData.date);
        dateCell.setAttribute('data-label', 'التاريخ');
        row.appendChild(dateCell);
        
        // Person columns
        config.people.forEach(personName => {
            const assignment = dayData.assignments.find(a => a.person === personName);
            const personCell = document.createElement('td');
            personCell.setAttribute('data-label', personName);

            // Apply status color class based on date and completion
            const statusClass = getDayCssClass(personName, dayData.date, weekData.weekNumber, dayData.dayNumber);
            if (statusClass) {
                personCell.classList.add(statusClass);
            }
            
            if (assignment) {
                const personSpan = document.createElement('span');
                personSpan.className = `person-name person-${getPersonClassName(assignment.person)}`;
                personSpan.textContent = assignment.person;
                
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'section-cell';
                sectionDiv.textContent = assignment.section.name;
                
                const partDiv = document.createElement('div');
                partDiv.className = 'part-cell';
                
                if (assignment.part && assignment.part.day !== 7) {
                    const partLink = document.createElement('span');
                    partLink.className = 'part-link';
                    partLink.textContent = formatPartDisplay(assignment.part);
                    partLink.onclick = () => showPartDetails(
                        assignment.person,
                        assignment.section,
                        assignment.part
                    );
                    partDiv.appendChild(partLink);
                } else {
                    partDiv.textContent = 'يوم الاستدراك';
                }
                
                personCell.appendChild(personSpan);
                personCell.appendChild(sectionDiv);
                personCell.appendChild(partDiv);
            }
            
            row.appendChild(personCell);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    weekSection.appendChild(table);
    
    return weekSection;
}

// Update current week info
function updateCurrentWeekInfo() {
    const config = getConfig();
    const currentWeek = getCurrentWeekNumber();
    const weekDates = getWeekDates(currentWeek);
    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[6]);
    
    const infoElement = document.getElementById('current-week-info');
    infoElement.textContent = `الأسبوع الحالي: الأسبوع ${currentWeek} (${startDate} - ${endDate})`;
}

// Update overall progress bar for current week (all people together)
function updateOverallWeekProgress() {
    const container = document.getElementById('overall-week-progress');
    if (!container) return;

    const config = getConfig();
    if (!config) return;

    const currentWeek = getCurrentWeekNumber();
    const totalDaysPerPerson = config.readingDays || 6; // exclude compensation day

    container.innerHTML = '';

    // Text for segmented per-person progress
    const textPerPerson = document.createElement('div');
    textPerPerson.className = 'week-progress-text';
    textPerPerson.textContent = 'تقدم الأسبوع الحالي لكل واحد منهم:';

    const bar = document.createElement('div');
    bar.className = 'week-progress-bar';

    let totalSlots = 0;
    let totalCompletedSlots = 0;

    config.people.forEach(personName => {
        let completedDays = 0;
        for (let day = 1; day <= totalDaysPerPerson; day++) {
            if (isDayCompleted(personName, currentWeek, day)) {
                completedDays++;
            }
        }
        const percentPerson = totalDaysPerPerson > 0
            ? Math.round((completedDays / totalDaysPerPerson) * 100)
            : 0;

        totalSlots += totalDaysPerPerson;
        totalCompletedSlots += completedDays;

        const segment = document.createElement('div');
        segment.className = 'week-progress-segment';

        const fill = document.createElement('div');
        const personClass = getPersonClassName(personName); // maryam / yahya / ahmed
        fill.className = `week-progress-segment-fill ${personClass}`;
        fill.style.width = `${percentPerson}%`;

        segment.appendChild(fill);
        bar.appendChild(segment);
    });

    container.appendChild(textPerPerson);
    container.appendChild(bar);

    // Overall percentage for the whole week (all three together)
    const overallPercent = totalSlots > 0
        ? Math.round((totalCompletedSlots / totalSlots) * 100)
        : 0;

    const textOverall = document.createElement('div');
    textOverall.className = 'week-progress-text';
    textOverall.textContent = `تم قراءة نسبة ${overallPercent}٪ من سورة البقرة هذا الأسبوع.`;

    container.appendChild(textOverall);
}

// Initialize the page
async function init() {
    const container = document.getElementById('schedule-container');
    
    // Only run if we're on the main page (not person page)
    if (!container) {
        return;
    }

    // Load data from API first
    await loadData();
    
    // Try to load remote progress (if PHP backend is available)
    await loadRemoteProgress();
    
    const schedule = generateSchedule();
    
    schedule.forEach(weekData => {
        const weekTable = createWeekTable(weekData);
        if (weekTable) {
            container.appendChild(weekTable);
        }
    });
    
    updateCurrentWeekInfo();
    updateOverallWeekProgress();
    
    // Setup modal close handlers
    const modal = document.getElementById('part-modal');
    const closeBtn = document.querySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }
    
    if (modal) {
        window.onclick = function(event) {
            if (event.target === modal) {
                closeModal();
            }
        };
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', () => {
    init();
});
