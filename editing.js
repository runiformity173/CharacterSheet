let EDITING = false;
let EDITING_ELEMENT = null;

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
function editField(newElement, mode, field) {
    let content = newElement.querySelector("p").innerHTML;
    if (content == "" || content == "<br>") {
        content = "&nbsp;"
        newElement.firstElementChild.innerHTML = content;
    }
    content = content.replaceAll("&nbsp;","");
    let edited = true;
    if (mode == 0) {
        character.data[field] = isNaN(Number(content || "hi")) ? content : Number(content);
    } else {
        edited = false;
    }
    if (edited) {
        if (!EDITING) {
            character.save(SLOT);
        }
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
        editField(oldElement, mode, EDITING_ELEMENT);
        character.updateDisplay();
    }
    EDITING_ELEMENT = field;
    if (!EDITING_ELEMENT) return;
    newElement.firstElementChild.contentEditable = true;
    editFocus(newElement.firstElementChild);
    newElement.firstElementChild.addEventListener("click",function(e) {e.stopPropagation();})
    editField(newElement, mode, field);
    newElement.firstElementChild.addEventListener("keyup",function (e) {editField(newElement, mode, field)});
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
    if (!EDITING) character.save(SLOT);
}
function loadBasicEditing() {
    for (const field in fieldEditType) {
        if (![0,1,2].includes(fieldEditType[field])) continue;
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
            if (fieldEditType[field] != 1 && fieldEditType[field] != 3) continue;
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
function addOrSubtractClicked(field, mult) {
    const amount = Number(prompt("How much?"));
    if (isNaN(amount)) return;
    character.data[field] += mult*amount;
    character.updateDisplay();
    if (!EDITING) character.save(SLOT);
}
function loadAdders() {
    for (const field in fieldEditType) {
        if (fieldEditType[field] != 3) continue;
        const box = document.getElementById("text-"+nameToIndex[field]).parentElement;
        const adder = document.createElement("button");
        adder.classList = "adder btn btn-light increment";
        adder.innerHTML = `+`;
        const subtractor = document.createElement("button");
        subtractor.classList = "subtractor btn btn-light increment";
        subtractor.innerHTML = `-`;
        adder.addEventListener("click",(e)=>{e.stopPropagation();addOrSubtractClicked(field,1)});
        subtractor.addEventListener("click",(e)=>{e.stopPropagation();addOrSubtractClicked(field,-1)});
        box.appendChild(adder);
        box.appendChild(subtractor);
    }
}
function toggleEditing() {
    if (EDITING) {
        EDITING = false;
        character.save(SLOT);
        EDITING_ELEMENT = null;
        document.getElementById("edit-icon").style.display = "";
        document.getElementById("done-edit-icon").style.display = "none";
        document.getElementById("topRightSecondButton").style.display = "none";
    } else {
        EDITING = true;
        EDITING_ELEMENT = null;
        document.getElementById("edit-icon").style.display = "none";
        document.getElementById("done-edit-icon").style.display = "";
        document.getElementById("topRightSecondButton").style.display = "";
    }
    loadUI();
}
window.addEventListener('beforeunload', (event) => {
    if (getChecksum(character.data) != currentChecksum) {
        event.preventDefault();
        event.returnValue = '';
    }
});