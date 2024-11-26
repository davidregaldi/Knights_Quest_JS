const canvas = document.querySelector('.game');
const ctx = canvas.getContext('2d');

// Fonction pour ajouter du texte dans la console
function addToConsole(message) {
    const consoleDiv = document.querySelector('.console');
    const newLine = document.createElement('p');
    newLine.textContent = message;
    consoleDiv.appendChild(newLine);

    // Scrolling automatique
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function clearConsole() {
    const consoleDiv = document.querySelector('.console');
    consoleDiv.innerHTML = ''; // Supprime tout le contenu HTML
}

const playerImage = new Image();
const chest1Image = new Image();
const chest2Image = new Image();
const treeSSImage = new Image();
const cactusSSImage = new Image();
const zombieImage = new Image();
const skeletonImage = new Image();
const wolfImage = new Image();
const bridgeImage = new Image();

playerImage.src = 'assets/player.png';
chest1Image.src = 'assets/chest1.png';
chest2Image.src = 'assets/chest2.png';
treeSSImage.src = 'assets/tree_ss.png';
cactusSSImage.src = 'assets/cactus_ss.png';
zombieImage.src = 'assets/zombie.png';
skeletonImage.src = 'assets/skeleton.png';
wolfImage.src = 'assets/wolf.png';
bridgeImage.src = 'assets/bridge.png';

const blockSize = 32;

const colors = {
    "h": "#c2d757",  // Grass
    "H": "#b2d254", // Grass2
    "d": "#F8ECC9",  // Dust
    "D": "#FCF7E9", // Dust2
    "t0": "#c2d757", // Tree stump
    "t1": "#c2d757", // Tree 1
    "t2": "#c2d757", // Tree 2
    "t3": "#c2d757", // Tree 3
    "p": "#c2d757",  // Player
    "e": "red", // Enemy
    "b": "blueviolet", // Boss
    "w": "#4ebcb9", // Water
    "b": "sienna", // Bridge
    "$": "gold", // Chest1
    "€": "silver", // Chest2
    "~": "orange", // Lava
    "Z": "red", // Zombie
    "S": "red", // Skeleton
    "W": "red", // Wolf
    "=": "peru" // Bridge
};

class Player {
    constructor (name, level, xPos, yPos, hpMax, hp, mpMax, mp, xpMax, xp, addToConsole) {
        this.name = name
        this.level = level
        this.xPos = xPos
        this.yPos = yPos
        this.hpMax = hpMax
        this.hp = hp
        this.mpMax = mpMax
        this.mp = mp
        this.xpMax = xpMax
        this.xp = xp
        this.addToConsole = addToConsole
        addToConsole(`Création du personnage:`)
        addToConsole(`Name: ${name}`)
        addToConsole(`Level: ${level}`)
        addToConsole(`Experience: ${xp}/${xpMax}`)
        addToConsole(`Life: ${hp}/${hpMax}`)
        addToConsole(`Mana: ${mp}/${mpMax}`)
        addToConsole(`xPos: ${xPos} yPos: ${yPos}`)
        addToConsole(`-----------------------------------------------------`)

    }

    draw(ctx, blockSize) {
        let bgColor = '';
        if (biomeType === 'herb') {bgColor = colors['h']}
        else if (biomeType === 'dust') {bgColor = colors['d']}
        ctx.fillStyle = bgColor
        ctx.fillRect(this.xPos * blockSize, this.yPos * blockSize, blockSize, blockSize);
        ctx.drawImage(playerImage, this.xPos * blockSize, this.yPos * blockSize, blockSize, blockSize);
        
    }
}

function mapGeneration({
    width=32, height=32, 
    biomeType='rand', riverType='water',
    trees0Count=0, trees1Count=0, trees2Count=0, trees3Count=0, 
    chest1Count=0, chest2Count=0,
    zombieCount=0, skeletonCount=0, wolfCount=0
}) {
    let map = []
    if (biomeType === 'rand') {
        biomeType = (Math.random() < 0.5 ? 'herb' : 'dust')
    }
    if (biomeType === 'herb') {
        for (let y = 0; y < height; y++) {
            map[y] = []
            for (let x = 0; x < width; x++) {
                map[y][x] = Math.random() < 0.34 ? "h" : "H"
            }
        }
    }
    else if (biomeType === 'dust') {
        for (let y = 0; y < height; y++) {
            map[y] = []
            for (let x = 0; x < width; x++) {
                map[y][x] = Math.random() < 0.34 ? "d" : "D"
            }
        }
    }
    
    if (riverType !== 'no') {
        const riverTile = riverType === 'water' ? "w" : "~";
        const riverRowStart = Math.floor(height / 2); // Position initiale de la rivière
        let currentRow = riverRowStart;
    
        // Variables pour définir deux ponts avec des chances aléatoires
        const bridgeChance = 0.05; // 5% de chance de placer un pont
        let bridgeX1 = Math.floor(Math.random() * width); // Première position du pont
        let bridgeX2 = Math.floor(Math.random() * width); // Deuxième position du pont
    
        // Assurer que les deux ponts ne se superposent pas
        while (bridgeX1 === bridgeX2) {
            bridgeX2 = Math.floor(Math.random() * width); // Si les ponts se superposent, générer une nouvelle position pour le second
        }
    
        for (let x = 0; x < width; x++) {
            // Si on est à l'emplacement du premier pont, placer le pont (une seule case)
            if (x === bridgeX1) {
                map[currentRow][x] = "="; // Le pont est représenté par "="
            } 
            // Si on est à l'emplacement du deuxième pont, placer le pont (une seule case)
            else if (x === bridgeX2) {
                map[currentRow][x] = "="; // Le pont est représenté par "="
            }
            else {
                map[currentRow][x] = riverTile; // La rivière est représentée par "~" ou "w"
            }
    
            // Changer la direction de la rivière
            const direction = Math.random();
            if (direction < 0.4 && currentRow > 0) {
                // Monter
                currentRow--;
            } else if (direction > 0.6 && currentRow < height - 1) {
                // Descendre
                currentRow++;
            }
            // Sinon, rester sur la même ligne
        }
    }

    for (let i = 0; i < trees0Count; i++) {
        let treePlaced = false;
        while (!treePlaced) {
            let rdmX = Math.floor(Math.random() * width);
            let rdmY = Math.floor(Math.random() * height);
            if ((map[rdmX][rdmY] === "h") || (map[rdmX][rdmY] === "H") || (map[rdmX][rdmY] === "d") || (map[rdmX][rdmY] === "D")) {
                map[rdmX][rdmY] = "t0";
                treePlaced = true;
            }
        }
    }

    for (let i = 0; i < trees1Count; i++) {
        let treePlaced = false;
        while (!treePlaced) {
            let rdmX = Math.floor(Math.random() * width);
            let rdmY = Math.floor(Math.random() * height);
            if ((map[rdmX][rdmY] === "h") || (map[rdmX][rdmY] === "H") || (map[rdmX][rdmY] === "d") || (map[rdmX][rdmY] === "D")) {
                map[rdmX][rdmY] = "t1";
                treePlaced = true;
            }
        }
    }

    for (let i = 0; i < trees2Count; i++) {
        let treePlaced = false;
        while (!treePlaced) {
            let rdmX = Math.floor(Math.random() * width);
            let rdmY = Math.floor(Math.random() * height);
            if ((map[rdmX][rdmY] === "h") || (map[rdmX][rdmY] === "H") || (map[rdmX][rdmY] === "d") || (map[rdmX][rdmY] === "D")) {
                map[rdmX][rdmY] = "t2";
                treePlaced = true;
            }
        }
    }

    for (let i = 0; i < trees3Count; i++) {
        let treePlaced = false;
        while (!treePlaced) {
            let rdmX = Math.floor(Math.random() * width);
            let rdmY = Math.floor(Math.random() * height);
            if ((map[rdmX][rdmY] === "h") || (map[rdmX][rdmY] === "H") || (map[rdmX][rdmY] === "d") || (map[rdmX][rdmY] === "D")) {
                map[rdmX][rdmY] = "t3";
                treePlaced = true;
            }
        }
    }

    for (let i = 0; i < chest1Count; i++) {
        let chest1Placed = false;
        while (!chest1Placed) {
            let rdmX = Math.floor(Math.random() * width);
            let rdmY = Math.floor(Math.random() * height);
            if ((map[rdmX][rdmY] === "h") || (map[rdmX][rdmY] === "H") || (map[rdmX][rdmY] === "d") || (map[rdmX][rdmY] === "D")) {
                map[rdmX][rdmY] = "$";
                chest1Placed = true;
            }
        }
    }

    for (let i = 0; i < chest2Count; i++) {
        let chest2Placed = false;
        while (!chest2Placed) {
            let rdmX = Math.floor(Math.random() * width);
            let rdmY = Math.floor(Math.random() * height);
            if ((map[rdmX][rdmY] === "h") || (map[rdmX][rdmY] === "H") || (map[rdmX][rdmY] === "d") || (map[rdmX][rdmY] === "D")) {
                map[rdmX][rdmY] = "€";
                chest2Placed = true;
            }
        }
    }

    for (let i = 0; i < zombieCount; i++) {
        let zombiePlaced = false;
        while (!zombiePlaced) {
            let rdmX = Math.floor(Math.random() * width);
            let rdmY = Math.floor(Math.random() * height);
            if ((map[rdmX][rdmY] === "h") || (map[rdmX][rdmY] === "H") || (map[rdmX][rdmY] === "d") || (map[rdmX][rdmY] === "D")) {
                map[rdmX][rdmY] = "Z";
                zombiePlaced = true;
            }
        }
    }

    for (let i = 0; i < skeletonCount; i++) {
        let skeletonPlaced = false;
        while (!skeletonPlaced) {
            let rdmX = Math.floor(Math.random() * width);
            let rdmY = Math.floor(Math.random() * height);
            if ((map[rdmX][rdmY] === "h") || (map[rdmX][rdmY] === "H") || (map[rdmX][rdmY] === "d") || (map[rdmX][rdmY] === "D")) {
                map[rdmX][rdmY] = "S";
                skeletonPlaced = true;
            }
        }
    }
    for (let i = 0; i < wolfCount; i++) {
        let wolfPlaced = false;
        while (!wolfPlaced) {
            let rdmX = Math.floor(Math.random() * width);
            let rdmY = Math.floor(Math.random() * height);
            if ((map[rdmX][rdmY] === "h") || (map[rdmX][rdmY] === "H") || (map[rdmX][rdmY] === "d") || (map[rdmX][rdmY] === "D")) {
                map[rdmX][rdmY] = "W";
                wolfPlaced = true;
            }
        }
    }


    map[0][0] = "p"
    addToConsole(`Map generation:`)
    addToConsole(`Type:${biomeType} River: ${riverType}`)
    addToConsole(`Trees: ${trees0Count + trees1Count + trees2Count + trees3Count} Chest: ${chest1Count + chest2Count} Monsters: ${zombieCount + skeletonCount + wolfCount}`)
    addToConsole(`-----------------------------------------------------`)
    return {map, biomeType}
}

addToConsole(`-----------------------------------------------------`)

const { map, biomeType } = mapGeneration({
    width: 16, height: 16, 
    biomeType: 'rand', // herb, dust
    riverType: 'water', // water, lava, ''
    trees0Count: 8, trees1Count: 24, trees2Count: 12, trees3Count: 8,  // 0: stump 1,2,3: trees type
    chest1Count: 4, chest2Count: 12, // 1: big chest 2: small chest
    zombieCount: 4, skeletonCount: 4, wolfCount: 4
})

const player = new Player('Eidknab', 1, 0, 0, 100, 100, 50, 50, 100, 0, addToConsole);


function drawMap() {
    let bgColor = '';
    if (biomeType === 'herb') {bgColor = colors['h']}
    else if (biomeType === 'dust') {bgColor = colors['d']}
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            const tile = map[row][col];

            // Dessiner le joueur (image)
            if ((tile === "h") || (tile === "H") || (tile === "d") || (tile === "D")) {
                ctx.fillStyle = colors[tile]
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
            }
            else if ((tile === "t0") || tile === "t1" || tile === "t2" || tile === "t3") {
                let xvalue = 0
                if (tile === "t0") {
                    xvalue = 0
                } else if (tile === "t1") {
                    xvalue = 1
                } else if (tile === "t2") {
                    xvalue = 2
                } else if (tile === "t3") {
                    xvalue = 3
                }
                ctx.fillStyle = bgColor
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                if (biomeType === 'herb') {
                    ctx.drawImage(
                        treeSSImage, 
                        xvalue * 16, 0 * 16, // Coordonnées du deuxième arbre dans la sprite sheet
                        16, 16,         // Taille du sprite (arbre)
                        col * blockSize, row * blockSize,  // Position sur le canevas
                        blockSize, blockSize          // Taille sur le canevas
                )}
                else if (biomeType === 'dust') {
                    ctx.drawImage(
                        cactusSSImage, 
                        xvalue * 16, 0 * 16, // Coordonnées du deuxième arbre dans la sprite sheet
                        16, 16,         // Taille du sprite (arbre)
                        col * blockSize, row * blockSize,  // Position sur le canevas
                        blockSize, blockSize          // Taille sur le canevas
                )}
            }
            else if (tile === "$") {
                ctx.fillStyle = bgColor
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                ctx.drawImage(chest1Image, col * blockSize, row * blockSize, blockSize, blockSize)}
            else if (tile === "€") {
                ctx.fillStyle = bgColor
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                ctx.drawImage(chest2Image, col * blockSize, row * blockSize, blockSize, blockSize)}
            else if (tile === "Z") {
                ctx.fillStyle = bgColor
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                ctx.drawImage(zombieImage, col * blockSize, row * blockSize, blockSize, blockSize)}
            else if (tile === "S") {
                ctx.fillStyle = bgColor
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                ctx.drawImage(skeletonImage, col * blockSize, row * blockSize, blockSize, blockSize)}
            else if (tile === "W") {
                ctx.fillStyle = bgColor
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                ctx.drawImage(wolfImage, col * blockSize, row * blockSize, blockSize, blockSize)}
            else if (tile === "=") {
                ctx.fillStyle = bgColor
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                ctx.drawImage(bridgeImage, col * blockSize, row * blockSize, blockSize, blockSize)}
            else if (tile === "~") {
                ctx.fillStyle = `rgba(255, 165, 0, ${opacity})`;
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
            }
            else if (tile === "w") {
            ctx.fillStyle = `rgba(135, 206, 250, ${opacity})`;
            ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
        }
            else {
                // Dessiner les autres éléments comme des carrés colorés
                ctx.fillStyle = colors[tile]
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
            }
        }
    }
}

