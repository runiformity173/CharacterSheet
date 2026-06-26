// Thank you AI for getting me started on the UI. I'll take it from here, but it started the modal UI.
const MAX_WEAPONS = 3;

const weaponList = document.getElementById("weaponList");
const addWeaponBtn = document.getElementById("addWeaponBtn");
const saveWeaponsBtn = document.getElementById("saveWeaponsBtn");

const weaponsModal = new bootstrap.Modal(
    document.getElementById("weaponsModal")
);

function openWeaponsModal() {
    loadWeaponsIntoModal(character.data.weapons);
    weaponsModal.show();
}

function loadWeaponsIntoModal(weaponArray) {
    weaponList.innerHTML = "";
    weaponArray.forEach(addWeaponEditor);
    updateAddButton();
}

function addWeaponEditor(weapon = {}) {
    const div = document.createElement("div");
    div.className = "weapon-editor";
    div.innerHTML = `
        <div class="weapon-header">
            <strong>Weapon</strong>
            <button
                type="button"
                class="btn btn-sm btn-outline-danger remove-weapon">
                Remove
            </button>
        </div>
        <div class="weapon-grid">
            <div>
                <label class="form-label">Name</label>
                <input
                    class="form-control weapon-name"
                    value="${weapon.attackName ?? ""}">
            </div>
            <div>
                <label class="form-label">Attack Bonus</label>
                <input
                    type="number"
                    class="form-control weapon-attack-bonus"
                    value="${weapon.attackBonus ?? 0}">
            </div>
            <div>
                <label class="form-label">Damage Dice</label>
                <input
                    class="form-control weapon-damage-dice"
                    value="${weapon.attackDamageDice ?? "1d6"}">
            </div>
            <div>
                <label class="form-label">Damage Bonus</label>
                <input
                    type="number"
                    class="form-control weapon-damage-bonus"
                    value="${weapon.attackDamageBonus ?? 0}">
            </div>
            <div>
                <label class="form-label">Damage Type</label>
                <input
                    class="form-control weapon-damage-type"
                    value="${weapon.attackDamageType ?? ""}">
            </div>
        </div>
    `;
    div.querySelector(".remove-weapon").addEventListener("click", () => {
        if (confirm("Are you sure you want to remove this weapon?")) {
            div.remove();
            updateAddButton();
        }
    });
    weaponList.appendChild(div);
    updateAddButton();
}

function updateAddButton() {
    const count = weaponList.children.length;
    addWeaponBtn.disabled = count >= MAX_WEAPONS;
}

addWeaponBtn.addEventListener("click", () => {
    if (weaponList.children.length >= MAX_WEAPONS) return;
    addWeaponEditor({
        attackName: "",
        attackBonus: 0,
        attackDamageDice: "1d6",
        attackDamageBonus: 0,
        attackDamageType: ""
    });
});

function getWeaponsFromModal() {
    return [...weaponList.querySelectorAll(".weapon-editor")].map(editor => ({
        attackName: editor.querySelector(".weapon-name").value.trim(),
        attackBonus: parseInt(
            editor.querySelector(".weapon-attack-bonus").value,
            10
        ) || 0,
        attackDamageDice:
            editor.querySelector(".weapon-damage-dice").value.trim(),
        attackDamageBonus: parseInt(
            editor.querySelector(".weapon-damage-bonus").value,
            10
        ) || 0,
        attackDamageType:
            editor.querySelector(".weapon-damage-type").value.trim()
    }));
}

saveWeaponsBtn.addEventListener("click", () => {
    const newWeapons = getWeaponsFromModal();
    character.data.weapons = newWeapons; // fix
    weaponsModal.hide();
    character.updateDisplay();
});