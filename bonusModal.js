const bonusList = document.getElementById("bonusList");
const addBonusBtn = document.getElementById("addBonusBtn");
const saveBonusesBtn = document.getElementById("saveBonusesBtn");

const bonusesModal = new bootstrap.Modal(
    document.getElementById("bonusesModal")
);

function openBonusesModal() {
    loadBonusesIntoModal(character.data.additionalBonuses);
    bonusesModal.show();
}

function loadBonusesIntoModal(bonusArray) {
    bonusList.innerHTML = `<div class="bonus-grid">
        <label class="form-label">Target</label>
        <label class="form-label">Bonuses</label>
    </div>`;
    for (const i in bonusArray) {
        addBonusEditor({bonusTarget: i, bonusSource: bonusArray[i]});
    }
    updateAddBonusButton();
}

function addBonusEditor(bonus = {}) {
    const div = document.createElement("div");
    div.className = "bonus-editor";
    div.innerHTML = `
        <div class="bonus-grid">
            <div>
                <input
                    class="form-control bonus-name"
                    value="${bonus.bonusTarget ?? ""}">
            </div>
            <div>
                <input
                    type="number"
                    class="form-control bonus-bonus"
                    value="${bonus.bonusSource ?? 0}">
            </div>
            <div>
                <button
                    type="button"
                    class="btn btn-sm btn-outline-light remove-bonus">
                    &ndash;
                </button>
            </div>
        </div>
    `;
    div.querySelector(".remove-bonus").addEventListener("click", () => {
        if (confirm("Are you sure you want to remove this class?")) {
            div.remove();
            updateAddBonusButton();
        }
    });
    bonusList.appendChild(div);
    updateAddBonusButton();
}

function updateAddBonusButton() {
    const count = bonusList.children.length;
    addBonusBtn.disabled = false;
}

addBonusBtn.addEventListener("click", () => {
    addBonusEditor({
        className: "",
        classBonus: 1,
    });
});

function getBonusesFromModal() {
    const arr = [...bonusList.querySelectorAll(".bonus-editor")].map(editor => ({
        className: editor.querySelector(".bonus-name").value.trim(),
        classBonus: parseInt(
            editor.querySelector(".bonus-bonus").value,
            10
        ) || 0,
    }));
    const classDict = {};
    for (const i of arr) {
        classDict[i.className] = i.classBonus;
    }
    return classDict;
}

saveBonusesBtn.addEventListener("click", () => {
    const newBonuses = getBonusesFromModal();
    character.data.class = newBonuses;
    bonusesModal.hide();
    character.updateDisplay();
});