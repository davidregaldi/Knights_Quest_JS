import Map from './classes/Map.js';
import Player from './classes/Player.js';
import Enemy from './classes/Enemy.js';

const canvas = document.querySelector('.game');
const ctx = canvas.getContext('2d');
const tileSize = 32;

// Collection d'entités: players, enemies
const entities = {};
const gameImages = {};

let map;
let player1;

let direction = null;
let keyPressed = false;

export function addToConsole(message, color = 'green') {
    const consoleDiv = document.querySelector('.console');
    const newLine = document.createElement('p');
    
    newLine.textContent = message;
    newLine.style.color = color;

    consoleDiv.appendChild(newLine);
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

export function clearConsole() {
    const consoleDiv = document.querySelector('.console');
    consoleDiv.innerHTML = '';
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
    addToConsole("Chargement des images...", 'gold');
    try {
        const images = await Promise.all([
            loadImage('assets/boss.png'),
            loadImage('assets/chest1.png'),
            loadImage('assets/chest2.png'),
            loadImage('assets/mummy.png'),
            loadImage('assets/player.png'),
            loadImage('assets/skeletonMage.png'),
            loadImage('assets/skeleton.png'),
            loadImage('assets/treeDustSS.png'),
            loadImage('assets/treeHerbSS.png'),
            loadImage('assets/treeSnowSS.png'),
            loadImage('assets/treeMagmaSS.png'),
            loadImage('assets/wolf.png'),
            loadImage('assets/zombie.png'),
            loadImage('assets/zombieBig.png')
        ]);

        images.forEach(({ name, img }) => {
            gameImages[name] = img;
            addToConsole(`assets/${name}.png`, 'gold');
        });
    } catch (error) {
        console.error(error);
    }
}

function generateMonsters({ bossCount = 0, mummyCount = 0, skeletonCount = 0, skeletonMageCount = 0, wolfCount = 0, zombieCount = 0, zombieBigCount = 0 }, map, entities) {
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
    createMonster(mummyCount, 'mummy');
    createMonster(skeletonCount, 'skeleton');
    createMonster(skeletonMageCount, 'skeletonMage');
    createMonster(wolfCount, 'wolf');
    createMonster(zombieCount, 'zombie');
    createMonster(zombieBigCount, 'zombieBig');
}

export async function initializeGame() {
    clearConsole();
    addToConsole("Knight's Quest JS", 'white');
    await loadAllImages();
    window.gameImages = gameImages;

    map = new Map({ width: 16, height: 16, biome: 'random', name: 'The Forest' });

    map.generateStuff({
        stumpTreeCount: 8, smallTreeCount: 16, mediumTreeCount: 24, bigTreeCount: 8, 
        smallChestCount: 10, bigChestCount: 6, trappedChestCount: 4,
    });

    generateMonsters(
        { bossCount: 1, mummyCount: 4, skeletonCount: 10, skeletonMageCount: 6, wolfCount: 10, zombieCount: 8, zombieBigCount: 4 },
        map,
        entities
    );

    player1 = new Player({ id: 'player1', name: 'Eidknab', y: 0, x: 0, map, entities });

    requestAnimationFrame(gameLoop);
}

export function gameOver() {
    addToConsole('GAME OVER - new game in 10...', 'white')
    setTimeout(() => {restartGame()}, 10000);
}

function restartGame() {
    initializeGame();
}

export function fightScreen(player, enemy) {
    addToConsole(`Fight between ${player.name} and ${enemy.id}`)
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    map.displayTerrain(ctx, tileSize);
    map.displayEntities(ctx, tileSize);

    if (direction) {
        const { y, x } = player1;
        if (direction === 'up') player1.move(y - 1, x, map, entities);
        else if (direction === 'down') player1.move(y + 1, x, map, entities);
        else if (direction === 'left') player1.move(y, x - 1, map, entities);
        else if (direction === 'right') player1.move(y, x + 1, map, entities);

        direction = null;
    }

    requestAnimationFrame(gameLoop);
}

// Appel initial une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    initializeGame(); // Appeler le jeu après que le DOM soit prêt
});

// Gestion des événements pour les déplacements
window.addEventListener('keydown', (event) => {
    if (!keyPressed) {
        if (event.key === 'ArrowUp') direction = 'up';
        else if (event.key === 'ArrowDown') direction = 'down';
        else if (event.key === 'ArrowLeft') direction = 'left';
        else if (event.key === 'ArrowRight') direction = 'right';

        keyPressed = true;
    }
});

window.addEventListener('keyup', () => {
    direction = null;
    keyPressed = false;
});