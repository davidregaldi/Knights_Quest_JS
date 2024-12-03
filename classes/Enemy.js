import { addToConsole } from '../main.js'
import Player from './Player.js'

class Enemy extends Player {
    constructor({id = 'enemy1', name = 'Enemy', y = 'random', x = 'random', consColor='brown', level = '', strengh = 15, xpMax = 100, xp = 0, hpMax = 100, hp = 100, potion = 0, gold = 5, map, entities}) {
        super({ id, name, y, x, consColor,level, strengh, xpMax, xp, hpMax, hp, gold, map, entities })
        
        if (this.level === '') {
            this.level = Math.floor(this.randomizeMinMax(1,3))
            if (this.level <= 0) {
                this.level = 1
            }
        }
        this.xpMax = Math.floor(250 * this.level)
        this.xp = Math.floor(this.randomizeValue(this.xpMax) / 5)
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
        const randomFactor = Math.random() * 0.4 + 0.8;
        const damage = Math.round(this.strengh * randomFactor); // Calculer le dégât en arrondissant à l'entier le plus proche
        target.hp -= damage; // Appliquer les dégâts à la cible
        const hitSound = Math.random() < 0.5 ? gameSounds['hit1'] : gameSounds['hit2'];
        hitSound.volume = 0.2;
        hitSound.play();
        addToConsole(`${this.name} inflige ${damage} points de dégâts à ${target.name}`, this.consColor);
    }

}

export default Enemy;