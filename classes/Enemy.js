import { addToConsole } from '../main.js';
import Player from './Player.js';

class Enemy extends Player {
    constructor({id = 'enemy1', name = 'Enemy', y = 'random', x = 'random', consColor='brown', gold = 0, map, entities}) {
        super({ id, name, y, x, consColor, gold, map, entities });
    };

}

export default Enemy;