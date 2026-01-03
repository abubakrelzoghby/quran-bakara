// Person page specific functionality

let selectedPerson = null;
let DISPLAYED_WEEK_PERSON = null; // Currently displayed week on person page

// Load saved person preference
function loadSavedPerson() {
    const saved = localStorage.getItem('selectedPerson');
    if (saved && ['مريم', 'يحيى', 'أحمد'].includes(saved)) {
        return saved;
    }
    return null;
}

// Save person preference
function savePerson(person) {
    localStorage.setItem('selectedPerson', person);
}

// Get person class name for button
function getPersonButtonClass(person) {
    const classMap = {
        'مريم': 'person-maryam-btn',
        'يحيى': 'person-yahya-btn',
        'أحمد': 'person-ahmed-btn'
    };
    return classMap[person] || '';
}

// Update person buttons active state
function updatePersonButtons(selectedPersonName) {
    document.querySelectorAll('.person-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.person === selectedPersonName) {
            btn.classList.add('active');
        }
    });
}

// Update header title with selected person name
function updatePersonHeaderTitle(personName) {
    const headerTitle = document.getElementById('person-header-title');
    if (headerTitle && personName) {
        headerTitle.textContent = `جدولي الشخصي - ${personName}`;
    }
}

// Get displayed week for person page (always default to current week on page load/refresh)
function getDisplayedWeekPerson() {
    if (DISPLAYED_WEEK_PERSON !== null) {
        return DISPLAYED_WEEK_PERSON;
    }
    
    // Always default to current week on page load/refresh
    // Don't use localStorage - always show current week when page loads
    const currentWeek = getCurrentWeekNumber();
    DISPLAYED_WEEK_PERSON = currentWeek;
    return currentWeek;
}

// Save displayed week for person page (in memory only, not localStorage)
// This way, refresh always shows current week
function saveDisplayedWeekPerson(weekNumber) {
    DISPLAYED_WEEK_PERSON = weekNumber;
    // Don't save to localStorage - we want to always show current week on refresh
}

// Create single person schedule for a specific week
function createPersonSchedule(personName, weekNumberOverride = null) {
    const config = getConfig();
    if (!config || !DATA) return null;
    
    // Use provided week number or displayed week
    const weekNumber = weekNumberOverride || getDisplayedWeekPerson();
    const weekDates = getWeekDates(weekNumber);
    
    // Rotation pattern repeats every 3 weeks
    const rotationIndex = (weekNumber - 1) % 3;
    const rotation = DATA.rotationPattern[rotationIndex];
    
    // Find person index
    const personIndex = config.people.indexOf(personName);
    if (personIndex === -1) return null;
    
    // Get section for this person in current week
    const sectionIndex = rotation[personIndex];
    const section = DATA.sections[sectionIndex];
    
    const container = document.getElementById('person-schedule-container');
    container.innerHTML = '';
    
    // Create week title
    const weekTitle = document.createElement('h2');
    weekTitle.className = 'week-title';
    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[6]);
    const currentWeek = getCurrentWeekNumber();
    if (weekNumber === currentWeek) {
        weekTitle.textContent = `الأسبوع الحالي: الأسبوع ${weekNumber} - ${personName} (${startDate} - ${endDate})`;
    } else {
        weekTitle.textContent = `الأسبوع ${weekNumber} - ${personName} (${startDate} - ${endDate})`;
    }
    container.appendChild(weekTitle);
    
    // Create table
    const table = document.createElement('table');
    table.className = 'schedule-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['اليوم', 'التاريخ', 'القسم', 'الجزء'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.setAttribute('data-label', header);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    for (let day = 1; day <= config.daysPerWeek; day++) {
        const dayData = weekDates[day - 1];
        const part = getPart(section.id, day);
        
        const row = document.createElement('tr');
        
        // Day number
        const dayCell = document.createElement('td');
        dayCell.className = 'day-number';
        const dayName = getDayName(dayData);
        dayCell.textContent = `${dayName} - يوم ${day}`;
        dayCell.setAttribute('data-label', 'اليوم');
        row.appendChild(dayCell);
        
        // Date
        const dateCell = document.createElement('td');
        dateCell.className = 'date-cell';
        dateCell.innerHTML = formatDate(dayData);
        dateCell.setAttribute('data-label', 'التاريخ');
        row.appendChild(dateCell);
        
        // Section
        const sectionCell = document.createElement('td');
        sectionCell.className = 'section-cell';
        const sectionSpan = document.createElement('span');
        sectionSpan.className = `person-name person-${getPersonClassName(personName)}`;
        sectionSpan.textContent = section.name;
        sectionCell.appendChild(sectionSpan);
        sectionCell.setAttribute('data-label', 'القسم');
        row.appendChild(sectionCell);
        
        // Part + status / completion button container
        const partCell = document.createElement('td');
        partCell.className = 'part-cell';
        partCell.setAttribute('data-label', 'الجزء');

        // Apply status color based on date and completion
        const statusClass = getDayCssClass(personName, dayData, weekNumber, day);
        if (statusClass) {
            partCell.classList.add(statusClass);
        }

        if (part && part.day !== 7) {
            const partLink = document.createElement('span');
            partLink.className = 'part-link';
            partLink.textContent = formatPartDisplay(part);
            partLink.onclick = () => showPartDetails(personName, section, part);
            partCell.appendChild(partLink);
        } else {
            partCell.textContent = 'يوم الاستدراك';
        }

        // Day 7 (compensation day) should not have completion button
        if (day !== 7) {
            const isCompleted = isDayCompleted(personName, weekNumber, day);

            // Container row for badge + button on the same line
            const statusRow = document.createElement('div');
            statusRow.className = 'part-status-row';

            // Clear success badge inside the row when completed
            if (isCompleted) {
                const badge = document.createElement('span');
                badge.className = 'day-complete-badge';
                badge.textContent = 'مكتمل';
                statusRow.appendChild(badge);
            }

            // Completion toggle button (only for current week of this person)
            const completeBtn = document.createElement('button');
            completeBtn.type = 'button';
            completeBtn.className = isCompleted ? 'complete-btn complete-btn-done' : 'complete-btn';
            // \"تم\" لحفظ اليوم، و\"إلغاء\" لإرجاعه بدون لون أخضر في الزر نفسه
            completeBtn.textContent = isCompleted ? 'إلغاء' : 'تم';
            completeBtn.dataset.week = String(weekNumber);
            completeBtn.dataset.day = String(day);
            completeBtn.dataset.person = personName;
            statusRow.appendChild(completeBtn);

            partCell.appendChild(statusRow);
        }

        row.appendChild(partCell);
        
        tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    container.appendChild(table);

    // Update progress bar for this person/week
    updatePersonProgress(personName, weekNumber);
}

