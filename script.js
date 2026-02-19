
const taskInput = document.getElementById('taskInput');
const taskDescription = document.getElementById('taskDescription');
const addBtn = document.getElementById('addBtn');
const emptyState = document.getElementById('emptyState');

// Storage manager that tries localStorage first, then sessionStorage, then memory
const StorageManager = {
    storageType: null,
    
    init() {
        // Try localStorage
        if (this.isAvailable('localStorage')) {
            this.storageType = 'localStorage';
        } 
        // Fallback to sessionStorage
        else if (this.isAvailable('sessionStorage')) {
            this.storageType = 'sessionStorage';
        }
        // If neither works, just use in-memory (won't persist)
        else {
            this.storageType = 'memory';
        }
    },
    
    isAvailable(type) {
        try {
            const test = '__test__';
            const storage = type === 'localStorage' ? localStorage : sessionStorage;
            storage.setItem(test, test);
            storage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    getItem(key) {
        if (this.storageType === 'localStorage') return localStorage.getItem(key);
        if (this.storageType === 'sessionStorage') return sessionStorage.getItem(key);
        return null;
    },
    
    setItem(key, value) {
        try {
            if (this.storageType === 'localStorage') localStorage.setItem(key, value);
            else if (this.storageType === 'sessionStorage') sessionStorage.setItem(key, value);
        } catch (e) {
            console.warn('Storage failed:', e);
        }
    }
};

StorageManager.init();

let tasks = JSON.parse(StorageManager.getItem('tasks')) || [];

document.addEventListener('DOMContentLoaded', () => {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    renderTasks();
    updateStats();
});

function addTask() {
    const taskText = taskInput.value.trim();
    const taskDesc = taskDescription.value.trim();

    if (taskText === '') {
        alert('Please enter a task title!');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        description: taskDesc,
        completed: false,
        createdAt: new Date().toLocaleDateString()
    };

    tasks.push(task);
    saveTasks();
    taskInput.value = '';
    taskDescription.value = '';
    taskInput.focus();
    renderTasks();
    updateStats();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    tasks.forEach((task) => {
        const taskCard = createTaskCard(task);
        taskList.appendChild(taskCard);
    });
}

function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.className = `task-card ${task.completed ? 'completed' : ''}`;
    taskCard.dataset.taskId = task.id;

    taskCard.innerHTML = `
        <div class="task-content">
            <div class="task-text">${escapeHtml(task.text)}</div>
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            <div class="task-date">${task.createdAt}</div>
        </div>
        <div class="task-actions">
            <button class="task-btn complete-btn" onclick="toggleComplete(${task.id})">
                ${task.completed ? 'Undo' : 'Complete'}
            </button>
            <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        </div>
    `;

    return taskCard;
}

function toggleComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

function deleteTask(taskId) {
    const confirmDelete = confirm('Delete this task?');
    if (confirmDelete) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    document.getElementById('progressPercent').textContent = percent + '%';
    document.getElementById('progressText').textContent = `${completed} of ${total} tasks completed`;
    document.getElementById('progressBar').style.width = percent + '%';
}

function saveTasks() {
    StorageManager.setItem('tasks', JSON.stringify(tasks));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
