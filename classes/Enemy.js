import { addToConsole } from '../main.js';
import Player from './Player.js';

class Enemy extends Player {
    constructor({id = 'enemy1', name = 'Enemy', y = 'random', x = 'random', consColor='brown', map, entities}) {
        super({ id, name, y, x, consColor, map, entities });
    };

}

export default Enemy;