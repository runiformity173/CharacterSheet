// Thank you AI for getting me started on the UI. I'll take it from here, but it started the modal UI.
const levelList = document.getElementById("levelList");
const addLevelBtn = document.getElementById("addLevelBtn");
const saveLevelsBtn = document.getElementById("saveLevelsBtn");

const levelsModal = new bootstrap.Modal(
    document.getElementById("levelsModal")
);

function openLevelsModal() {
    loadLevelsIntoModal(character.data.class);
    levelsModal.show();
}

function loadLevelsIntoModal(levelArray) {
    levelList.innerHTML = "";
    for (const i in levelArray) {
        addLevelEditor({className: i, classLevel: levelArray[i]});
    }
    updateAddLevelButton();
}

function addLevelEditor(level = {}) {
    const div = document.createElement("div");
    div.className = "level-editor";
    div.innerHTML = `
        <div class="level-header">
            <strong>Level</strong>
            <button
                type="button"
                class="btn btn-sm btn-outline-danger remove-level">
                Remove
            </button>
        </div>
        <div class="level-grid">
            <div>
                <label class="form-label">Class</label>
                <input
                    class="form-control level-name"
                    value="${level.className ?? ""}">
            </div>
            <div>
                <label class="form-label">Level</label>
                <input
                    type="number"
                    class="form-control level-level"
                    value="${level.classLevel ?? 0}">
            </div>
        </div>
    `;
    div.querySelector(".remove-level").addEventListener("click", () => {
        if (confirm("Are you sure you want to remove this class?")) {
            div.remove();
            updateAddLevelButton();
        }
    });
    levelList.appendChild(div);
    updateAddLevelButton();
}

function updateAddLevelButton() {
    const count = levelList.children.length;
    addLevelBtn.disabled = false;
}

addLevelBtn.addEventListener("click", () => {
    addLevelEditor({
        className: "",
        classLevel: 1,
    });
});

function getLevelsFromModal() {
    const arr = [...levelList.querySelectorAll(".level-editor")].map(editor => ({
        className: editor.querySelector(".level-name").value.trim(),
        classLevel: parseInt(
            editor.querySelector(".level-level").value,
            10
        ) || 0,
    }));
    const classDict = {};
    for (const i of arr) {
        classDict[i.className] = i.classLevel;
    }
    return classDict;
}

saveLevelsBtn.addEventListener("click", () => {
    const newLevels = getLevelsFromModal();
    character.data.class = newLevels;
    levelsModal.hide();
    character.updateDisplay();
});