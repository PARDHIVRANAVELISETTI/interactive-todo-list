
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

const totalCount = document.getElementById("total-count");
const activeCount = document.getElementById("active-count");
const completedCount = document.getElementById("completed-count");

const clearCompletedBtn = document.getElementById("clear-completed");
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");

const STORAGE_KEY = "taskflow-tasks";

let tasks = loadTasks();

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        return parsedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    } catch (error) {
        console.error("Unable to load tasks:", error);
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        alert("Unable to save tasks in this browser.");
        console.error("Unable to save tasks:", error);
    }
}

function renderTasks() {
    taskList.replaceChildren();

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.text} as completed`
        );

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", `Delete ${task.text}`);

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        li.append(checkbox, taskText, deleteButton);
        taskList.appendChild(li);
    });

    updateStats();
}

function addTask(text) {
    const cleanedText = text.trim();

    if (!cleanedText) {
        return;
    }

    tasks.unshift({
        id: crypto.randomUUID(),
        text: cleanedText,
        completed: false
    });

    saveTasks();
    renderTasks();
}

function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );

    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;
    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;

    progressText.textContent = `${percentage}% completed`;
    progressBar.style.width = `${percentage}%`;

    emptyMessage.hidden = total !== 0;
    clearCompletedBtn.disabled = completed === 0;
    clearCompletedBtn.style.opacity = completed === 0 ? "0.5" : "1";
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    addTask(taskInput.value);
    taskInput.value = "";
    taskInput.focus();
});

clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();
});

renderTasks();
