const urlParams = new URLSearchParams(window.location.search);
const gardenName = urlParams.get("garden") || "default";

const TASKS_KEY = `taskGardenTasks__${gardenName}`;
const POINTS_KEY = `taskGardenPoints__${gardenName}`;

let garden = document.getElementById("garden");
let points = 0;
let selectedTask = null;
let taskMenu = document.getElementById("task-menu");
let clickX = 0;
let clickY = 0;

// Set garden title to emoji + name
const gardenTitle = document.querySelector(".title");
if (gardenTitle) {
  gardenTitle.textContent = `🌿 ${gardenName} 🌿`;
}

function updatePointsDisplay() {
  document.getElementById("points").innerText = "Points: " + points;
}

garden.addEventListener("click", function (e) {
  if (e.target.classList.contains("task")) return;
  hideMenu();

  const rect = garden.getBoundingClientRect();
  clickX = e.clientX - rect.left;
  clickY = e.clientY - rect.top;

  document.getElementById("task-form").classList.remove("hidden");
});

function confirmTask() {
  const name = document.getElementById("task-name").value.trim();
  const select = document.getElementById("task-color");
  const color = select.value;
  const cost = parseInt(select.options[select.selectedIndex].dataset.cost);

  if (!name) return alert("Please enter a task name.");
  if (points < cost) return alert("Not enough points.");

  const rect = garden.getBoundingClientRect();
  const relX = clickX / rect.width;
  const relY = clickY / rect.height;

  const taskData = {
    name,
    color,
    relX,
    relY,
    points: cost > 0 ? cost + 5 : 10,
    grown: false,
  };

  points -= cost;
  updatePointsDisplay();
  createTaskElement(taskData, rect);
  saveTasks();
  cancelTaskForm();
}

function cancelTaskForm() {
  document.getElementById("task-form").classList.add("hidden");
  document.getElementById("task-name").value = "";
  document.getElementById("task-color").value = "white";
}

function createTaskElement(data, rect) {
  const task = document.createElement("div");
  task.className = "task";
  if (data.color.toLowerCase() === "white") {
    task.classList.add("white");
  }

  task.innerText = data.name + (data.grown ? " (✓)" : "");
  if (data.grown) task.classList.add("grown");

  const x = rect.width * data.relX;
  const y = rect.height * data.relY;

  task.style.backgroundColor = data.color;
  task.style.left = `${x}px`;
  task.style.top = `${y}px`;

  task.dataset.relativeX = data.relX;
  task.dataset.relativeY = data.relY;
  task.dataset.pointsOnComplete = data.points;
  task.dataset.name = data.name;
  task.dataset.color = data.color;
  task.dataset.grown = data.grown;

  task.addEventListener("mousedown", dragStart);
  task.addEventListener("touchstart", dragStart);

  task.addEventListener("click", (e) => {
    e.stopPropagation();
    showMenu(task);
  });

  garden.appendChild(task);
}

function showMenu(task) {
  selectedTask = task;
  const rect = task.getBoundingClientRect();
  taskMenu.style.left = `${rect.left + window.scrollX}px`;
  taskMenu.style.top = `${rect.top + window.scrollY}px`;
  taskMenu.classList.remove("hidden");
}

function hideMenu() {
  selectedTask = null;
  taskMenu.classList.add("hidden");
}

function editTask() {
  if (!selectedTask) return;
  const newName = prompt(
    "Edit Task Name:",
    selectedTask.innerText.replace(" (✓)", "")
  );
  if (newName) {
    selectedTask.innerText = selectedTask.classList.contains("grown")
      ? newName + " (✓)"
      : newName;
  }
  saveTasks();
  hideMenu();
}

function completeTask() {
  if (!selectedTask || selectedTask.classList.contains("grown")) return;
  selectedTask.classList.add("grown");
  selectedTask.innerText = selectedTask.dataset.name + " (✓)";
  const gain = parseInt(selectedTask.dataset.pointsOnComplete || "10");
  points += gain;
  updatePointsDisplay();
  saveTasks();
  hideMenu();
}

function removeTask() {
  if (!selectedTask) return;
  selectedTask.remove();
  saveTasks();
  hideMenu();
}

function saveTasks() {
  const tasks = document.querySelectorAll(".task");
  const rect = garden.getBoundingClientRect();
  const taskData = Array.from(tasks).map((task) => ({
    name: task.dataset.name,
    color: task.dataset.color,
    relX: parseFloat(task.dataset.relativeX),
    relY: parseFloat(task.dataset.relativeY),
    points: parseInt(task.dataset.pointsOnComplete),
    grown: task.classList.contains("grown"),
  }));

  localStorage.setItem(TASKS_KEY, JSON.stringify(taskData));
  localStorage.setItem(POINTS_KEY, points.toString());
}

function loadTasks() {
  const rect = garden.getBoundingClientRect();
  const stored = localStorage.getItem(TASKS_KEY);
  const storedPoints = localStorage.getItem(POINTS_KEY);

  if (stored) {
    const taskList = JSON.parse(stored);
    taskList.forEach((data) => createTaskElement(data, rect));
  }

  if (storedPoints) {
    points = parseInt(storedPoints);
    updatePointsDisplay();
  }
}

document.addEventListener("click", hideMenu);

window.addEventListener("resize", () => {
  const rect = garden.getBoundingClientRect();
  const tasks = document.querySelectorAll(".task");
  tasks.forEach((task) => {
    const relX = parseFloat(task.dataset.relativeX);
    const relY = parseFloat(task.dataset.relativeY);
    task.style.left = `${rect.width * relX}px`;
    task.style.top = `${rect.height * relY}px`;
  });
});

// Load saved tasks and points
loadTasks();
updatePointsDisplay();

// 🔄 Dragging support for both desktop and mobile
let draggedTask = null;
let offsetX = 0;
let offsetY = 0;

function dragStart(e) {
  draggedTask = e.target;

  const rect = draggedTask.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  offsetX = clientX - rect.left;
  offsetY = clientY - rect.top;

  document.addEventListener("mousemove", dragMove);
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("touchmove", dragMove, { passive: false });
  document.addEventListener("touchend", dragEnd);
}

function dragMove(e) {
  if (!draggedTask) return;
  e.preventDefault();

  const gardenRect = garden.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  let x = clientX - gardenRect.left - offsetX;
  let y = clientY - gardenRect.top - offsetY;

  x = Math.max(0, Math.min(x, gardenRect.width - draggedTask.offsetWidth));
  y = Math.max(0, Math.min(y, gardenRect.height - draggedTask.offsetHeight));

  draggedTask.style.left = `${x}px`;
  draggedTask.style.top = `${y}px`;

  draggedTask.dataset.relativeX = x / gardenRect.width;
  draggedTask.dataset.relativeY = y / gardenRect.height;
}

function dragEnd() {
  if (draggedTask) {
    saveTasks();
  }
  draggedTask = null;
  document.removeEventListener("mousemove", dragMove);
  document.removeEventListener("mouseup", dragEnd);
  document.removeEventListener("touchmove", dragMove);
  document.removeEventListener("touchend", dragEnd);
}
