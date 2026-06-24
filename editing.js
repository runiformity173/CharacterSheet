let EDITING = false;
let EDITING_ELEMENT = null;
let UNSAVED_CONTENT = false;

function onEdit(field,newElement,mode) {
    if (field) newElement.firstElementChild.focus();
    if (EDITING_ELEMENT == field) return;
    if (!EDITING) {character.save(SLOT);}
    if (EDITING_ELEMENT) {
        const oldElement = document.getElementById("text-"+nameToIndex[EDITING_ELEMENT]).parentElement;
        oldElement.firstElementChild.contentEditable = false;
        oldElement.outerHTML = oldElement.outerHTML;
        character.updateDisplay();
    }
    EDITING_ELEMENT = field;
    if (!EDITING_ELEMENT) return;
    newElement.firstElementChild.contentEditable = true;
    newElement.firstElementChild.focus();
    newElement.firstElementChild.addEventListener("keyup",function (e) {
        let content = newElement.querySelector("p").innerHTML;
        if (content == "") newElement.firstElementChild.innerHTML = "&nbsp;";
        if (content == "&nbsp;" || content == "<br>") content = "";
        let edited = true;
        if (mode == 0) {
            character.data[field] = isNaN(Number(content)) ? content : Number(content);
        } else {
            edited = false;
        }
        if (edited) {
            UNSAVED_CONTENT = true;
        }
    },{});
}
function toggleProficiency(skill, el) {
    let enabled = !el.classList.contains("dot-hidden");
    const profs = character.data.proficiencies;
    if (enabled) {
        if (profs.includes(skill)) {
            profs.splice(profs.indexOf(skill),1);
        }
        el.classList.add("dot-hidden");
    } else {
        if (!profs.includes(skill)) {
            profs.push(skill);
        }
        el.classList.remove("dot-hidden");
    }
    character.updateDisplay();
    UNSAVED_CONTENT = true;
}
function toggleDot(name, el) {
    let enabled = !el.classList.contains("dot-hidden");
    if (enabled) {
        el.classList.add("dot-hidden");
    } else {
        el.classList.remove("dot-hidden");
    }
    character.data[name] = !enabled;
    character.updateDisplay();
    character.save(SLOT);
}
function loadBasicEditing() {
    for (const field in fieldEditType) {
        if (fieldEditType[field] != 0 && fieldEditType[field] != 1) continue;
        const box = document.getElementById("text-"+nameToIndex[field]).parentElement;
        box.setAttribute("onclick", `onEdit("${field}",this,0)`);
        box.classList.add("editable-box");
        box.tabIndex = 1;
    }
    for (const skill in skillToAbilityScore) {
        const dot = document.getElementById("dot-"+dotNameToIndex[skill]);
        dot.setAttribute("onclick", `toggleProficiency("${skill}", this)`);
        dot.classList.add("clickable-dot");
    }
}
function loadAlwaysEditing() {
    if (!EDITING) {
        for (const field in fieldEditType) {
            if (fieldEditType[field] != 1) continue;
            const box = document.getElementById("text-"+nameToIndex[field]).parentElement;
            box.setAttribute("onclick", `onEdit("${field}",this,0)`);
            box.tabIndex = 1;
        }
    }
    for (let i = 24; i < 30;i++) { // death saves only rn
        const dot = document.getElementById("dot-"+i);
        dot.setAttribute("onclick", `toggleDot("${dotIndexToName[i]}", this)`);
        dot.classList.add("clickable-dot");
    }
}

function toggleEditing() {
    if (EDITING) {
        EDITING = false;
        character.save(SLOT);
        UNSAVED_CONTENT = false;
        EDITING_ELEMENT = null;
        document.getElementById("edit-icon").style.display = "";
        document.getElementById("done-edit-icon").style.display = "none";
    } else {
        EDITING = true;
        UNSAVED_CONTENT = false;
        document.getElementById("edit-icon").style.display = "none";
        document.getElementById("done-edit-icon").style.display = "";
    }
    loadUI();
}