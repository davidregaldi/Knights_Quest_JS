class Character {
    constructor(pseudo, heroClass, level, attack, xpMax, xp, hpMax, hp, mpMax, mp) {
      this.pseudo = pseudo;
      this.heroClass = heroClass;
      this.level = level;
      this.attack = attack;
      this.xpMax = xpMax;
      this.xp = xp;
      this.hpMax = hpMax;
      this.hp = hp;
      this.mpMax = mpMax;
      this.mp = mp;
    }

    get infos(){
        if(this.xpMax == 0 && this.mpMax == 0) {
            return "Pseudo: " + this.pseudo + " Class: " + this.heroClass + " Level: " + this.level + " Attack: " + this.attack + " Hp: " + this.hp + " / " + this.hpMax;
        }
        else if(this.xpMax == 0) {
            return "Pseudo: " + this.pseudo + " Class: " + this.heroClass + " Level: " + this.level + " Attack: " + this.attack + " Hp: " + this.hp + " / " + this.hpMax + " Mp: " + this.mp + " / " + this.mpMax;
        }
        else if(this.mpMax == 0) {
            return "Pseudo: " + this.pseudo + " Class: " + this.heroClass + " Level: " + this.level + " Attack: " + this.attack + " Xp: " + this.xp + " / " + this.xpMax + " Hp: " + this.hp + " / " + this.hpMax;
        }
        else {
            return "Pseudo: " + this.pseudo + " Class: " + this.heroClass + " Level: " + this.level + " Attack: " + this.attack + " Xp: " + this.xp + " / " + this.xpMax + " Hp: " + this.hp + " / " + this.hpMax + " Mp: " + this.mp + " / " + this.mpMax;
        }
    }

    displayCharacter(color) {
        let div = document.createElement("div");
        div.id = this.pseudo;
        div.textContent = this.infos;
        div.style.padding = "10px";
        div.style.margin = "10px";
        div.style.color = color;
        div.style.backgroundColor = "black";
        document.body.appendChild(div);
    }

    hideCharacter() {
        let div = document.getElementById(this.pseudo);
        div?.remove(); // Supprime la div si elle existe (opérateur de chaînage optionnel)
    }

    launchAttack(target) {
        let damage = Math.floor(Math.random() * this.attack) + 1;
        target.hp = target.hp - damage;
        target.hideCharacter();
        target.displayCharacter("red");
        console.log(target.hp)
    }

}

let header = document.createElement("header");
let h1 = document.createElement("h1");
h1.textContent = "Knight's Quest JS";
h1.style.padding = "10px 10px 0px 10px";

let small = document.createElement("small");
small.textContent = "JavaScript Edition";
small.style.padding = "10px";

header.appendChild(h1);
header.appendChild(small);

document.body.appendChild(header);

var player = new Character('Player', 'Knight', 1, 10, 100, 0, 50, 50, 20, 20);
var orc = new Character('Orc', 'Warrior', 1, 10, 0, 0, 30, 30, 0, 0);

let buttonAttack = document.createElement("button");

buttonAttack.textContent = "Attaquer !"
buttonAttack.style.padding = "10px";
buttonAttack.style.margin = "10px";
buttonAttack.addEventListener("click", function() {
    player.launchAttack(orc);
});
document.body.appendChild(buttonAttack);

player.displayCharacter('green');
orc.displayCharacter('red');
