let BG_COLOR = "#002400";
let FG_COLOR = "#ddddff";
let SLOT = "";
function setSlot() {
    let slot;
    if (window.location.hash.length < 2) slot = "default";
    else slot = window.location.hash.slice(1);
    if (slot != SLOT) {
        SLOT = slot;
        character.load(SLOT);
    }
}
window.addEventListener("hashchange",setSlot);
function load() {
    updateColors();
    loadPage("main_page");
    
    for (const page of document.getElementsByClassName("sheet-page")) {
        page.addEventListener("click",()=>{onEdit(null,page,-1)});
    }
    // loadPage("background_page");
    // loadPage("spell_page");
    setTimeout(function(){loadUI();setSlot();},10);
}
function updateColors(parent=document) {
    if (parent === document) {
        document.body.style.backgroundColor = BG_COLOR;
        document.body.style.color = FG_COLOR;
        document.documentElement.style.setProperty('--bs-light', FG_COLOR);
        document.documentElement.style.setProperty('--bs-dark', BG_COLOR);
    }
    for (const el of parent.querySelectorAll(".fg-image .div-bg")) {
        el.style.backgroundColor = FG_COLOR;
    }
    for (const el of parent.querySelectorAll(".bg-image .div-bg")) {
        el.style.backgroundColor = BG_COLOR;
    }
    for (const el of parent.querySelectorAll(".dot")) {
        el.style.backgroundColor = FG_COLOR;
    }
}
function loadPage(image) {
    const el = document.createElement("div");
    el.classList.add("sheet-page");
    el.innerHTML = `
      <div class="fg-image">
        <div class="div-bg"></div>
        <img src="images/${image}.jpg"></img>
      </div>
      <div class="bg-image">
        <div class="div-bg"></div>
        <img src="images/${image}.jpg"></img>
      </div>
    `;
    document.querySelector(".sheet-pages").appendChild(el);
    updateColors(el);
}
function loadDots() {
    for (const dot of document.querySelectorAll(".dot")) dot.remove();
    const page = document.querySelector(".sheet-page");
    const [px,py] = [page.clientWidth,page.clientHeight];
    let counter = 0;
    for (const [x,y,s,page] of dotLocations) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        dot.style.left = (px*x)+"px"
        dot.style.top = ((y+page)*py)+"px"
        dot.id = "dot-"+counter;
        counter++;
        const size = px*s;
        dot.style.width = size+"px";
        dot.style.height = size+"px";
        dot.style.backgroundColor = FG_COLOR;
        document.querySelector(".sheet-pages").appendChild(dot);
    }
}
function loadBoxes() {
    let counter = 0;
    for (const box of document.querySelectorAll(".text-box")) box.remove();
    const page = document.querySelector(".sheet-page");
    const [px,py] = [page.clientWidth,page.clientHeight];
    for (const [x1,y1,page1,x2,y2,page2,style] of textBoxLocations) {
        const box = document.createElement("div");
        if (style) box.className = style;
        box.classList.add("text-box");
        box.style.left = (px*x1)+"px";
        box.style.top = ((y1+page1)*py)+"px";
        box.style.width = ((px*x2)-(px*x1))+"px";
        box.style.height = (((y2+page2)*py)-((y1+page1)*py))+"px";
        document.querySelector(".sheet-pages").appendChild(box);
        const boxText = document.createElement("p");
        boxText.classList.add("text-box-text");
        box.appendChild(boxText);
        boxText.id = "text-"+counter;
        counter++;
    }
}
function loadUI() {
    loadDots();
    loadBoxes();
    character.updateDisplay();
    if (EDITING) {
        loadBasicEditing();
    }
    loadAlwaysEditing();
}
let startX, startY;
document.querySelector('.sheet-pages').addEventListener("mousedown",function(e) {
    var rect = document.querySelector('.sheet-page').getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
});
document.querySelector('.sheet-pages').addEventListener("mouseup",function(e) {
    var rect = document.querySelector('.sheet-page').getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    if (x < startX) {
        [x, startX] = [startX, x];
    }
    if (y < startY) {
        [y, startY] = [startY, y];
    }
    console.log([startX/rect.width,startY/rect.height % 1, Math.floor(startY/rect.height),x/rect.width,y/rect.height % 1, Math.floor(y/rect.height),"free-text-half"]);
});
window.addEventListener("resize", function () {
    loadUI();
})
// document.addEventListener('selectstart', (e) => {
//   e.preventDefault();
// },{passive: false});