// Update current week info
function updateCurrentWeekInfoPerson() {
    const config = getConfig();
    if (!config) return;
    
    const displayedWeek = getDisplayedWeekPerson();
    const weekDates = getWeekDates(displayedWeek);
    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[6]);
    
    const infoElement = document.getElementById('current-week-info');
    const currentWeek = getCurrentWeekNumber();
    if (displayedWeek === currentWeek) {
        infoElement.textContent = `الأسبوع الحالي: الأسبوع ${displayedWeek} (${startDate} - ${endDate})`;
    } else {
        infoElement.textContent = `الأسبوع ${displayedWeek} (${startDate} - ${endDate})`;
    }
}

// Render week navigation buttons for person page
function renderWeekNavigationPerson() {
    const container = document.getElementById('week-navigation-container-person');
    if (!container) return;
    
    const currentWeek = getCurrentWeekNumber();
    const displayedWeek = getDisplayedWeekPerson();
    
    container.innerHTML = '';
    
    // Always create both buttons, but hide them if not needed
    // This ensures space-between works correctly
    
    // Previous week button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'week-nav-btn week-nav-prev';
    if (displayedWeek > 1) {
        prevBtn.textContent = 'الأسبوع السابق ←';
        prevBtn.onclick = () => navigateToWeekPerson(displayedWeek - 1);
    } else {
        prevBtn.className += ' hidden';
        prevBtn.textContent = ''; // Empty text for hidden button
    }
    container.appendChild(prevBtn);
    
    // Next week button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'week-nav-btn week-nav-next';
    if (displayedWeek < currentWeek) {
        nextBtn.textContent = '→ الأسبوع اللاحق';
        nextBtn.onclick = () => navigateToWeekPerson(displayedWeek + 1);
    } else {
        nextBtn.className += ' hidden';
        nextBtn.textContent = ''; // Empty text for hidden button
    }
    container.appendChild(nextBtn);
}

// Navigate to a specific week on person page
function navigateToWeekPerson(weekNumber) {
    const currentWeek = getCurrentWeekNumber();
    
    // Validate: can't go before week 1
    if (weekNumber < 1) {
        weekNumber = 1;
    }
    
    // Validate: can't go to future weeks (only current week and past)
    if (weekNumber > currentWeek) {
        weekNumber = currentWeek;
    }
    
    // Save displayed week
    saveDisplayedWeekPerson(weekNumber);
    
    // Re-render schedule
    createPersonSchedule(selectedPerson, weekNumber);
    
    // Update navigation buttons
    renderWeekNavigationPerson();
    
    // Update week info
    updateCurrentWeekInfoPerson();
    
    // Update progress
    updatePersonProgress(selectedPerson, weekNumber);
}

