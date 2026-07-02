function rawToBonus(raw) {
    return Math.floor(raw/2)-5;
}
function bonusToDisplay(bonus) {
    return bonus < 0 ? String(bonus) : "+"+String(bonus);
}
const abilityScores = ["str","dex","con","int","wis","cha"];
class Character {
    constructor(data) {
        this.data = data || {
            name:"",
            class:{},
            background:"",
            playerName:"",
            race:"",
            alignment:"",
            experiencePoints:"",
            str:10,
            dex:10,
            con:10,
            int:10,
            wis:10,
            cha:10,
            pb:2,
            ac:10,
            speed:"30 ft.",
            proficiencies:[],
            additionalBonuses:{},
            inspiration:"",
            maxHitDice:"",
            hitDice:"",
            deathSaveSuccess1:false,
            deathSaveSuccess2:false,
            deathSaveSuccess3:false,
            deathSaveFailure1:false,
            deathSaveFailure2:false,
            deathSaveFailure3:false,
            weapons:[],
            personalityTraits: "",
            ideals: "",
            bonds: "",
            flaws: "",
            attacksAndSpellcasting: "",
            featuresAndTraits: "",
            otherProficienciesAndLanguages: "",
            equipment: "",
            characterAppearance:"",
            alliesAndOrganizations:"",
            characterBackstory:"",
            additionalFeatures:"",
            treasure:"",
            factionSymbol:"",
            factionName:"",
            age:"",
            height:"",
            weight:"",
            eyes:"",
            skin:"",
            hair:"",
        };
        this.bonuses = {};
        this.display = {};
        this.dots = {};
    }
    calculateClassString() {
        const levels = Object.entries(this.data.class);
        if (levels.length == 0) {
            this.display.classLevels = "N/A";
            return;
        }
        levels.sort((a,b)=>b[1]-a[1]);
        this.display.classLevels = levels.map(([c,l])=>c+" "+l).join(" / ");
    }
    calculateBonuses() {
        for (const i of abilityScores) {
            this.bonuses[i] = rawToBonus(this.data[i]);
            this.display[i+"Bonus"] = bonusToDisplay(this.bonuses[i]);
        }
        this.bonuses["pb"] = this.data.pb;
        for (const skill in skillToAbilityScore) {
            this.bonuses[skill] = this.bonuses[skillToAbilityScore[skill]];
        }
        this.bonuses["initiative"] = this.bonuses["dex"];
        this.bonuses["ac"] = this.data.ac;
        this.bonuses["passivePerception"] = 10;
        for (let i = 1;i<=this.data.weapons.length;i++) {
            const weapon = this.data.weapons[i-1];
            this.bonuses["attackBonus"+i] = weapon.attackBonus;
            this.bonuses["attackDamageBonus"+i] = weapon.attackDamageBonus;
        }
    }
    calculateDots() {
        for (const prof of this.data.proficiencies) {
            this.bonuses[prof] += this.bonuses["pb"];
            this.dots[prof] = 1;
        }
        for (const res of ["Success","Failure"]) {
            for (let i = 1; i <= 3; i++) {
                const str = "deathSave"+res+i;
                if (this.data[str]) this.dots[str] = this.data[str];
            }
        }
    }
    calculateAdditionalBonuses() {
        this.bonuses["dexMax2"] = Math.min(this.bonuses["dex"],2)
        for (const modified in this.data.additionalBonuses) {
            if (modified == "ALL") continue;
            if (modified == "SKILLS") continue;
            if (modified == "SAVES") continue;
            if (modified == "SKILLS_AND_SAVES") continue;
            for (const mod of this.data.additionalBonuses[modified]) {
                if (mod in this.bonuses) {
                    this.bonuses[modified] += this.bonuses[mod];
                }
                else if (mod[0] == "SET") {
                    this.bonuses[modified] = mod[1];
                }
            }
        }
    }
    displayBonuses() {
        for (const skill in skillToAbilityScore) {
            this.display[skill] = bonusToDisplay(this.bonuses[skill]);
        }
        this.display.initiative = bonusToDisplay(this.bonuses["initiative"]);
        this.display.ac = this.bonuses["ac"];
        this.bonuses["passivePerception"] += this.bonuses["perception"];
        this.display.passivePerception = this.bonuses["passivePerception"];
    }
    displayWeapons() {
        for (let i = 1;i<=this.data.weapons.length;i++) {
            const weapon = this.data.weapons[i-1];
            this.display["attackName"+i] = weapon.attackName;
            this.display["attackBonus"+i] = bonusToDisplay(this.bonuses["attackBonus"+i]);
            let damageString = weapon.attackDamageDice;
            if (this.bonuses["attackDamageBonus"+i] != 0)
                damageString += bonusToDisplay(this.bonuses["attackDamageBonus"+i]);
            damageString += " " + weapon.attackDamageType;
            this.display["attackDamage"+i] = damageString;
        }
    }
    updateDisplay() {
        this.display = {};
        this.bonuses = {};
        this.dots = {};
        for (const i in this.data) {
            if (i in nameToIndex) {
                this.display[i] = this.data[i].content || this.data[i];
            }
        }
        this.calculateClassString();
        this.calculateBonuses();
        this.calculateDots();
        this.calculateAdditionalBonuses();
        this.displayBonuses();
        this.displayWeapons();
        // calculate additional bonuses here
        this.display.pb = bonusToDisplay(this.display.pb);
        for (const i in this.display) {
            const p = document.getElementById("text-"+nameToIndex[i]);
            p.innerHTML = this.display[i];
            if (p.scrollWidth <= p.clientWidth) continue;
            const updateScrollIndicators = function() {
                const maxScroll = p.scrollWidth - p.clientWidth;
                p.classList.toggle(
                    "can-scroll-left",
                    p.scrollLeft > 0
                );
                p.classList.toggle(
                    "can-scroll-right",
                    p.scrollLeft < maxScroll - 1
                );
            }
            p.addEventListener("scroll", updateScrollIndicators);
            updateScrollIndicators();
        }
        for (const i of document.querySelectorAll(".dot")) {
            i.classList.add("dot-hidden");
        }
        for (const i in this.dots) {
            const p = document.getElementById("dot-"+dotNameToIndex[i]);
            if (p.classList.contains("dot-hidden")) {
                p.classList.remove("dot-hidden");
            }
        }
    }
    save(slot) {
        const cur = JSON.parse(window.localStorage.getItem("character") || "{}");
        cur[slot] = this.data;
        window.localStorage.setItem("character",JSON.stringify(cur));
    }
    load(slot) {
        const cur = JSON.parse(window.localStorage.getItem("character") || "{}");
        if (slot in cur) {
            this.data = cur[slot];
            this.updateDisplay();
        }
    }
}
const character = new Character({
    name:"Ibarc",
    class:{
        "Druid":8,
    },
    background:"Hermit",
    playerName:"Eli",
    race:"Half-elf",
    alignment:"Neutral good",
    experiencePoints:"",
    str:12,
    dex:13,
    con:14,
    int:11,
    wis:20,
    cha:8,
    pb:3,
    ac:12,
    hp:38,
    maxHp:38,
    speed:"30 ft.",
    proficiencies:[
        "acrobatics",
        "nature",
        "survival",
        "perception",
        "strSave",
        "wisSave",
    ],
    additionalBonuses:{
        "attackDamageBonus1":["str"],
        "attackBonus1":["str","pb"],
        "attackDamageBonus2":["wis"],
        "attackBonus2":["wis","pb"],
        "ac":["dex"],
    },
    inspiration:"",
    maxHitDice:"8d8",
    hitDice:"8d8",
    deathSaveSuccess1:true,
    deathSaveSuccess2:true,
    deathSaveSuccess3:true,
    deathSaveFailure1:true,
    deathSaveFailure2:false,
    deathSaveFailure3:false,
    weapons:[
        {
            attackName: "Quarterstaff",
            attackBonus: 0,
            attackDamageDice: "1d6",
            attackDamageBonus: 0,
            attackDamageType: "Bludgeoning",
        },
        {
            attackName: "Shilleleigh",
            attackBonus: 0,
            attackDamageDice: "1d8",
            attackDamageBonus: 0,
            attackDamageType: "Bludgeoning",
        }
    ],
    personalityTraits: "",
    ideals: "",
    bonds: "",
    flaws: "",
    attacksAndSpellcasting: "",
    featuresAndTraits: "",
    otherProficienciesAndLanguages: "",
    equipment: "",
    characterAppearance:"",
    alliesAndOrganizations:"",
    characterBackstory:"",
    additionalFeatures:"",
    treasure:"",
    factionSymbol:"",
    factionName:"",
    age:"",
    height:"",
    weight:"",
    eyes:"",
    skin:"",
    hair:"",
});