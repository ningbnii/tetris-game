<template>
  <div class="game-board">
    <div ref="gameContainerRef" class="phaser-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Phaser from 'phaser'
import GameScene from '../game/GameScene.js'

const props = defineProps({
  callbacks: {
    type: Object,
    default: () => ({}),
  },
  started: {
    type: Boolean,
    default: false,
  },
})

const gameContainerRef = ref(null)
let game = null
let sceneInstance = null

const initGame = () => {
  if (game) return

  const config = {
    type: Phaser.AUTO,
    parent: gameContainerRef.value,
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
    sceneInstance = game.scene.getScene('GameScene')
    if (sceneInstance) {
      sceneInstance.setCallbacks(props.callbacks)
      if (!props.started) {
        sceneInstance.tetris.paused = true
      }
    }
  })
}

watch(() => props.started, (val) => {
  if (val && sceneInstance) {
    sceneInstance.tetris.paused = false
  } else if (!val && sceneInstance && !sceneInstance.tetris.gameOver) {
    sceneInstance.tetris.paused = true
  }
})

onMounted(() => {
  initGame()
})

onBeforeUnmount(() => {
  if (game) {
    game.destroy(true)
    game = null
    sceneInstance = null
  }
})

defineExpose({
  getScene: () => sceneInstance,
})
</script>

<style scoped>
.game-board {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px solid #0f3460;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(15, 52, 96, 0.5);
}

.phaser-container {
  width: 100%;
  height: 100%;
}
</style>
