import { addToConsole } from '../main.js'
import Player from './Player.js'

class Enemy extends Player {
    constructor({id = 'enemy1', name = 'Enemy', y = 'random', x = 'random', consColor='brown', level = '', xpMax = 100, xp = 0, hpMax = 100, hp = 100, gold = 5, map, entities}) {
        super({ id, name, y, x, consColor,level, xpMax, xp, hpMax, hp, gold, map, entities })
        
        if (this.level === '') {
            this.level = this.randomizeMinMax(1,3)
            if (this.level <= 0) {
                this.level = 1
            }
        }
        this.xpMax = Math.floor(250 * this.level)
        this.xp = Math.floor(this.randomizeValue(this.xpMax) / 5)
        this.gold = Math.floor(this.randomizeValue(gold) * this.level)
    };

}

export default Enemy;