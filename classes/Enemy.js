import { addToConsole } from '../main.js'
import Player from './Player.js'

class Enemy extends Player {
    constructor({id = 'enemy1', name = 'Enemy', y = 'random', x = 'random', consColor='brown', level = '', strengh = 15, dexterity = 10, xpMax = 250, xp = 0, hpMax = 100, hp = 100, potion = 0, gold = 5, map, entities}) {
        super({ id, name, y, x, consColor,level, strengh, dexterity, xpMax, xp, hpMax, hp, gold, map, entities })
        
        if (this.level === '') {
            this.level = Math.floor(this.randomizeMinMax(1,3))
            if (this.level <= 0) {
                this.level = 1
            }
        }
        this.strengh += (this.level - 1)
        this.dexterity += (this.level - 1)
        this.xpMax = Math.floor(250 * this.level)
        this.xp = Math.floor(this.randomizeValue(this.xpMax) / 3)
        this.gold = Math.floor(this.randomizeValue(gold) * this.level)
        this.hpMax = this.hpMax + Math.floor((this.hpMax*(this.level-1)*0.20))
        this.hp = this.hpMax
        this.potion = potion
        let i = true
        while (i === true) {
            if (Math.random() < 1 / 3) {
                this.potion += 1;
            }

            else {
                i = false
            }
        }
    };

    drop(target) {
        if (this.potion > 0) {
            target.potion += this.potion
            addToConsole(`${this.id} dropped: ${this.potion} potion(s)`)
        }
        if (this.gold > 0) {
            target.gold += this.gold
            addToConsole(`${this.id} dropped: ${this.gold}gp`, 'gold')

        }
        if (this.xp > 0) {
            target.xp += this.xp
            addToConsole(`${target.name} gains ${this.xp}xp`, 'orchid')

        }
    }

    attack(target, gameSounds) {
        const randomFactor = Math.random() * 0.4 + 0.8; // Facteur de dégâts aléatoire entre 0.8 et 1.2
        let damage = Math.round(this.strengh * randomFactor); // Calcul initial des dégâts
        const critChance = this.dexterity * 0.005; // 0.5% de chance par point de dextérité
    
        // Vérifie si un coup critique se déclenche
        if (Math.random() < critChance) {
            damage = Math.round(damage * 1.5); // Augmente les dégâts de 50%
            addToConsole(`${this.id} inflige ${damage} dégâts à ${target.id} (critique)`, 'red');
        } else {
            addToConsole(`${this.id} inflige ${damage} dégâts à ${target.id}`, this.consColor);
        }
    
        target.hp -= damage; // Applique les dégâts à la cible
    
        // Choisir et jouer un son de frappe
        const hitSound = Math.random() < 0.5 ? gameSounds['hit1'] : gameSounds['hit2'];
        hitSound.volume = 0.2;
        hitSound.play();
    }

}

export default Enemy;