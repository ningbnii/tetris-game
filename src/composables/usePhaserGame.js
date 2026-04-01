import { ref, onMounted, onBeforeUnmount } from 'vue'
import Phaser from 'phaser'
import GameScene from '../game/GameScene.js'

export default function usePhaserGame() {
  const gameContainer = ref(null)
  let game = null

  const startGame = (callbacks) => {
    if (game) {
      game.destroy(true)
      game = null
    }

    const config = {
      type: Phaser.AUTO,
      parent: gameContainer.value,
      width: 360,
      height: 600,
      backgroundColor: '#1a1a2e',
      scene: GameScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    }

    game = new Phaser.Game(config)

    game.events.on('ready', () => {
      const scene = game.scene.getScene('GameScene')
      if (scene) {
        scene.setCallbacks(callbacks)
      }
    })
  }

  const getScene = () => {
    if (game) {
      return game.scene.getScene('GameScene')
    }
    return null
  }

  onBeforeUnmount(() => {
    if (game) {
      game.destroy(true)
      game = null
    }
  })

  return { gameContainer, startGame, getScene }
}
