function loadSaveOptions(container) {
    const data = JSON.parse(localStorage.getItem("character") || "{}");
    for (const i in data) {
        const div = document.createElement("div");
        div.classList.add("slot-option");
        div.innerHTML = `<a class="btn btn-outline-light" href="?${i}">asdf</a>`; // card per slot with name and such.
        container.appendChild(div);
    }
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

function loadMain() {
    setSlot();
}