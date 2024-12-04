import { addToConsole } from '../main.js';
import { gameOver } from '../main.js';
import { fightScreen } from '../main.js';

class Player {
    constructor({id = 'player1', name = 'Eidknab', y = 0, x = 0, consColor='royalblue', level = 1, strengh = 20, dexterity = 20, xpMax = 250, xp = 0, hpMax = 100, hp = 100, potion = 2, gold = 20, map, entities}) {
        this.id = id
        this.name = name
        this.y = y
        this.x = x
        this.consColor = consColor
        this.level = level
        this.strengh = strengh
        this.dexterity = dexterity
        this.xpMax = 250 * level
        this.xp = xp
        this.hpMax = hpMax
        this.hp = hp
        this.potion = potion
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

    usePotion() {
        if (this.hp === this.hpMax) {
            addToConsole(`Santé déjà au maximum}`, 'lime')
        }
        else if (this.potion > 0) {
            this.potion -= 1
            const randomFactor = Math.random() * 0.4 + 0.8;
            const lifeRestore = Math.floor((this.hpMax * 0.50)*randomFactor)
            this.hp = this.hp + lifeRestore
            if (this.hp > this.hpMax) {this.hp = this.hpMax}
            addToConsole(`La potion restaure: ${lifeRestore}`, 'lime')
        }
        addToConsole(`Potions restantes: ${this.potion}`)
    }

    levelUp(gameSounds) {
        if (this.xp >= this.xpMax) {
            this.level += 1
            this.hpMax *= 1.2
            this.hpMax = Math.floor(this.hpMax)
            this.hp = this.hpMax
            this.xpMax *= 2
            this.xp = 0
            this.strengh += 1
            this.dexterity += 1
            addToConsole(`DING! Level:${this.level} Life:${this.hpMax} Strengh:${this.strengh} Dexterity:${this.strengh}`, 'blueViolet')
            gameSounds['levelUp'].volume = 0.03;
            gameSounds['levelUp'].loop = false;
            gameSounds['levelUp'].currentTime = 0;
            gameSounds['levelUp'].play();
        }
    }

    isDead() {
        if (this.hp > 0) {
            return false;
        } else {
            return true;
        }
    }

    attack(target, gameSounds) {
        const randomFactor = Math.random() * 0.4 + 0.8; // Facteur de dégâts aléatoire entre 0.8 et 1.2
        let damage = Math.round(this.strengh * randomFactor); // Calcul initial des dégâts
        const critChance = this.dexterity * 0.005; // 0.5% de chance par point de dextérité
    
        // Vérifie si un coup critique se déclenche
        if (Math.random() < critChance) {
            damage = Math.round(damage * 1.5); // Augmente les dégâts de 50%
            addToConsole(`${this.name} inflige ${damage} dégâts à ${target.id} (critique)`, 'steelBlue');
        } else {
            addToConsole(`${this.name} inflige ${damage} dégâts à ${target.id}`, this.consColor);
        }
    
        target.hp -= damage; // Applique les dégâts à la cible
    
        // Choisir et jouer un son de frappe
        const hitSound = Math.random() < 0.5 ? gameSounds['hit1'] : gameSounds['hit2'];
        hitSound.volume = 0.2;
        hitSound.play();
    }

    move(newY, newX, map, entities, gameSounds) {
        if (!this.isDead()) {
            if (newY >= 0 && newY < map.height && newX >= 0 && newX < map.width) {
                // Vérifier si le joueur rencontre t0 pour tenter de sauter par-dessus
                let entityId = map.entityLayer[newY][newX]
    
                if (entityId === 't0' || entityId === 'bridge') {
                    // Tenter de sauter par-dessus la case t0
                    const jumpY = newY + (newY - this.y)
                    const jumpX = newX + (newX - this.x)
    
                    if (jumpY >= 0 && jumpY < map.height && jumpX >= 0 && jumpX < map.width) {
                        // Mise à jour de newY et newX pour continuer avec la position après le saut
                        newY = jumpY
                        newX = jumpX
                        if (entityId === 't0') {
                            gameSounds['jump'].volume = 0.2;
                            gameSounds['jump'].play()
                        }
                        else {
                            gameSounds['bridge'].volume = 0.8;
                            gameSounds['bridge'].play();
                        }
                    } 
                    else {
                        // Hors des limites après le saut
                        addToConsole('Cannot jump outside the map boundaries')
                        return;
                    }
                }
    
                // Vérifier les collisions spécifiques et actions sur la nouvelle position (après le saut potentiel)
                entityId = map.entityLayer[newY][newX]
    
                if (entityId === 'chest1') {
                    this.foundChest('smallChest')
                    gameSounds['chest'].volume = 0.2;
                    gameSounds['chest'].play()
                } 
                else if (entityId === 'chest2') {
                    this.foundChest('bigChest')
                    gameSounds['chest'].volume = 0.2;
                    gameSounds['chest'].play()
                } 
                else if (entityId === 'chest3') {
                    gameSounds['trap'].volume = 0.2;
                    gameSounds['trap'].play()
                    this.foundChest('trappedChest')
                } 
                else if (['t1', 't2', 't3'].includes(entityId)) {
                    gameSounds['wall'].volume = 0.2;
                    gameSounds['wall'].play();
                    addToConsole('Tree collision');
                    return;
                }
                else if (entityId === 'water') {
                    gameSounds['water'].volume = 0.2;
                    gameSounds['water'].play();
                    addToConsole('water collision');
                    return;
                }
                else if (entityId === 'lava') {
                    gameSounds['water'].volume = 0.2;
                    gameSounds['water'].play();
                    const hpLost = this.randomizeValue(10)
                    this.hp -= hpLost
                    if (this.isDead() === false) { addToConsole(`${this.name} is burning in lava and lost ${hpLost}hp`, 'orange')}
                    else {        
                        addToConsole(`${this.name} is dead...`, this.consColor)
                        gameOver()
                    }
                    return;
                }
                else if (entityId !== '') {    
                    // Vérifier si une entité ennemie se trouve sur la position cible
                    if (entityId in entities) {
                        const enemy = entities[entityId];
                        fightScreen(this, enemy, { skipIntro: false });
                        // Vérifier si l'ennemi est toujours vivant après le combat
                        if (!enemy.isDead()) {
                            return;  // Stopper si l'ennemi est encore en vie
                        }
                    }
                }
                // Efface l'ancienne position
                map.entityLayer[this.y][this.x] = ''
    
                // Met à jour les coordonnées
                this.y = newY
                this.x = newX
    
                // Enregistre la nouvelle position
                map.entityLayer[this.y][this.x] = this.id
                gameSounds['move'].volume = 0.1;
                gameSounds['move'].play()
            }
        }
    }
    
    
    foundChest(chestType) {
        let gold
        let pot
        if (chestType === 'smallChest') {
            gold = this.randomizeValue(20)
            this.gold = this.gold + gold
            pot = this.randomizeValue(2) - 1
            this.potion += pot
            if (pot > 0) {addToConsole(`${this.name} found a chest! ${pot}potion, ${gold}gp`, 'gold')}
            else { addToConsole(`${this.name} found a chest! ${gold}gp`, 'gold') }
            addToConsole(`ìnventory: ${this.potion}potion(s), ${this.gold}gp`)
        }
        else if (chestType === 'bigChest') {
            gold = this.randomizeValue(50)
            this.gold = this.gold + gold
            pot = this.randomizeValue(4) - 1
            this.potion += pot
            if (pot > 0) {addToConsole(`${this.name} found a big chest! ${pot}potion(s), ${gold}gp`, 'gold')}
            else { addToConsole(`${this.name} found a big chest! ${gold}gp`, 'gold') }
            addToConsole(`ìnventory: ${this.potion}potion(s), ${this.gold}gp`)
        }
        else if (chestType === 'trappedChest') {
            addToConsole(`${this.name} triggered a trap !`, 'brown')
            addToConsole(`*BOOM*`, 'red')
            const damage = this.randomizeValue(25)
            this.hp = (this.hp - damage)
            addToConsole(`${this.name} take ${damage}dmg`, 'orange')
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
        return Math.random() * (maxValue - minValue + 1) + minValue
    }
}

export default Player;