let opacity = 0.83; // Opacité initiale
let direction = 1; // Direction de l'animation (1 = augmenter, -1 = diminuer)
const speed = 0.005; // Vitesse du changement d'opacité

function animateOpacity() {
    // Modifie l'opacité selon la direction
    opacity += direction * speed;

    // Inverse la direction lorsque l'opacité atteint ses limites (0 ou 1)
    if (opacity >= 1 || opacity <= 0.83) {
        direction *= -1;
    }
}



let imagesLoaded = 0;
const totalImages = 9; // Nombre d'images à charger

function checkImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        function gameLoop() {
            // Mets à jour l'opacité de la lave
            animateOpacity();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Redessine la carte
            drawMap(); // Une fois toutes les images chargées, on dessine la carte
            player.draw(ctx, blockSize)
            // Demande une nouvelle frame pour l'animation
            requestAnimationFrame(gameLoop);
        }
        gameLoop()
    }
}

// Ajout des événements `onload` pour chaque image
playerImage.onload = checkImagesLoaded;
chest1Image.onload = checkImagesLoaded;
chest2Image.onload = checkImagesLoaded;
treeSSImage.onload = checkImagesLoaded;
cactusSSImage.onload = checkImagesLoaded;
zombieImage.onload = checkImagesLoaded;
skeletonImage.onload = checkImagesLoaded;
wolfImage.onload = checkImagesLoaded;
bridgeImage.onload = checkImagesLoaded;




