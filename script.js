/**
 * TaskFlow - Vanilla JavaScript To-Do List Application
 */

// Application State
let tasks = [];
let currentFilter = 'all'; // 'all' | 'active' | 'completed'
let editingTaskId = null;

// DOM Elements
const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const taskCounter = document.getElementById('task-counter');
const totalCounter = document.getElementById('total-counter');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

/**
 * Initialize application
 */
function init() {
  loadTasks();
  setupEventListeners();
  renderTasks();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Add task on form submit (Click or Enter)
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask();
  });

  // Filter task buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      filterTasks(filter);
    });
  });

  // Clear completed button
  clearCompletedBtn.addEventListener('click', clearCompleted);
}

/**
 * Add a new task to the list
 */
function addTask() {
  const taskText = taskInput.value.trim();

  // Prevent empty tasks
  if (!taskText) {
    taskInput.focus();
    return;
  }

  // Create new task object
  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();

  // Clear and focus input
  taskInput.value = '';
  taskInput.focus();
}

/**
 * Toggle completed state of a task
 * @param {number} id - Task ID
 */
function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  renderTasks();
}

/**
 * Delete a task by ID
 * @param {number} id - Task ID
 */
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  if (editingTaskId === id) {
    editingTaskId = null;
  }
  saveTasks();
  renderTasks();
}

/**
 * Switch a task to edit mode
 * @param {number} id - Task ID
 */
function editTask(id) {
  editingTaskId = id;
  renderTasks();

  // Focus the edit input
  const editInputElement = document.getElementById(`edit-input-${id}`);
  if (editInputElement) {
    editInputElement.focus();
    // Move cursor to the end
    const length = editInputElement.value.length;
    editInputElement.setSelectionRange(length, length);
  }
}

/**
 * Save edited task text
 * @param {number} id - Task ID
 * @param {string} newText - Updated task title
 */
function saveTaskEdit(id, newText) {
  const trimmed = newText.trim();
  if (trimmed) {
    tasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, text: trimmed };
      }
      return task;
    });
    saveTasks();
  }
  editingTaskId = null;
  renderTasks();
}

/**
 * Cancel edit mode
 */
function cancelTaskEdit() {
  editingTaskId = null;
  renderTasks();
}

/**
 * Filter tasks view
 * @param {string} filter - 'all' | 'active' | 'completed'
 */
function filterTasks(filter) {
  currentFilter = filter;

  // Update active UI tab
  filterBtns.forEach((btn) => {
    const isActive = btn.getAttribute('data-filter') === filter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  renderTasks();
}

/**
 * Remove all completed tasks
 */
function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

/**
 * Save tasks array to LocalStorage
 */
function saveTasks() {
  try {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to LocalStorage:', error);
  }
}

/**
 * Load tasks array from LocalStorage
 */
function loadTasks() {
  try {
    const saved = localStorage.getItem('taskflow_tasks');
    if (saved) {
      tasks = JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load tasks from LocalStorage:', error);
    tasks = [];
  }
}

/**
 * Helper to escape HTML characters to prevent XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Render tasks based on current filter & update counters
 */
function renderTasks() {
  taskList.innerHTML = '';

  // Filter tasks based on currentFilter
  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true; // 'all'
  });

  // Toggle Empty State view
  if (filteredTasks.length === 0) {
    emptyState.classList.remove('hidden');
    const emptySubtext = emptyState.querySelector('.empty-subtext');
    if (currentFilter === 'active') {
      emptySubtext.textContent = 'No active tasks to display!';
    } else if (currentFilter === 'completed') {
      emptySubtext.textContent = 'No completed tasks yet!';
    } else {
      emptySubtext.textContent = 'Add a new task to get started!';
    }
  } else {
    emptyState.classList.add('hidden');
  }

  // Render task elements
  filteredTasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.setAttribute('data-id', task.id);

    const isEditing = editingTaskId === task.id;

    if (isEditing) {
      // Edit mode markup
      li.innerHTML = `
        <div class="task-content-left">
          <input 
            type="text" 
            id="edit-input-${task.id}" 
            class="edit-input" 
            value="${escapeHtml(task.text)}"
            maxlength="120"
          />
        </div>
        <div class="task-actions">
          <button class="action-btn save-btn" title="Save" onclick="saveTaskEdit(${task.id}, document.getElementById('edit-input-${task.id}').value)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
          <button class="action-btn cancel-btn" title="Cancel" onclick="cancelTaskEdit()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;

      // Handle Enter and Escape keys for editing
      const editInput = li.querySelector(`#edit-input-${task.id}`);
      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveTaskEdit(task.id, editInput.value);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelTaskEdit();
        }
      });
    } else {
      // Normal display markup
      li.innerHTML = `
        <div class="task-content-left">
          <label class="custom-checkbox">
            <input 
              type="checkbox" 
              ${task.completed ? 'checked' : ''} 
              onchange="toggleTask(${task.id})"
              aria-label="Mark task as completed"
            />
            <span class="checkmark">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </label>
          <span class="task-title" onclick="toggleTask(${task.id})">${escapeHtml(task.text)}</span>
        </div>
        <div class="task-actions">
          <button class="action-btn edit-btn" title="Edit Task" onclick="editTask(${task.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-btn delete-btn" title="Delete Task" onclick="deleteTask(${task.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      `;
    }

    taskList.appendChild(li);
  });

  // Update Counters & Buttons
  updateStatus();
}

/**
 * Update remaining/total counters and clear button state
 */
function updateStatus() {
  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  taskCounter.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} remaining`;
  totalCounter.textContent = `Total: ${totalCount}`;

  // Enable/disable Clear Completed button
  clearCompletedBtn.disabled = completedCount === 0;
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', init);
