let EDITING = false;
let EDITING_ELEMENT = null;
let UNSAVED_CONTENT = false;

function editFocus(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

function onEdit(field,newElement,mode) {
    if (EDITING_ELEMENT == field) {
        editFocus(newElement.firstElementChild)
        return;
    }
    if (EDITING_ELEMENT) {
        const oldElement = document.getElementById("text-"+nameToIndex[EDITING_ELEMENT]).parentElement;
        oldElement.firstElementChild.contentEditable = false;
        oldElement.innerHTML = oldElement.innerHTML;
        let content = oldElement.querySelector("p").innerHTML; // final save in case user's last interaction wasn't captured.
        if (content == "") oldElement.firstElementChild.innerHTML = "&nbsp;";
        if (content == "&nbsp;" || content == "<br>") content = "";
        let edited = true;
        if (mode == 0) {
            character.data[field] = isNaN(Number(content || "hi")) ? content : Number(content);
        } else {
            edited = false;
        }
        if (edited) {
            UNSAVED_CONTENT = true;
            if (!EDITING) {
                UNSAVED_CONTENT = false;
                character.save(SLOT);
            }
        }
        character.updateDisplay();
    }
    EDITING_ELEMENT = field;
    if (!EDITING_ELEMENT) return;
    newElement.firstElementChild.contentEditable = true;
    editFocus(newElement.firstElementChild);
    newElement.firstElementChild.addEventListener("click",function(e) {e.stopPropagation();})
    newElement.firstElementChild.addEventListener("keyup",function (e) {
        let content = newElement.querySelector("p").innerHTML;
        if (content == "") newElement.firstElementChild.innerHTML = "&nbsp;";
        if (content == "&nbsp;" || content == "<br>") content = "";
        let edited = true;
        if (mode == 0) {
            character.data[field] = isNaN(Number(content || "hi")) ? content : Number(content);
        } else {
            edited = false;
        }
        if (edited) {
            UNSAVED_CONTENT = true;
            if (!EDITING) {
                UNSAVED_CONTENT = false;
                character.save(SLOT);
            }
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
    for (let i = 35; i <= 43; i++)  { // weapon editing
        const container = document.getElementById("text-"+i).parentElement;
        container.addEventListener("click",openWeaponsModal);
        container.classList.add("editable-box");
    }
    const classLevels = document.getElementById("text-28").parentElement;
    classLevels.addEventListener("click",openLevelsModal);
    classLevels.classList.add("editable-box");
}
function loadAlwaysEditing() {
    if (!EDITING) {
        for (const field in fieldEditType) {
            if (fieldEditType[field] != 1) continue;
            const box = document.getElementById("text-"+nameToIndex[field]).parentElement;
            box.setAttribute("onclick", `onEdit("${field}",this,0)`);
            box.classList.add("editable-box");
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
        EDITING_ELEMENT = null;
        document.getElementById("edit-icon").style.display = "none";
        document.getElementById("done-edit-icon").style.display = "";
    }
    loadUI();
}