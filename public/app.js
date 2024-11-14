
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { getMessaging, onMessage } from 'firebase/messaging';

// Load environment variables from .env file
dotenv.config();

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const messaging = getMessaging(firebaseApp);

// DOM Elements
const taskList = document.getElementById('taskList');
const addTaskButton = document.getElementById('addTaskButton');
const taskInput = document.getElementById('taskInput');
const timeInput = document.getElementById('timeInput');

// Function to render tasks from Firestore
async function renderTasks() {
  taskList.innerHTML = ''; // Clear task list
  const tasksSnapshot = await getDocs(collection(db, 'tasks'));
  tasksSnapshot.forEach((doc) => {
    const taskData = doc.data();
    const taskItem = document.createElement('li');
    taskItem.textContent = `${taskData.task} - ${taskData.time}`;
    
    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = async () => {
      await deleteDoc(doc(db, 'tasks', doc.id));
      renderTasks(); // Refresh list after deletion
    };
    
    taskItem.appendChild(deleteButton);
    taskList.appendChild(taskItem);
  });
}

// Function to add a new task
async function addTask() {
  const task = taskInput.value;
  const time = timeInput.value;
  if (task && time) {
    await addDoc(collection(db, 'tasks'), { task, time });
    taskInput.value = '';
    timeInput.value = '';
    renderTasks();
  } else {
    alert('Please enter both task and time.');
  }
}

// Event listener for adding a task
addTaskButton.addEventListener('click', addTask);

// Schedule and send notifications
function scheduleNotification(task, time) {
  const taskTime = new Date(`1970-01-01T${time}:00Z`);
  const now = new Date();
  const delay = taskTime - now;

  if (delay > 0) {
    setTimeout(() => {
      new Notification(`Task Reminder`, { body: `It's time for ${task}` });
    }, delay);
  }
}

// Function to send notifications for all tasks at scheduled times
async function sendNotifications() {
  const tasksSnapshot = await getDocs(collection(db, 'tasks'));
  tasksSnapshot.forEach((doc) => {
    const taskData = doc.data();
    scheduleNotification(taskData.task, taskData.time);
  });
}

// Request permission for notifications
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('Notification permission granted.');
    onMessage(messaging, (payload) => {
      console.log('Message received: ', payload);
      new Notification(payload.notification.title, { body: payload.notification.body });
    });
    sendNotifications(); // Start notifications
  } else {
    console.log('Notification permission denied.');
  }
}

// Initialize app
async function init() {
  await renderTasks();
  requestNotificationPermission();
}

// Start app
init();
