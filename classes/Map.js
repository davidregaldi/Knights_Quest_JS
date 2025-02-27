import { addToConsole } from '../main.js';

class Map {
    constructor({width = 16, height = 16, biome = 'random', name = '', terrainLayer=[], entityLayer=[]}) {
        this.width = width
        this.height = height
        addToConsole(`Génération d'une carte: ${this.width}x${this.height}`)
        this.name = name
        this.biome = biome === 'random' ? this.getRandomBiome() : biome;
        addToConsole(`Selection du biome: ${this.biome}`);
        this.terrainLayer = terrainLayer.length > 0 ? terrainLayer : this.generateGround()
        this.entityLayer = entityLayer.length > 0 ? entityLayer : this.generateEmpty()
    }

    getRandomBiome() {
        const biomes = ['herb', 'dust', 'snow', 'magma'];
        const biome = biomes[Math.floor(Math.random() * biomes.length)]; // Calcul du biome
        return biome; // Renvoi du biome
    }

    generateEmpty() {
        addToConsole(`Génère un calque d'entités vide...`)
        const emptyLayer = [];
        for (let y = 0; y < this.height; y++) {
            emptyLayer[y] = [];
            for (let x = 0; x < this.width; x++) {
                emptyLayer[y][x] = ''
            }
        }
        return emptyLayer;
    }

    generateGround() {
        addToConsole(`Génère un calque de représentation du sol...`)
        const groundLayer = [];
        for (let y = 0; y < this.height; y++) {
            groundLayer[y] = [];
            for (let x = 0; x < this.width; x++) {
                groundLayer[y][x] = Math.random() < 0.5 ? "g" : "G";
            }
        }
        return groundLayer;
    }

    generateWater() {
        addToConsole(`Génère une rivière...`);
        let y = Math.floor(this.height / 2); // Choisir un point de départ initial à la moitié de la hauteur
    
        // Génération aléatoire du nombre de ponts (entre 1 et 3)
        const numberOfBridges = Math.floor(Math.random() * 3) + 1;
        const bridgePositions = [];
    
        // Générer des positions de pont aléatoires sur l'axe X (largeur de la rivière)
        while (bridgePositions.length < numberOfBridges) {
            const randomX = Math.floor(Math.random() * this.width);
            if (!bridgePositions.includes(randomX)) {
                bridgePositions.push(randomX);
            }
        }
    
        for (let x = 0; x < this.width; x++) {
            // Définir la position de l'eau sur la case courante
            if (this.biome === 'magma') {
                this.entityLayer[y][x] = 'lava';
                this.terrainLayer[y][x] = 'lava';
            }
            else {
                this.entityLayer[y][x] = 'water';
                this.terrainLayer[y][x] = 'water';
            }
    
            // Placer un pont si la position correspond à un pont
            if (bridgePositions.includes(x)) {
                this.entityLayer[y][x] = 'bridge';
            }
    
            // Déterminer la direction suivante (monter, descendre ou rester)
            const direction = Math.floor(Math.random() * 3);
            if (direction === 0 && y > 0) {
                y--; // Monter
            } else if (direction === 1 && y < this.height - 1) {
                y++; // Descendre
            }
            // Sinon, rester à la même hauteur
        }
    }

    generateStuff({
        stumpTreeCount = 0, smallTreeCount = 0, mediumTreeCount = 0, bigTreeCount = 0,  // Trees
        smallChestCount = 0, bigChestCount = 0, trappedChestCount = 0,                                        // Chests
    }) {
        addToConsole(`Ajout du décor: ${stumpTreeCount + smallTreeCount + mediumTreeCount + bigTreeCount} arbres ${smallChestCount + bigChestCount + trappedChestCount} coffres`)
        const placeStuff = (stuffCount, stuffType) => {
            while (stuffCount > 0) {
                let x = Math.floor(Math.random() * this.width);
                let y = Math.floor(Math.random() * this.height);
                if (this.entityLayer[y][x] === '') {
                    this.entityLayer[y][x] = stuffType;
                    stuffCount--;
                }
            }
        }
        placeStuff(stumpTreeCount, 't0'); placeStuff(smallTreeCount, 't1'); placeStuff(mediumTreeCount, 't2');placeStuff(bigTreeCount, 't3');
        placeStuff(smallChestCount, 'chest1'); placeStuff(bigChestCount, 'chest2'); placeStuff(trappedChestCount, 'chest3');
    }

