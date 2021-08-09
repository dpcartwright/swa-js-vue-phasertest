import { Scene } from 'phaser'
import Player from '@/game/entities/Player.js'

export default class PlayScene extends Scene {
  constructor() {
    super({ key: 'PlayScene' })
    this.enemies = [];
    this.projectiles = [];
    this.items = [];
  }

  create() {
    const map = this.make.tilemap({ key: 'tilemap' });
    const grassTiles = map.addTilesetImage('grass_tiles', 'grass_tiles', 32, 32, 1, 2);
    const stonegroundTiles = map.addTilesetImage('stoneground_tiles', 'stoneground_tiles', 32, 32, 1, 2);
    const wallTiles = map.addTilesetImage('wall_tiles', 'wall_tiles', 32, 32, 1, 2);
    const allTiles = [grassTiles, stonegroundTiles, wallTiles];
    const groundLayer = map.createLayer('Ground', allTiles);
    const buildingLayer = map.createLayer('Buildings', allTiles);
    this.player = new Player({ scene: this, x: 100, y: 100, texture: 'alchemist', frame: 'alchemist_idle_1' });
    buildingLayer.setCollisionByProperty({ collides: true })
    this.matter.world.convertTilemapLayer(buildingLayer)
    //buildingLayer.setDepth(3);
    this.player.inputKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      dash: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    let camera = this.cameras.main;
    camera.zoom = 3;
    camera.startFollow(this.player);
    camera.setLerp(0.1, 0.1);
    camera.setBounds(0, 0, 1280, 960);
    this.input.mouse.disableContextMenu();
  }

  update() {
    this.enemies.forEach(enemy => enemy.update());
    this.player.update();
    this.projectiles.forEach(projectile => projectile.update());
  }
}
