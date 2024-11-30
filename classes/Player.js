import { addToConsole } from '../main.js';
import { gameOver } from '../main.js';
import { fightScreen } from '../main.js';

class Player {
    constructor({id = 'player1', name = 'Eidknab', y = 0, x = 0, consColor='royalblue', level = 1, xpMax = 250, xp = 0, hpMax = 100, hp = 100, gold = 20, map, entities}) {
        this.id = id
        this.name = name
        this.y = y
        this.x = x
        this.consColor = consColor
        this.level = level
        this.xpMax = 250 * level
        this.xp = xp
        this.hpMax = hpMax
        this.hp = hp
        this.gold = gold

        if (this.y === 'random' && this.x === 'random') {
            do {
                this.y = Math.floor(Math.random() * map.height)
                this.x = Math.floor(Math.random() * map.width)
            } while (map.terrainLayer[this.y][this.x] !== 'g' && map.terrainLayer[this.y][this.x] !== 'G')
        }

        map.entityLayer[this.y][this.x] = this.id

        entities[this.id] = this;
        addToConsole(`${this.id} ${this.x} ${this.y}`, consColor)
    }

    isDead() {
        if (this.hp >= 0) {
            return false
        }
        else {
            return true
        }
    }

    move(newY, newX, map, entities) {
        if (!this.isDead()) {
            if (newY >= 0 && newY < map.height && newX >= 0 && newX < map.width) {
                // Vérifier les collisions spécifiques et actions sur la nouvelle position
                const entityId = map.entityLayer[newY][newX];
    
                if (entityId === 'chest1') {
                    this.foundChest('smallChest');
                } else if (entityId === 'chest2') {
                    this.foundChest('bigChest');
                } else if (entityId === 'chest3') {
                    this.foundChest('trappedChest');
                } else if (
                    entityId === 't0' ||
                    entityId === 't1' ||
                    entityId === 't2' ||
                    entityId === 't3'
                ) {
                    addToConsole('Tree collision');
                    return;
                } else if (entityId !== '') {    
                    // Vérifier si une entité ennemie se trouve sur la position cible
                    if (entityId in entities) {
                        const enemy = entities[entityId]; // Accéder directement à l'instance de l'ennemi
    
                        // Vérification supplémentaire pour s'assurer que l'ennemi est valide
                        if (enemy) {
                            fightScreen(this, enemy); // Lancer le combat
                            return; // Arrêter le mouvement après avoir commencé le combat
                        } else {
                            console.error(`Enemy not found for ID: ${entityId}`);
                        }
                    } else {
                        console.error(`Entity ID ${entityId} not found in entities`);
                    }
                    return;
                }
    
                // Efface l'ancienne position
                map.entityLayer[this.y][this.x] = '';
    
                // Met à jour les coordonnées
                this.y = newY;
                this.x = newX;
    
                // Enregistre la nouvelle position
                map.entityLayer[this.y][this.x] = this.id;
            }
        }
    }
    
    foundChest(chestType) {
        let gold
        if (chestType === 'smallChest') {
            gold = this.randomizeValue(20)
            self.gold = self.gold + gold
            addToConsole(`${this.name} found a chest! ${gold}gp`)
        }
        else if (chestType === 'bigChest') {
            gold = this.randomizeValue(50)
            self.gold = self.gold + gold
            addToConsole(`${this.name} found a big chest! ${gold}gp`)
        }
        else if (chestType === 'trappedChest') {
            addToConsole(`${this.name} triggered a trap !`, 'brown')
            addToConsole(`*BOOM*`, 'red')
            const damage = this.randomizeValue(25)
            this.hp = (this.hp - damage)
            addToConsole(`${this.name} take ${damage}dmg`, 'orange')
            console.log(this.hp)
            if (this.isDead() === false) { addToConsole(`${this.hp}hp left.`) }
            else {        
                addToConsole(`${this.name} is dead...`)
                gameOver()
            }
        }
    }

    randomizeValue(randomValue) {
        return Math.floor(Math.random() * randomValue) + 1;
    }

    randomizeMinMax(minValue, maxValue) {
        return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
    }
}

export default Player;