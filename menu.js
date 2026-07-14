function loadSaveOptions(container) {
    const data = JSON.parse(localStorage.getItem("character") || "{}");
    container.innerHTML = `
    <div class="container-fluid">
        <div class="row g-3 justify-content-center">
        </div>
    </div>`;
    for (const i in data) {
        const temp = new Character(data[i]);
        temp.calculateClassString();
        const div = document.createElement("div");
        div.className = "slot-option col-12 col-sm-6";
        div.innerHTML = `
        <a href="?${i}" style="text-decoration: none; color: inherit;">
            <div class="border rounded p-3 h-100">
                <h1>${data[i].name}</h1>
                Class: ${temp.display.classLevels || "None"}<br>
                Race: ${data[i].race || "None"}<br>
                <button class="btn btn-outline-light remove-slot-button">&ndash;</button>
            </div>
        </a>`;
        const removeButton = div.querySelector(".remove-slot-button");
        removeButton.addEventListener("click", function (e) {
            e.preventDefault();
            deleteSlotDialogue(i,removeButton);
        });
        container.querySelector(".row").appendChild(div);
    }
    const div = document.createElement("div");
    div.className = "col-12 col-sm-6";
    div.innerHTML = `
    <div class="p-3 h-100">
        <a class="add-slot-button" href="?${newSlot()}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
            </svg>
        </a>
    </div>`;
    container.querySelector(".row").appendChild(div);
}
function setSlot() {
    let slot = undefined;
    if (!window.location.href.includes("?") || !window.location.href.split("?").at(-1)) slot = null;
    else slot = window.location.href.split("?").at(-1);
    if (slot !== SLOT) {
        SLOT = slot;
        if (SLOT != null) {
            load();
        } else {
            loadSaveOptions(document.getElementById("mainMenu"));
            document.getElementById("topRightButton").remove();
        }
    }
}
function newSlot() {
    out = Array.from({length:32}).map(o=>"0123456789abcdef"[Math.floor(Math.random()*16)]);
    out[12] = "4";
    return out.join("");
}
function deleteSlotDialogue(slot,button) {
    if (prompt('Type "Delete this character" to delete it. You cannot undo this.').toLowerCase() == "delete this character") {
        const data = JSON.parse(localStorage.getItem("character") || "{}");
        delete data[slot];
        localStorage.setItem("character",JSON.stringify(data));
        button.closest(".slot-option").remove();
    }
}
function loadMain() {
    setSlot();
}