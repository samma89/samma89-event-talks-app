document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule-container');
    const searchInput = document.getElementById('search-input');
    let allTalks = [];
    let scheduleItems = [];

    // --- Data Fetching ---
    fetch('data/talks.json')
        .then(response => response.json())
        .then(data => {
            allTalks = data;
            buildSchedule();
            renderSchedule(scheduleItems);
        })
        .catch(error => {
            console.error('Error fetching talk data:', error);
            scheduleContainer.innerHTML = '<p>Could not load schedule. Please try again later.</p>';
        });

    // --- Search Functionality ---
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (!searchTerm) {
            renderSchedule(scheduleItems);
            return;
        }

        const filteredItems = scheduleItems.filter(item => {
            if (item.type === 'break') return true; // Always show breaks
            return item.talk.categories.some(category => category.toLowerCase().includes(searchTerm));
        });

        renderSchedule(filteredItems);
    });

    // --- Schedule Building ---
    function buildSchedule() {
        scheduleItems = [];
        let currentTime = new Date('2026-01-01T10:00:00'); // Start at 10:00 AM

        allTalks.forEach((talk, index) => {
            const startTime = new Date(currentTime);
            const endTime = new Date(startTime.getTime() + talk.duration * 60000);

            scheduleItems.push({ type: 'talk', talk, startTime, endTime });

            currentTime = new Date(endTime.getTime());

            // Add lunch break after the 3rd talk (index 2)
            if (index === 2) {
                const lunchStartTime = new Date(currentTime);
                const lunchEndTime = new Date(lunchStartTime.getTime() + 60 * 60000);
                scheduleItems.push({ type: 'break', title: 'Lunch Break', startTime: lunchStartTime, endTime: lunchEndTime });
                currentTime = lunchEndTime;
            } else if (index < allTalks.length - 1) { // Add transition time after other talks
                currentTime.setMinutes(currentTime.getMinutes() + 10);
            }
        });
    }

    // --- Schedule Rendering ---
    function renderSchedule(items) {
        scheduleContainer.innerHTML = '';
        if (items.length === 0) {
            scheduleContainer.innerHTML = '<p>No talks match your search.</p>';
            return;
        }
        items.forEach(item => {
            if (item.type === 'talk') {
                scheduleContainer.appendChild(createTalkElement(item.talk, item.startTime, item.endTime));
            } else if (item.type === 'break') {
                scheduleContainer.appendChild(createBreakElement(item.title, item.startTime, item.endTime));
            }
        });
    }

    function createTalkElement(talk, startTime, endTime) {
        const item = document.createElement('div');
        item.className = 'talk-item';
        const timeString = `${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

        item.innerHTML = `
            <div class="talk-time">${timeString}</div>
            <h2 class="talk-title">${talk.title}</h2>
            <div class="talk-speakers">By: ${talk.speakers.join(', ')}</div>
            <p class="talk-description">${talk.description}</p>
            <div class="talk-categories">
                ${talk.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
            </div>
        `;
        return item;
    }

    function createBreakElement(title, startTime, endTime) {
        const item = document.createElement('div');
        item.className = 'talk-item break';
        const timeString = `${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        item.innerHTML = `
            <div class="talk-time">${timeString}</div>
            <h2 class="talk-title">${title}</h2>
        `;
        return item;
    }
});