// Initialize person page
async function initPersonPage() {
    // Load data from API first
    if (typeof loadData === 'function') {
        await loadData();
    }
    
    // Load saved person or default to first person
    const savedPerson = loadSavedPerson();
    selectedPerson = savedPerson || getConfig().people[0];

    // Try to load remote progress so person page sees shared state
    if (typeof loadRemoteProgress === 'function') {
        await loadRemoteProgress();
    }
    
    // Setup person buttons
    document.querySelectorAll('.person-btn').forEach(btn => {
        btn.onclick = () => {
            selectedPerson = btn.dataset.person;
            savePerson(selectedPerson);
            updatePersonButtons(selectedPerson);
            updatePersonHeaderTitle(selectedPerson);
            createPersonSchedule(selectedPerson);
        };
    });
    
    // Set initial active button
    updatePersonButtons(selectedPerson);
    updatePersonHeaderTitle(selectedPerson);
    
    // Render navigation buttons
    renderWeekNavigationPerson();
    
    // Create schedule for selected person
    createPersonSchedule(selectedPerson);
    
    // Update week info
    updateCurrentWeekInfoPerson();
    
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

    // Attach handlers for completion buttons
    document.addEventListener('click', async function (event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (!target.classList.contains('complete-btn')) return;

        const personName = target.dataset.person;
        const weekStr = target.dataset.week;
        const dayStr = target.dataset.day;
        if (!personName || !weekStr || !dayStr) return;

        const weekNumber = parseInt(weekStr, 10);
        const dayNumber = parseInt(dayStr, 10);
        
        // Prevent completion toggle for day 7 (compensation day)
        if (dayNumber === 7) {
            return;
        }
        
        if (!ensurePersonVerified(personName)) {
            return;
        }

        const currentlyCompleted = isDayCompleted(personName, weekNumber, dayNumber);
        const newValue = !currentlyCompleted;
        setDayCompleted(personName, weekNumber, dayNumber, newValue);

        // Save to server so progress is shared across devices/browsers
        if (typeof saveDayCompletedRemote === 'function') {
            await saveDayCompletedRemote(personName, weekNumber, dayNumber, newValue);
        }

        // Rebuild schedule for updated styles
        const displayedWeek = getDisplayedWeekPerson();
        createPersonSchedule(selectedPerson, displayedWeek);
    });
}

// Update visual progress bar for a specific week/person
function updatePersonProgress(personName, weekNumber) {
    const progressContainer = document.getElementById('person-progress');
    if (!progressContainer) return;

    const config = getConfig();
    if (!config) return;

    const totalDays = config.readingDays || 6; // only real reading days (exclude compensation)
    let completedDays = 0;

    for (let day = 1; day <= totalDays; day++) {
        if (isDayCompleted(personName, weekNumber, day)) {
            completedDays++;
        }
    }

    const percent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    progressContainer.innerHTML = '';

    const text = document.createElement('div');
    text.className = 'person-progress-text';
    const currentWeek = getCurrentWeekNumber();
    if (weekNumber === currentWeek) {
        text.textContent = `تقدم هذا الأسبوع: ${completedDays} من ${totalDays} (${percent}٪)`;
    } else {
        text.textContent = `تقدم الأسبوع ${weekNumber}: ${completedDays} من ${totalDays} (${percent}٪)`;
    }

    const bar = document.createElement('div');
    bar.className = 'progress-bar';

    const fill = document.createElement('div');
    fill.className = 'progress-bar-fill';
    fill.style.width = `${percent}%`;

    bar.appendChild(fill);
    progressContainer.appendChild(text);
    progressContainer.appendChild(bar);
}

// Ensure person is verified on this device using simple numeric password
function ensurePersonVerified(personName) {
    if (isPersonVerified(personName)) {
        return true;
    }

    const expectedPassword = PERSON_PASSWORDS[personName];
    if (!expectedPassword) {
        // If no password defined, allow by default
        return true;
    }

    const entered = window.prompt(`من فضلك أدخل كلمة السر لــ ${personName}:`);
    if (entered === null) {
        // User cancelled
        return false;
    }

    if (entered.trim() === expectedPassword) {
        setPersonVerified(personName);
        alert('تم التحقق من كلمة السر بنجاح على هذا الجهاز.');
        return true;
    } else {
        alert('كلمة السر غير صحيحة. من فضلك حاول مرة أخرى.');
        return false;
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', () => {
    initPersonPage();
});

