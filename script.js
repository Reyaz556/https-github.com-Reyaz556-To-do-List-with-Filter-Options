document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const taskTime = document.getElementById('taskTime');
    const taskPriority = document.getElementById('taskPriority');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize the app
    function init() {
        renderTasks();
        setupEventListeners();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });
    }
    
    // Add a new task
    function addTask() {
        const title = taskInput.value.trim();
        const date = taskDate.value;
        const time = taskTime.value;
        const priority = taskPriority.value;
        
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        const task = {
            id: Date.now(),
            title,
            date,
            time,
            priority,
            completed: false
        };
        
        tasks.push(task);
        saveTasks();
        renderTasks();
        
        // Reset input fields
        taskInput.value = '';
        taskDate.value = '';
        taskTime.value = '';
        taskPriority.value = 'low';
        taskInput.focus();
    }
    
    // Render tasks based on current filter
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="no-tasks">No tasks found.</p>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.priority}-priority ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;
            
            const dateTime = [];
            if (task.date) dateTime.push(task.date);
            if (task.time) dateTime.push(task.time);
            
            taskItem.innerHTML = `
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-details">
                        ${dateTime.length ? `<span><i class="far fa-calendar-alt"></i> ${dateTime.join(' ')}</span>` : ''}
                        <span><i class="fas fa-exclamation-circle"></i> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="complete-btn" title="${task.completed ? 'Mark as active' : 'Mark as complete'}">
                        <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                    </button>
                    <button class="edit-btn" title="Edit task"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" title="Delete task"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', toggleTaskComplete);
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editTask);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteTask);
        });
    }
    
    // Toggle task completion status
    function toggleTaskComplete(e) {
        const taskId = parseInt(e.target.closest('.task-item').dataset.id);
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
        }
    }
    
    // Edit a task
    function editTask(e) {
        const taskItem = e.target.closest('.task-item');
        const taskId = parseInt(taskItem.dataset.id);
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            const task = tasks[taskIndex];
            
            // Replace task item with input fields
            taskItem.innerHTML = `
                <div class="edit-form">
                    <input type="text" class="edit-title" value="${task.title}" placeholder="Task title">
                    <input type="date" class="edit-date" value="${task.date}">
                    <input type="time" class="edit-time" value="${task.time}">
                    <select class="edit-priority">
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low Priority</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High Priority</option>
                    </select>
                    <div class="edit-actions">
                        <button class="save-btn"><i class="fas fa-save"></i> Save</button>
                        <button class="cancel-btn"><i class="fas fa-times"></i> Cancel</button>
                    </div>
                </div>
            `;
            
            // Focus on title field
            taskItem.querySelector('.edit-title').focus();
            
            // Add event listeners to save/cancel buttons
            taskItem.querySelector('.save-btn').addEventListener('click', () => saveEditedTask(taskIndex));
            taskItem.querySelector('.cancel-btn').addEventListener('click', renderTasks);
        }
    }
    
    // Save edited task
    function saveEditedTask(taskIndex) {
        const taskItem = document.querySelector(`.task-item[data-id="${tasks[taskIndex].id}"]`);
        const title = taskItem.querySelector('.edit-title').value.trim();
        const date = taskItem.querySelector('.edit-date').value;
        const time = taskItem.querySelector('.edit-time').value;
        const priority = taskItem.querySelector('.edit-priority').value;
        
        if (!title) {
            alert('Task title cannot be empty');
            return;
        }
        
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            title,
            date,
            time,
            priority
        };
        
        saveTasks();
        renderTasks();
    }
    
    // Delete a task
    function deleteTask(e) {
        if (confirm('Are you sure you want to delete this task?')) {
            const taskId = parseInt(e.target.closest('.task-item').dataset.id);
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
        }
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Initialize the application
    init();
});