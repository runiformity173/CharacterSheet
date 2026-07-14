function rawToBonus(raw) {
    return Math.floor(raw/2)-5;
}
function baseToDisplay(bonus) {
    return bonus == 0 ? "~" : bonusToDisplay(bonus);
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
            this.bonuses[skill] = this.data[skill] ?? 0;
            if (!EDITING) this.bonuses[skill] += this.bonuses[skillToAbilityScore[skill]];
        }
        this.bonuses["ac"] = this.data.ac;
        this.bonuses["passivePerception"] = this.data.passivePerception || 0;
        this.bonuses["initiative"] = this.data.initiative || 0;
        for (let i = 1;i<=this.data.weapons.length;i++) {
            const weapon = this.data.weapons[i-1];
            this.bonuses["attackBonus"+i] = weapon.attackBonus;
            this.bonuses["attackDamageBonus"+i] = weapon.attackDamageBonus;
        }
    }
    calculateDots() {
        for (const prof of this.data.proficiencies) {
            if (!EDITING) this.bonuses[prof] += this.bonuses["pb"];
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
            let modifiedList = [modified];
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
        this.bonuses["passivePerception"] += this.bonuses["perception"] + 10;
        this.bonuses["initiative"] = this.bonuses["dex"];
    }
    displayBonuses() {
        for (const skill in skillToAbilityScore) {
            this.display[skill] = (EDITING ? baseToDisplay : bonusToDisplay)(this.bonuses[skill]);
        }
        if (EDITING) {
            this.display.initiative = baseToDisplay(this.bonuses["initiative"]);
            this.display.ac = this.bonuses["ac"];
            this.display.passivePerception = baseToDisplay(this.bonuses["passivePerception"]);
        } else {
            this.display.initiative = bonusToDisplay(this.bonuses["initiative"]);
            this.display.ac = this.bonuses["ac"];
            this.display.passivePerception = this.bonuses["passivePerception"];
        }
    }
    displayWeapons() {
        for (let i = 1;i<=this.data.weapons.length;i++) {
            const weapon = this.data.weapons[i-1];
            this.display["attackName"+i] = weapon.attackName;
            this.display["attackBonus"+i] = (EDITING ? baseToDisplay : bonusToDisplay)(this.bonuses["attackBonus"+i]);
            let damageString = weapon.attackDamageDice;
            if (this.bonuses["attackDamageBonus"+i] != 0 || EDITING)
                damageString += (EDITING ? baseToDisplay : bonusToDisplay)(this.bonuses["attackDamageBonus"+i]);
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
        if (!EDITING) this.calculateAdditionalBonuses();
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
        currentChecksum = getChecksum(this.data);
    }
    load(slot) {
        const cur = JSON.parse(window.localStorage.getItem("character") || "{}");
        if (slot in cur) {
            this.data = cur[slot];
            this.updateDisplay();
            currentChecksum = getChecksum(this.data);
        }
    }
}
const character = new Character();