import { Scene } from 'phaser'
import grass_tiles from '@/game/assets/TX Tileset Grass-extruded.png'
import stoneground_tiles from '@/game/assets/TX Tileset Stone Ground-extruded.png'
import wall_tiles from '@/game/assets/TX Tileset Wall-extruded.png'
import tilemap from '@/game/assets/map.json'
import items from '@/game/assets/items.png'
import alchemist_img from '@/game/assets/alchemist.png'
import alchemist_atlas from '@/game/assets/alchemist_atlas.json'
import alchemist_anim from '@/game/assets/alchemist_anim.json'
import smoke from '@/game/assets/whitePuff00.png'

export default class BootScene extends Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.load.image('grass_tiles', grass_tiles);
    this.load.image('stoneground_tiles', stoneground_tiles);
    this.load.image('wall_tiles', wall_tiles);
    this.load.tilemapTiledJSON('tilemap', tilemap);
    this.load.spritesheet('items', items, { frameWidth: 48, frameHeight: 48 });
    this.load.atlas('alchemist', alchemist_img, alchemist_atlas);
    this.load.animation('alchemist_anim', alchemist_anim);
    this.load.image('smoke', smoke);
  }

  create() {
    this.scene.start('PlayScene')
  }
}
