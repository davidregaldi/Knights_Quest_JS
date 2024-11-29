import { addToConsole } from '../main.js';

class Player {
    constructor({id = 'player1', name = 'Eidknab', y = 0, x = 0, consColor='royalblue', map, entities}) {
        this.id = id
        this.name = name
        this.y = y
        this.x = x
        this.consColor = consColor
        
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

    move(newY, newX, map) {
        // Vérifie les limites de la carte
        if (newY >= 0 && newY < map.height && newX >= 0 && newX < map.width) {
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

export default Player;