import Map from './classes/Map.js'
import Player from './classes/Player.js'
import Enemy from './classes/Enemy.js'

const canvas = document.querySelector('.game')
const ctx = canvas.getContext('2d')
const tileSize = 32

// Collection d'entités: players, enemies
const entities = {}
const gameSounds = {}
const gameImages = {}


let map
let player1
let musicChoice

let gameState = 'map'
let direction = null
let keyPressed = false

export function addToConsole(message, color = 'green') {
    const consoleDiv = document.querySelector('.console')
    const newLine = document.createElement('p')
    
    newLine.textContent = message
    newLine.style.color = color

    consoleDiv.appendChild(newLine)
    consoleDiv.scrollTop = consoleDiv.scrollHeight
}

export function clearConsole() {
    const consoleDiv = document.querySelector('.console')
    consoleDiv.innerHTML = ''
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = src
        img.onload = () => resolve({ name: src.split('/').pop().split('.')[0], img })
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    });
}

async function loadAllImages() {
    addToConsole("Chargement des images...", 'gold')
    try {
        const images = await Promise.all([
            loadImage('assets/boss.png'),
            loadImage('assets/chest1.png'),
            loadImage('assets/chest2.png'),
            loadImage('assets/fightBackground.png'),
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
            gameImages[name] = img
            addToConsole(`assets/${name}.png`, 'gold')
        });
    } catch (error) {
        console.error(error)
    }
}

