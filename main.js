import Map from './classes/Map.js';
import Player from './classes/Player.js'
import Enemy from './classes/Enemy.js'

const canvas = document.querySelector('.game');
const ctx = canvas.getContext('2d');
const tileSize = 24;

// collection d'entités: players, enemies
const entities = {}
const gameImages = {};

export function addToConsole(message, color = 'green') {
    const consoleDiv = document.querySelector('.console');
    const newLine = document.createElement('p');
    
    newLine.textContent = message;
    newLine.style.color = color; // Définir la couleur du texte

    consoleDiv.appendChild(newLine);

    // Scrolling automatique
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

export function clearConsole() {
    const consoleDiv = document.querySelector('.console');
    consoleDiv.innerHTML = ''; // Supprime tout le contenu HTML
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve({ name: src.split('/').pop().split('.')[0], img });
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    });
}

async function loadAllImages() {
    addToConsole("Chargement des images...", 'gold')
    try {
        const images = await Promise.all([
            loadImage('assets/boss.png'),
            loadImage('assets/chest1.png'),
            loadImage('assets/chest2.png'),
            loadImage('assets/player.png'),
            loadImage('assets/skeletonMage.png'),
            loadImage('assets/skeleton.png'),
            loadImage('assets/treeDustSS.png'),
            loadImage('assets/treeHerbSS.png'),
            loadImage('assets/wolf.png'),
            loadImage('assets/zombie.png')
        ]);

        images.forEach(({ name, img }) => {
            gameImages[name] = img;
        addToConsole(`assets/${name}.png`, 'gold')
        });
    } catch (error) {
        console.error(error);
    }
}

function generateMonsters({ bossCount = 0, skeletonCount = 0, skeletonMageCount = 0, wolfCount = 0, zombieCount = 0 }, map, entities) {
    let instanceCount = Object.keys(entities).length; // Compteur basé sur le nombre d'entités existantes

    const createMonster = (count, type) => {
        for (let i = 1; i <= count; i++) {
            // Incrémentation de l'ID et du nom de l'instance
            const id = `${type}${i + Object.keys(entities).filter(key => key.startsWith(type)).length}`;
            const instanceName = `enemy${++instanceCount}`;

            // Création du monstre
            const monster = new Enemy({
                id,
                name: '',
                y: 'random',
                x: 'random',
                map,
                entities,
            });

            // Stockage dans entities
            entities[instanceName] = { instance: monster, id };
        }
    };

    createMonster(bossCount, 'boss');
    createMonster(skeletonCount, 'skeleton');
    createMonster(skeletonMageCount, 'skeletonMage');
    createMonster(wolfCount, 'wolf');
    createMonster(zombieCount, 'zombie');
}

// affiche la map
(async function initializeGame() {
    addToConsole("Knight's Quest JS", 'white')

    await loadAllImages();
    window.gameImages = gameImages; // Stocker dans l'objet global

    // Génération de la carte, du joueur, et des ennemis
    const map = new Map({width: 24, height: 24, biome: 'random', name: 'The Forest'}, addToConsole);

    // génération d'éléments sur la map
    map.generateStuff({
        stumpTreeCount: 8, smallTreeCount: 16, mediumTreeCount: 24, bigTreeCount: 8, 
        smallChestCount: 10, bigChestCount: 6,
    })

    const player1 = new Player({id: 'player1', name: 'Eidknab', y: 0, x: 0, map, entities});
    generateMonsters(
        { bossCount: 1, skeletonCount: 10, skeletonMageCount: 6, wolfCount: 10, zombieCount: 8 },
        map,
        entities
    )
    // const enemy1 = new Enemy({id: 'zombie1', name: '', y: 'random', x: 'random', map, entities});

    // Afficher la map
    map.displayTerrain(ctx, tileSize);
    map.displayEntities(ctx, tileSize);
})();



