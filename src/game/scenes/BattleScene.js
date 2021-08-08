import Player from "../entities/Player.js";
export default class BattleScene extends Phaser.Scene {
    constructor() {
        super("BattleScene");
        this.enemies = [];
        this.projectiles = [];
        this.items = [];
    }

    preload() {
        this.load.image('grass_tiles', '../../assets/images/TX Tileset Grass.png');
        this.load.image('stoneground_tiles', '../../assets/images/TX Tileset Stone Ground.png');
        this.load.image('wall_tiles', '../../assets/images/TX Tileset Wall.png');
        this.load.tilemapTiledJSON('tilemap', '../../assets/images/map.json');
        this.load.spritesheet('items', '../../assets/images/items.png', { frameWidth: 48, frameHeight: 48 });
        this.load.atlas('alchemist', '../../assets/images/alchemist.png', '../../assets/images/alchemist_atlas.json');
        this.load.animation('alchemist_anim', '../../assets/images/alchemist_anim.json');
    }

    create() {
        const map = this.make.tilemap({ key: 'tilemap' });
        const grassTiles = map.addTilesetImage('grass_tiles', 'grass_tiles');
        const stonegroundTiles = map.addTilesetImage('stoneground_tiles', 'stoneground_tiles');
        const wallTiles = map.addTilesetImage('wall_tiles', 'wall_tiles');
        const allTiles = [grassTiles, stonegroundTiles, wallTiles];
        map.createLayer('Ground', allTiles);
        map.createLayer('Buildings', allTiles);
        this.player = new Player({ scene: this, x: 200, y: 200, texture: 'alchemist', frame: 'alchemist_idle_1' });
        this.player.inputKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            dash: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        let camera = this.cameras.main;
        camera.zoom = 1;
        camera.startFollow(this.player);
        camera.setLerp(0.1, 0.1);
        camera.setBounds(0, 0, this.game.config.width * 2, this.game.config.height * 2);
        this.input.mouse.disableContextMenu();
        //this.scene.launch('InventoryScene', { mainScene: this });
    }

    update() {
        this.enemies.forEach(enemy => enemy.update());
        this.player.update();
        this.projectiles.forEach(projectile => projectile.update());
    }

}