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
                    list="bonusTargetOptions"
                    value="${bonusTargetOptionsKV[bonus.bonusTarget] ?? ""}">
            </div>
            <div>
                <div class="selected-tags d-flex flex-wrap gap-1 mb-2"></div>
                <div class="position-relative">
                    <input
                        type="text"
                        class="form-control bonus-search"
                        placeholder="Add bonus...">
                    <div class="option-menu position-absolute w-100 mt-1"
                        style="z-index:1000; display:none; overflow:hidden; border-radius:var(--bs-border-radius); border: 1px solid var(--bs-body-color);">
                        <div class="list-group" style="overflow:auto;max-height:200px;border:none;">

                        </div>
                    </div>
                </div>
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
    initializeMultiSelect(
        div,
        bonus.bonusSource ?? []
    );
    div.querySelector(".remove-bonus").addEventListener("click", () => {
        if (confirm("Are you sure you want to remove this additional bonus?")) {
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
    const bonusDict = {};
    bonusList.querySelectorAll(".bonus-editor").forEach(editor => {
        const target = bonusTargetOptions[editor.querySelector(".bonus-name").value.trim()];
        if (!target) return;
        bonusDict[target] = editor._selectedBonuses;
    });
    return bonusDict;
}

saveBonusesBtn.addEventListener("click", () => {
    const newBonuses = getBonusesFromModal();
    character.data.additionalBonuses = newBonuses;
    bonusesModal.hide();
    character.updateDisplay();
});

// This multiselect code is mostly Chat...

function initializeMultiSelect(editor, selected = []) {
    editor._selectedBonuses = [...selected];
    renderMultiSelect(editor);
}

function renderMultiSelect(editor) {
    const selectedContainer = editor.querySelector(".selected-tags");
    const menu = editor.querySelector(".option-menu");
    const search = editor.querySelector(".bonus-search");
    const selected = editor._selectedBonuses;
    selectedContainer.innerHTML = "";
    for (const key of selected) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.innerHTML = `
            ${bonusOptions[key]}
            <span class="remove-tag ms-1">&times;</span>
        `;
        badge.querySelector(".remove-tag").onclick = () => {
            editor._selectedBonuses.splice(editor._selectedBonuses.indexOf(key),1);
            renderMultiSelect(editor);
        };
        selectedContainer.appendChild(badge);
    }
    if (!selected.length) {
        selectedContainer.innerHTML =
            '<span class="text-secondary fst-italic">None selected</span>';
    }
    function updateMenu() {
        const filter = search.value.trim().toLowerCase();
        menu.firstElementChild.innerHTML = "";
        let first = null;
        for (const key in bonusOptions) {
            const text = bonusOptions[key];
            if (!text.toLowerCase().includes(filter))
                continue;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "list-group-item list-group-item-action";
            btn.textContent = text;
            btn.onclick = () => {
                editor._selectedBonuses.push(key);
                search.value = "";
                renderMultiSelect(editor);
            };
            if (!first)
                first = btn;
            menu.firstElementChild.appendChild(btn);
        }
        menu.style.display = menu.firstElementChild.children.length ? "" : "none";
        editor._firstSearchResult = first;
    }
    search.oninput = updateMenu;
    search.onfocus = updateMenu;
    search.onkeydown = e => {
        if (e.key === "Enter" && editor._firstSearchResult) {
            e.preventDefault();
            editor._firstSearchResult.click();
        }
        if (e.key === "Escape") {
            menu.style.display = "none";
        }
    };
    search.onblur = () => {
        setTimeout(() => menu.style.display = "none", 100);
    };
}
const bonusOptions = {
    "pb":"Proficiency Bonus",
    "str": "Strength",
    "dex": "Dexterity",
    "con": "Constitution",
    "int": "Intelligence",
    "wis": "Wisdom",
    "cha": "Charisma",
    "acrobatics":"Acrobatics",
    "animalHandling":"Animal Handling",
    "arcana":"Arcana",
    "athletics":"Athletics",
    "deception":"Deception",
    "history":"History",
    "insight":"Insight",
    "intimidation":"Intimidation",
    "investigation":"Investigation",
    "medicine":"Medicine",
    "nature":"Nature",
    "perception":"Perception",
    "performance":"Performance",
    "persuasion":"Persuasion",
    "religion":"Religion",
    "sleightOfHand":"Sleight of Hand",
    "stealth":"Stealth",
    "survival":"Survival",
    "dexMax2":"Dexterity (Max +2)",
};
const bonusTargetOptions = {
    "Strength": "str",
    "Dexterity": "dex",
    "Constitution": "con",
    "Intelligence": "int",
    "Wisdom": "wis",
    "Charisma": "cha",
    "Acrobatics": "acrobatics",
    "Animal Handling": "animalHandling",
    "Arcana": "arcana",
    "Athletics": "athletics",
    "Deception": "deception",
    "History": "history",
    "Insight": "insight",
    "Intimidation": "intimidation",
    "Investigation": "investigation",
    "Medicine": "medicine",
    "Nature": "nature",
    "Perception": "perception",
    "Performance": "performance",
    "Persuasion": "persuasion",
    "Religion": "religion",
    "Sleight of Hand": "sleightOfHand",
    "Stealth": "stealth",
    "Survival": "survival",
    "Weapon 1 Attack": "attackBonus1",
    "Weapon 2 Attack": "attackBonus2",
    "Weapon 3 Attack": "attackBonus3",
    "Weapon 1 Damage": "attackDamageBonus1",
    "Weapon 2 Damage": "attackDamageBonus2",
    "Weapon 3 Damage": "attackDamageBonus3",
    "Initiative": "initiative",
    "Armor Class (AC)": "ac",
    "Passive Perception": "passivePerception",
    "All Skills": "SKILLS",
    "All Saving Throws": "SAVES",
    "All Skills and Saves": "SKILLS_AND_SAVES"
};
const bonusTargetOptionsKV = Object.fromEntries(Object.entries(bonusTargetOptions).map(o=>[o[1],o[0]]));
for (const i in bonusTargetOptions) {
    const opt = document.createElement("option");
    opt.innerHTML = i;
    document.getElementById("bonusTargetOptions").appendChild(opt);
}