
// selectors

const menuButton = document.getElementById('menu-button');
const sidebar = document.getElementById('sidebar');
const addTaskButton = document.getElementById('add-task-button');
const todoList = document.getElementById('todo-list');
const themeButton = document.getElementById('theme-button');
const themeWindow = document.getElementById('theme-window');
const themeCircles = document.querySelectorAll('.theme-circle[data-theme]');
const timerSelect = document.getElementById('timer-select');
const updateTimerButton = document.getElementById('update-timer-button');
const clickSound = document.getElementById('clickSound');
const alarmSound = document.getElementById('alarmSound');
const stopAlarmButton = document.getElementById('stop-alarm-button');
const originalTitle = document.title;

let timerDisplay = document.querySelector('.timer');
let timerCircle = document.querySelector('.timer-circle');
let timeLeft = localStorage.getItem('timerTime') ? parseInt(localStorage.getItem('timerTime'), 10) : 1500;
let timerInterval;
let isRunning = false;
let inactivityTimer;
const INACTIVITY_TIME = 10000;

const activeAudios = new Map();


// sound

function playSounds() {
    activeAudios.forEach((audio) => {
        if (audio.paused) {
            audio.loop = true;
            audio.play();
        }
    });
}

function stopSounds() {
    activeAudios.forEach((audio) => {
        audio.pause();
    });
}



// windows

function saveSidebarState() {
    const isSidebarOpen = sidebar.style.left === '0px';
    localStorage.setItem('sidebarOpen', isSidebarOpen);
}

function loadSidebarState() {
    const isSidebarOpen = localStorage.getItem('sidebarOpen') === 'true';
    sidebar.classList.add('no-transition');
    sidebar.style.left = isSidebarOpen ? '0px' : '-300px';
    setTimeout(() => sidebar.classList.remove('no-transition'), 10);
}

function saveThemeWindowState() {
    const isThemeWindowOpen = themeWindow.style.right === '0px';
    localStorage.setItem('themeWindowOpen', isThemeWindowOpen);
}

function loadThemeWindowState() {
    const isThemeWindowOpen = localStorage.getItem('themeWindowOpen') === 'true';
    themeWindow.classList.add('no-transition');
    themeWindow.style.right = isThemeWindowOpen ? '0px' : '-300px';
    setTimeout(() => themeWindow.classList.remove('no-transition'), 10);
}

//to-do

function createTaskElement(task, index) {
    const newTask = document.createElement('li');
    newTask.setAttribute('draggable', true);
    newTask.innerHTML = `
        <input type="checkbox" id="task${index}" ${task.checked ? 'checked' : ''}>
        <label for="task${index}">${task.text}</label>
        <button class="delete-task-button">🗑️</button>
    `;

    const checkbox = newTask.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', saveTasks);

    const label = newTask.querySelector('label');
    label.addEventListener('click', () => editTask(label));

    const deleteButton = newTask.querySelector('.delete-task-button');
    deleteButton.addEventListener('click', () => {
        newTask.remove();
        saveTasks();
    });

    return newTask;
}

addTaskButton.addEventListener('click', () => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const newTask = {
        text: "New item",
        checked: false
    };

    const taskElement = createTaskElement(newTask, tasks.length);
    todoList.appendChild(taskElement);
    saveTasks();
});

function editTask(label) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = label.textContent;
    input.classList.add('edit-input');

    label.replaceWith(input);

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveTask(input, label);
    });

    input.addEventListener('blur', () => saveTask(input, label));
}

function saveTask(input, label) {
    label.textContent = input.value.trim() || "New item";
    input.replaceWith(label);
    saveTasks();
}

function saveTasks() {
    const tasks = [];
    todoList.querySelectorAll('li').forEach((task, index) => {
        tasks.push({
            text: task.querySelector('label').textContent,
            checked: task.querySelector('input').checked
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        todoList.appendChild(taskElement);
    });
}

// themes

function saveTheme(theme) {
    localStorage.setItem('theme', theme);
}

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'gray';
    applyTheme(theme);
}

function applyTheme(theme) {
    document.body.className = theme;
    saveTheme(theme);
}

themeCircles.forEach(circle => {
    circle.addEventListener('click', () => {
        applyTheme(circle.dataset.theme);
    });
});

// timer 

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    const timeString = `${minutes}:${seconds}`;

    timerDisplay.textContent = timeString;
    document.title = `${timeString} - FocusTempo `;
}

