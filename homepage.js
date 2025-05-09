const input = document.getElementById("garden-name-input");
const button = document.getElementById("create-btn");
const list = document.getElementById("garden-list");

function loadGardens() {
  const gardens = JSON.parse(localStorage.getItem("gardenList") || "[]");
  list.innerHTML = "";

  gardens.forEach((name) => {
    const li = document.createElement("li");

    const link = document.createElement("a");
    link.href = `garden.html?garden=${encodeURIComponent(name)}`;
    link.textContent = name;

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "delete-btn";
    del.onclick = () => {
      if (!confirm(`Delete garden "${name}"?`)) return;

      const updated = gardens.filter((g) => g !== name);
      localStorage.setItem("gardenList", JSON.stringify(updated));

      localStorage.removeItem(`taskGardenTasks__${name}`);
      localStorage.removeItem(`taskGardenPoints__${name}`);

      loadGardens();
    };

    li.appendChild(link);
    li.appendChild(del);
    list.appendChild(li);
  });
}

button.onclick = () => {
  const name = input.value.trim();
  if (!name) return alert("Garden name cannot be empty.");
  let gardens = JSON.parse(localStorage.getItem("gardenList") || "[]");
  if (gardens.includes(name)) return alert("Garden name already exists.");
  gardens.push(name);
  localStorage.setItem("gardenList", JSON.stringify(gardens));
  input.value = "";
  loadGardens();
};

loadGardens();

const showTutorialBtn = document.getElementById("show-tutorial");
const closeTutorialBtn = document.getElementById("close-tutorial");
const tutorialModal = document.getElementById("tutorial-modal");

showTutorialBtn.onclick = () => {
  tutorialModal.classList.remove("hidden");
};

closeTutorialBtn.onclick = () => {
  tutorialModal.classList.add("hidden");
};