async function loadAllSounds() {
    try {
        const soundFiles = [
            'assets/sounds/chest.wav',
            'assets/sounds/dead.wav',
            'assets/sounds/hit1.wav',
            'assets/sounds/hit2.wav',
            'assets/sounds/move.wav',
            'assets/sounds/musicHerb.wav',
            'assets/sounds/musicFight1.wav',
            'assets/sounds/musicFight2.wav',
            'assets/sounds/jump.wav',
            'assets/sounds/select.wav',
            'assets/sounds/trap.wav',
            'assets/sounds/quit.wav',
            'assets/sounds/wall.wav',

        ];

        const soundPromises = soundFiles.map(filePath => {
            return new Promise((resolve, reject) => {
                const audio = new Audio(filePath);
                audio.onloadeddata = () => resolve({ name: filePath.split('/').pop().split('.')[0], audio });
                audio.onerror = () => reject(new Error(`Failed to load sound: ${filePath}`));
            });
        });

        const loadedSounds = await Promise.all(soundPromises);
        loadedSounds.forEach(({ name, audio }) => {
            gameSounds[name] = audio;
            addToConsole(`assets/${name}.wav`, 'pink')

        });
        addToConsole("Sounds loaded successfully", 'pink');
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
                level: '',
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

async function initializeGame() {
    clearConsole();
    addToConsole("Knight's Quest JS", 'white');
    await loadAllSounds();
    await loadAllImages();
    gameSounds['musicHerb'].volume = 0.15;
    gameSounds['musicHerb'].loop = true;
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

    player1 = new Player({ id: 'player1', name: 'Eidknab', y: 0, x: 0, level: 1, map, entities });

    requestAnimationFrame(gameLoop);
}

export function gameOver() {
    addToConsole('GAME OVER - new game in 10...', 'white')
    setTimeout(() => {restartGame()}, 10000);
}

function restartGame() {
    initializeGame();
}

function drawBar(character, type, color, x, y, width, height) {
    if (type === 'health') {
        const healthPercentage = character.hp / character.hpMax;

        // Dessiner le fond de la barre de vie (en gris)
        ctx.fillStyle = 'gray';
        ctx.fillRect(x, y, width, height);

        // Dessiner la partie représentant la vie actuelle (en couleur)
        ctx.fillStyle = color;
        if (character.hp > 0) {
            ctx.fillRect(x, y, width * healthPercentage, height);
        } else {
            ctx.fillRect(x, y, 0, height); // Barre vide si mort
        }

        // Ajouter un cadre autour de la barre de vie
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        // Ajouter le texte représentant la vie actuelle
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle'; // Aligner verticalement au milieu

        // Définir le texte en fonction de la vie
        let text;
        if (character.hp <= 0) {
            text = 'D E A D';
        } else {
            text = `${character.hp} / ${character.hpMax}`;
        }

        // Ajustement manuel pour assurer un meilleur centrage vertical
        ctx.fillText(text, x + width / 2, y + height / 2 + 2);
    }
    else if (type === 'experience') {
        const experiencePercentage = character.xp / character.xpMax;

        // Dessiner le fond de la barre d'expérience (en gris)
        ctx.fillStyle = 'gray';
        ctx.fillRect(x, y, width, height);

        // Dessiner la partie représentant l'expérience actuelle (en couleur)
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width * experiencePercentage, height);

        // Ajouter un cadre autour de la barre d'expérience
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        // Ajouter le texte représentant l'expérience actuelle
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle'; // Aligner verticalement au milieu
        const text = `${character.xp} / ${character.xpMax}`;

        // Ajustement manuel pour assurer un meilleur centrage vertical
        ctx.fillText(text, x + width / 2, y + height / 2 + 2);
    }  
}


function drawText(text, size, color, x, y) {
    // Définir le style du texte
    ctx.font = `bold ${size}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(text, x, y);
}

function fightMenu(player, enemy, musicChoice) {
    gameState = 'fightMenu';
    let selectedIndex = 0; // Index de l'option actuellement sélectionnée

    // Nettoyer la zone de menu avant de dessiner
    drawText(`[ATTACK]`, 20, selectedIndex === 0 ? 'white' : 'grey', 60, 410);
    drawText(`[RUN]`, 20, selectedIndex === 1 ? 'white' : 'grey', 60, 434);

    // Fonction interne pour gérer les actions du menu
    function handleMenuNavigation(event) {
        if (event.key === 'ArrowUp') {
            selectedIndex = (selectedIndex - 1 + 2) % 2; // Déplacer vers le haut (en cycle)
            redrawMenu(); // Redessiner le menu après modification
        } else if (event.key === 'ArrowDown') {
            selectedIndex = (selectedIndex + 1) % 2; // Déplacer vers le bas (en cycle)
            redrawMenu(); // Redessiner le menu après modification
        } else if (event.key === 'Enter') {
            // Action pour l'option sélectionnée
            if (selectedIndex === 0) {
                enemy.hp -= 25; // Dégâts infligés à l'ennemi
                addToConsole(`${player.name} attaque ${enemy.id}`);
                const hitSound = Math.random() < 0.5 ? gameSounds['hit1'] : gameSounds['hit2'];
                hitSound.volume = 0.2;
                hitSound.play();
                
                // Vérifier si l'ennemi est mort après l'attaque
                if (enemy.isDead()) {
                    addToConsole(`${enemy.id} est mort`, 'red');
                    musicChoice.volume = 0;
                    gameSounds['dead'].volume = 0.6;
                    gameSounds['dead'].play()
                    gameSounds['musicHerb'].volume = 0.15;
                    map.entityLayer[player.y][player.x] = '';
                    map.entityLayer[enemy.y][enemy.x] = player.id;
                    player.x = enemy.x
                    player.y = enemy.y
                    gameState = 'map';
                    window.removeEventListener('keydown', handleMenuNavigation); // Retirer l'écouteur du menu après l'action
                    requestAnimationFrame(gameLoop); // Revenir à l'écran de carte
                } else {
                    // L'ennemi est encore vivant, continuer le combat
                    window.removeEventListener('keydown', handleMenuNavigation); // Retirer l'écouteur du menu après l'action
                    fightScreen(player, enemy, { skipIntro: true });
                }
            } else if (selectedIndex === 1) {
                addToConsole(`${player.name} décide de fuir`);
                gameSounds['quit'].volume = 0.2;
                gameSounds['quit'].play()
                musicChoice.volume = 0;
                gameSounds['musicHerb'].currentTime = 0
                gameSounds['musicHerb'].volume = 0.15;
                gameState = 'map';
                window.removeEventListener('keydown', handleMenuNavigation); // Retirer l'écouteur du menu après l'action
                requestAnimationFrame(gameLoop); // Revenir à l'écran de carte
            }
        }
    }

    // Avant d'ajouter l'écouteur, s'assurer qu'il n'y en a pas déjà un
    window.removeEventListener('keydown', handleMenuNavigation);
    window.addEventListener('keydown', handleMenuNavigation);

    // Fonction pour redessiner le menu en fonction de la sélection actuelle
    function redrawMenu() {
        gameSounds['select'].volume = 0.6;
        gameSounds['select'].play()
        drawText(`[ATTACK]`, 20, selectedIndex === 0 ? 'white' : 'grey', 60, 410);
        drawText(`[RUN]`, 20, selectedIndex === 1 ? 'white' : 'grey', 60, 434);
    }
}

export function fightScreen(player, enemy, {skipIntro=false}) {
    if (skipIntro === false) {
        gameSounds['musicHerb'].volume = 0;
        musicChoice = Math.random() < 0.5 ? gameSounds['musicFight1'] : gameSounds['musicFight2'];
        musicChoice.volume = 0.2;
        musicChoice.loop = true;
        musicChoice.currentTime = 0;
        musicChoice.play();
        addToConsole(`Fight started between:`)
        addToConsole(`${player.name} level:${player.level} xp:${player.xp}/${player.xpMax} hp:${player.hp}/${player.hpMax} gp:${player.gold}`)
        addToConsole(`${enemy.id} ${enemy.name} level:${enemy.level} xp:${enemy.xp}/${enemy.xpMax} hp:${enemy.hp}/${enemy.hpMax} gp:${enemy.gold}`)
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(window.gameImages['fightBackground'], 0, 0, canvas.width, canvas.height)
    ctx.drawImage(window.gameImages['player'], 32, 280, 64, 64);
    ctx.save();
    ctx.scale(-1, 1);
    if (enemy.id.includes('boss')) {ctx.drawImage(window.gameImages['boss'], -432 - 64, 280, 64, 64);}
    else if (enemy.id.includes('mummy')) {ctx.drawImage(window.gameImages['mummy'], -432 - 64, 280, 64, 64);}
    else if (enemy.id.includes('skeletonMage')) {ctx.drawImage(window.gameImages['skeletonMage'], -432 - 64, 280, 64, 64);}
    else if (enemy.id.includes('skeleton')) {ctx.drawImage(window.gameImages['skeleton'], -432 - 64, 280, 64, 64);}
    else if (enemy.id.includes('wolf')) {ctx.drawImage(window.gameImages['wolf'], -432 - 64, 280, 64, 64);}
    else if (enemy.id.includes('zombieBig')) {ctx.drawImage(window.gameImages['zombieBig'], -432 - 64, 280, 64, 64);}
    else if (enemy.id.includes('zombie')) {ctx.drawImage(window.gameImages['zombie'], -432 - 64, 280, 64, 64);}
    ctx.restore();
    drawBar(player, 'health', 'green', 8, 8, 128, 20)
    drawBar(player, 'experience', 'gold', 8, 36, 128, 20)
    drawText(`${player.name}`, 20, 'blue', 64, 264)
    drawBar(enemy, 'health', 'red', 376, 8, 128, 20)
    drawBar(enemy, 'experience', 'gold', 376, 36, 128, 20)
    drawText(`${enemy.id}`, 20, 'red', 460, 264)
    fightMenu(player, enemy, musicChoice)
}

function gameLoop() {
    if (gameState === 'map') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        map.displayTerrain(ctx, tileSize);
        map.displayEntities(ctx, tileSize);
    
        if (direction) {
            const { y, x } = player1;
            if (direction === 'up') player1.move(y - 1, x, map, entities, gameSounds);
            else if (direction === 'down') player1.move(y + 1, x, map, entities, gameSounds);
            else if (direction === 'left') player1.move(y, x - 1, map, entities, gameSounds);
            else if (direction === 'right') player1.move(y, x + 1, map, entities, gameSounds);
    
            direction = null;
        }
    
        requestAnimationFrame(gameLoop); // Loop de 60hz basé sur le taux de l'écran
    }
    }

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
        gameSounds['musicHerb'].play();
    }
});

window.addEventListener('keyup', () => {
    direction = null;
    keyPressed = false;
});