    displayTerrain(ctx, tileSize) {
        let colors = {}
        if (this.biome ==='herb') {
            colors = {
                "g": "#C2D757",
                "G": "#B2D254",
                "water": "#4ebcb9",
            }
        }
        else if (this.biome === 'dust') {
            colors = {
                "g": "#F8ECC9",
                "G": "#FCF7E9",
                "water": "#4ebcb9",
            }
        }
        else if (this.biome === 'snow') {
            colors = {
                "g": "snow",
                "G": "aliceblue",
                "water": "lightskyblue",
            }
        }
        else if (this.biome === 'magma') {
            colors = {
                "g": "sienna",
                "G": "peru",
                "lava": "orange",
            }
        }
        // console.log(this.terrainLayer);
        for (let row = 0; row < this.terrainLayer.length; row++) {
            for (let col = 0; col < this.terrainLayer[row].length; col++) {
                const tile = this.terrainLayer[row][col];
                if (tile === 'g') { ctx.fillStyle = colors[tile]; ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 'G') { ctx.fillStyle = colors[tile]; ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 'water') { ctx.fillStyle = colors[tile]; ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 'lava') { ctx.fillStyle = colors[tile]; ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);}


            }
        }
    }

    displayEntities(ctx, tileSize) {
        // console.log(this.entityLayer);
        for (let row = 0; row < this.entityLayer.length; row++) {
            for (let col = 0; col < this.entityLayer[row].length; col++) {
                const tile = this.entityLayer[row][col];
                if (tile === 'bridge') {ctx.drawImage(window.gameImages['bridge'], col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile.includes('boss')) {ctx.drawImage(window.gameImages['boss'], col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile.includes('mummy')) {ctx.drawImage(window.gameImages['mummy'], col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile.includes('player')) {ctx.drawImage(window.gameImages['player'], col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 'chest1' || tile === 'chest3') {ctx.drawImage(window.gameImages['chest1'], col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 'chest2') {ctx.drawImage(window.gameImages['chest2'], col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile.includes('skeletonMage')) {ctx.drawImage(window.gameImages['skeletonMage'], col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile.includes('skeleton')) {ctx.drawImage(window.gameImages['skeleton'], col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile.includes('wolf')) {ctx.drawImage(window.gameImages['wolf'], col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile.includes('zombieBig')) {ctx.drawImage(window.gameImages['zombieBig'], col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile.includes('zombie')) {ctx.drawImage(window.gameImages['zombie'], col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't0' && this.biome === 'herb') {ctx.drawImage(window.gameImages['treeHerbSS'], 0 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't1' && this.biome === 'herb') { ctx.drawImage(window.gameImages['treeHerbSS'], 1 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't2' && this.biome === 'herb') { ctx.drawImage(window.gameImages['treeHerbSS'], 2 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't3' && this.biome === 'herb') { ctx.drawImage(window.gameImages['treeHerbSS'], 3 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't0' && this.biome === 'dust') {ctx.drawImage(window.gameImages['treeDustSS'], 0 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't1' && this.biome === 'dust') { ctx.drawImage(window.gameImages['treeDustSS'], 1 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't2' && this.biome === 'dust') { ctx.drawImage(window.gameImages['treeDustSS'], 2 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't3' && this.biome === 'dust') { ctx.drawImage(window.gameImages['treeDustSS'], 3 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't0' && this.biome === 'snow') {ctx.drawImage(window.gameImages['treeSnowSS'], 0 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't1' && this.biome === 'snow') { ctx.drawImage(window.gameImages['treeSnowSS'], 1 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't2' && this.biome === 'snow') { ctx.drawImage(window.gameImages['treeSnowSS'], 2 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't3' && this.biome === 'snow') { ctx.drawImage(window.gameImages['treeSnowSS'], 3 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't0' && this.biome === 'magma') {ctx.drawImage(window.gameImages['treeMagmaSS'], 0 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't1' && this.biome === 'magma') { ctx.drawImage(window.gameImages['treeMagmaSS'], 1 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't2' && this.biome === 'magma') { ctx.drawImage(window.gameImages['treeMagmaSS'], 2 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                else if (tile === 't3' && this.biome === 'magma') { ctx.drawImage(window.gameImages['treeMagmaSS'], 3 * 16, 0 * 16, 16, 16, col * tileSize, row * tileSize, tileSize, tileSize);}
                }
            }
        }
    }
export default Map;
