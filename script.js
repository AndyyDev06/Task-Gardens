let garden = document.getElementById("garden");
let points = 0;
let selectedTask = null;
let taskMenu = document.getElementById("task-menu");

let pendingTask = false;
let pendingTaskName = "";
let pendingColor = "white";
let pendingCost = 0;

function updatePointsDisplay() {
  document.getElementById("points").innerText = "Points: " + points;
}

function createTask() {
  const name = prompt("Enter your task name:");
  if (!name) return;
  pendingTaskName = name;
  pendingColor = "white"; // Default to white task
  pendingCost = 0;
  pendingTask = true;
  garden.style.cursor = "crosshair";

  // Reset all button text colors before setting white text color
  resetButtonTextColors();

  // Set the white task button text color to black
  const whiteButton = document.getElementById("white");
  whiteButton.style.color = "#000000";
}

function selectTaskColor(color, cost) {
  if (points < cost) {
    alert(`You need ${cost} points for this task.`);
    return;
  }

  const name = prompt(`Enter your ${color} task name:`);
  if (!name) return;

  pendingTaskName = name;
  pendingColor = color;
  pendingCost = cost;
  pendingTask = true;
  garden.style.cursor = "crosshair";

  // Reset all button text colors before setting the selected color
  resetButtonTextColors();

  // Set the selected button text color to black based on the selected task color
  const selectedButton = document.querySelector(`.plant-option.${color}`);
  selectedButton.style.color = "#000000";
}

// Function to reset the button text colors
function resetButtonTextColors() {
  const buttons = document.querySelectorAll(".plant-option");
  buttons.forEach((button) => {
    button.style.color = "#FFFFFF"; // Reset to default text color
  });
}

garden.addEventListener("click", function (e) {
  if (e.target.classList.contains("task")) return;
  hideMenu();

  const rect = garden.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  x = Math.max(0, Math.min(x, rect.width));
  y = Math.max(0, Math.min(y, rect.height));

  if (pendingTask) {
    if (pendingCost > 0) {
      points -= pendingCost;
      updatePointsDisplay();
    }

    const taskData = {
      name: pendingTaskName,
      color: pendingColor,
      relX: x / rect.width,
      relY: y / rect.height,
      points: pendingCost > 0 ? pendingCost : 10,
      grown: false,
    };

    createTaskElement(taskData, rect);

    // Save to localStorage
    saveTasks();

    // Reset
    pendingTask = false;
    pendingTaskName = "";
    pendingColor = "white";
    pendingCost = 0;
    garden.style.cursor = "default";
  }
});

function createTaskElement(data, rect) {
  const task = document.createElement("div");
  task.className = "task";
  task.innerText = data.name + (data.grown ? " (✓)" : "");
  if (data.grown) task.classList.add("grown");
  task.style.backgroundColor = data.color;
  task.style.left = `${rect.width * data.relX}px`;
  task.style.top = `${rect.height * data.relY}px`;
  task.dataset.relativeX = data.relX;
  task.dataset.relativeY = data.relY;
  task.dataset.pointsOnComplete = data.points;
  task.dataset.name = data.name;
  task.dataset.color = data.color;
  task.dataset.grown = data.grown;

  task.addEventListener("click", (e) => {
    e.stopPropagation();
    showMenu(task);
  });

  garden.appendChild(task);
}

function showMenu(task) {
  selectedTask = task;
  taskMenu.style.left = task.style.left;
  taskMenu.style.top = task.style.top;
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

  localStorage.setItem("taskGardenTasks", JSON.stringify(taskData));
  localStorage.setItem("taskGardenPoints", points.toString());
}

function loadTasks() {
  const rect = garden.getBoundingClientRect();
  const stored = localStorage.getItem("taskGardenTasks");
  const storedPoints = localStorage.getItem("taskGardenPoints");

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

loadTasks();
updatePointsDisplay();