function resetTitle() {
    document.title = originalTitle;
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        localStorage.setItem('timerTime', timeLeft);
        updateTimerDisplay();
    } else {
        clearInterval(timerInterval);
        resetTitle();
        stopSounds();
        playAlarm();
        timerCircle.classList.add('paused');
        alert("Time is over!");
    }
}

function playAlarm() {
    alarmSound.play();
    stopAlarmButton.style.display = 'block';
}

function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    stopAlarmButton.style.display = 'none';
}

stopAlarmButton.addEventListener('click', stopAlarm);

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timerInterval = setInterval(updateTimer, 1000);
        timerCircle.style.animationPlayState = 'running';
        timerCircle.classList.remove('paused');
        clickSound.play();
        resetInactivityTimer();
        updateTimerDisplay();
        playSounds();
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        timerCircle.style.animationPlayState = 'paused';
        timerCircle.classList.add('paused');
        clickSound.play();
        clearTimeout(inactivityTimer);
        showElements();
        updateTimerDisplay();
        stopSounds();
    }
}

timerCircle.addEventListener('click', () => {
    isRunning ? pauseTimer() : startTimer();
});

updateTimerButton.addEventListener('click', () => {
    const newTime = parseInt(timerSelect.value, 10);
    if (newTime > 0) {
        timeLeft = newTime * 60;
        localStorage.setItem('timerTime', timeLeft);
        updateTimerDisplay();
        pauseTimer();
    } else {
        alert("Insert a valid number");
    }
});


// drag and drop

todoList.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'LI') {
        e.target.classList.add('dragging');
    }
});

todoList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingItem = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(todoList, e.clientY);
    afterElement ? todoList.insertBefore(draggingItem, afterElement) : todoList.appendChild(draggingItem);
});

todoList.addEventListener('dragend', (e) => {
    if (e.target.tagName === 'LI') {
        e.target.classList.remove('dragging');
        saveTasks();
    }
});

function getDragAfterElement(container, y) {
    return [...container.querySelectorAll('li:not(.dragging)')].reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// suspension

function hideElements() {
    document.body.classList.add('hide-elements');
}

function showElements() {
    document.body.classList.remove('hide-elements');
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (isRunning) {
        inactivityTimer = setTimeout(hideElements, INACTIVITY_TIME);
    }
}

document.addEventListener('mousemove', () => {
    showElements();
    resetInactivityTimer();
});

// reset 

function resetSettings() {
    localStorage.removeItem('tasks');
    localStorage.removeItem('theme');
    localStorage.removeItem('timerTime');
    localStorage.removeItem('sidebarOpen');
    localStorage.removeItem('themeWindowOpen');
    window.location.reload();
}

document.querySelector('.reset-button').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all information?')) {
        resetSettings();
    }
});

// initialization 

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadTheme();
    loadSidebarState();
    loadThemeWindowState();

    const savedTime = localStorage.getItem('timerTime');
    if (savedTime) {
        const minutes = Math.round(parseInt(savedTime, 10) / 60);
        timerSelect.value = minutes > 0 ? minutes : 25;
    } else {
        timerSelect.value = 25;
    }

    updateTimerDisplay();
    resetTitle();
});

// ui 

menuButton.addEventListener('click', () => {
    const isMobile = window.innerWidth < 800;
    if (isMobile && themeWindow.style.right === '0px') {
        themeWindow.style.right = '-300px';
        saveThemeWindowState();
    }
    sidebar.style.left = sidebar.style.left === '0px' ? '-300px' : '0px';
    saveSidebarState();
});

themeButton.addEventListener('click', () => {
    const isMobile = window.innerWidth < 900;
    if (isMobile && sidebar.style.left === '0px') {
        sidebar.style.left = '-300px';
        saveSidebarState();
    }
    themeWindow.style.right = themeWindow.style.right === '0px' ? '-300px' : '0px';
    saveThemeWindowState();
});