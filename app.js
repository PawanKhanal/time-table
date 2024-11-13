
const tasks = []; // Array to store tasks
const taskList = document.getElementById("taskList");

// Function to add a task
function addTask() {
    const taskName = document.getElementById("task").value;
    const taskTime = document.getElementById("time").value;

    if (taskName && taskTime) {
        tasks.push({ name: taskName, time: taskTime });
        displayTasks();
        document.getElementById("task").value = "";
        document.getElementById("time").value = "";
    }
}

// Function to display tasks
function displayTasks() {
    taskList.innerHTML = ""; // Clear the task list
    tasks.forEach((task, index) => {
        const taskItem = document.createElement("li");
        taskItem.className = "task-item";
        taskItem.innerHTML = `<span>${task.time}</span> - ${task.name}`;
        taskList.appendChild(taskItem);
    });
}

// Function to check for tasks and show notifications
function checkTasks() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // Format HH:MM
    tasks.forEach(task => {
        if (task.time === currentTime) {
            showNotification(task.name);
        }
    });
}

// Function to show a notification
function showNotification(taskName) {
    if (Notification.permission === "granted") {
        new Notification("Task Reminder", { body: `It's time for: ${taskName}` });
    }
}

// Request notification permission on load
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

// Check tasks every minute
setInterval(checkTasks, 60000);
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
    .then(reg => console.log("Service Worker registered:", reg))
    .catch(err => console.log("Service Worker registration failed:", err));
}
