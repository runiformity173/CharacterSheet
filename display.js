let BG_COLOR = "navy";
let FG_COLOR = "powderblue";
function load() {
    setColors(BG_COLOR,FG_COLOR);
    loadPage("main_page");
    loadPage("background_page");
    loadPage("spell_page");
}
function setColors(bg, fg, parent=document) {
    if (parent === document) {
        document.body.style.backgroundColor = bg;
    }
    for (const el of parent.querySelectorAll(".fg-image .div-bg")) {
        el.style.backgroundColor = fg;
    }
    for (const el of parent.querySelectorAll(".bg-image .div-bg")) {
        el.style.backgroundColor = bg;
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
    setColors(BG_COLOR,FG_COLOR,el);
}