import Phaser from 'phaser'
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin"
import BootScene from '@/game/scenes/BootScene'
import PlayScene from '@/game/scenes/PlayScene'

function launch(containerId) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 960,
    height: 720,
    parent: containerId,
    pixelArt: true,
    scale: {
      zoom: 1.,
    },
    physics: {
      default: 'matter',
      matter: {
        debug: false,
        gravity: { y: 0 },
      }
    },
    scene: [BootScene, PlayScene],
    plugins: {
      scene: [
        {
          plugin: PhaserMatterCollisionPlugin,
          key: 'matterCollision',
          mapping: 'matterCollision'
        }
      ]
    }
  })
}

export default launch
export { launch }
