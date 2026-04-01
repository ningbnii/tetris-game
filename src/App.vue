<template>
  <div class="app">
    <div class="game-wrapper">
      <div class="game-container">
        <GameInfo
          :score="gameState.score"
          :level="gameState.level"
          :lines="gameState.lines"
          :nextPiece="gameState.nextPiece"
        />
        <div class="game-area">
          <GameBoard ref="gameBoardRef" :callbacks="gameCallbacks" :started="!showStart && !showPause && !showGameOver" />
          <Overlay :visible="showStart">
            <h1 class="title">TETRIS</h1>
            <button class="btn-primary" @click="startGame">START GAME</button>
            <div class="controls-hint">
              <p>← → Move</p>
              <p>↑ Rotate</p>
              <p>↓ Soft Drop</p>
              <p>Space Hard Drop</p>
              <p>P / ESC Pause</p>
            </div>
          </Overlay>
          <Overlay :visible="showPause">
            <h2 class="title">PAUSED</h2>
            <button class="btn-primary" @click="resumeGame">RESUME</button>
            <button class="btn-secondary" @click="restartGame">RESTART</button>
          </Overlay>
          <Overlay :visible="showGameOver">
            <h2 class="title game-over">GAME OVER</h2>
            <div class="final-score">SCORE: {{ formatNumber(finalScore) }}</div>
            <button class="btn-primary" @click="restartGame">PLAY AGAIN</button>
          </Overlay>
        </div>
        <TouchControls
          @left="handleLeft"
          @right="handleRight"
          @down="handleDown"
          @rotate="handleRotate"
          @hardDrop="handleHardDrop"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import GameBoard from './components/GameBoard.vue'
import GameInfo from './components/GameInfo.vue'
import TouchControls from './components/TouchControls.vue'
import Overlay from './components/Overlay.vue'

const gameBoardRef = ref(null)
const gameState = reactive({
  score: 0,
  level: 1,
  lines: 0,
  nextPiece: null,
  gameOver: false,
  paused: false,
})

const showStart = ref(true)
const showPause = ref(false)
const showGameOver = ref(false)
const finalScore = ref(0)

const formatNumber = (num) => num.toString().padStart(6, '0')

const gameCallbacks = {
  onUpdate: (state) => {
    gameState.score = state.score
    gameState.level = state.level
    gameState.lines = state.lines
    gameState.nextPiece = state.nextPiece
    gameState.gameOver = state.gameOver
    gameState.paused = state.paused

    if (state.gameOver) {
      showGameOver.value = true
      finalScore.value = state.score
    }
  },
  onGameOver: (score) => {
    finalScore.value = score
    showGameOver.value = true
  },
}

const startGame = () => {
  showStart.value = false
  showGameOver.value = false
  showPause.value = false
}

const resumeGame = () => {
  const scene = gameBoardRef.value?.getScene()
  if (scene) {
    scene.togglePause()
    showPause.value = false
  }
}

const restartGame = () => {
  showGameOver.value = false
  showPause.value = false
  const scene = gameBoardRef.value?.getScene()
  if (scene) {
    scene.restart()
    scene.setCallbacks(gameCallbacks)
  }
}

const handleLeft = () => {
  const scene = gameBoardRef.value?.getScene()
  if (scene && scene.tetris && !scene.tetris.paused && !scene.tetris.gameOver) {
    scene.tetris.move(-1, 0)
    scene.render()
  }
}

const handleRight = () => {
  const scene = gameBoardRef.value?.getScene()
  if (scene && scene.tetris && !scene.tetris.paused && !scene.tetris.gameOver) {
    scene.tetris.move(1, 0)
    scene.render()
  }
}

const handleDown = () => {
  const scene = gameBoardRef.value?.getScene()
  if (scene && scene.tetris && !scene.tetris.paused && !scene.tetris.gameOver) {
    scene.tetris.drop()
    scene.render()
    scene.updateUI()
  }
}

const handleRotate = () => {
  const scene = gameBoardRef.value?.getScene()
  if (scene && scene.tetris && !scene.tetris.paused && !scene.tetris.gameOver) {
    scene.tetris.tryRotate(1)
    scene.render()
  }
}

const handleHardDrop = () => {
  const scene = gameBoardRef.value?.getScene()
  if (scene && scene.tetris && !scene.tetris.paused && !scene.tetris.gameOver) {
    scene.tetris.hardDrop()
    scene.render()
    scene.updateUI()
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0a0a1a;
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

.app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%);
}

.game-wrapper {
  padding: 20px;
}

.game-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.game-area {
  position: relative;
}

.title {
  font-size: 48px;
  font-weight: bold;
  color: #e94560;
  margin-bottom: 30px;
  text-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
  letter-spacing: 8px;
}

.game-over {
  color: #ff0000;
  text-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
}

.btn-primary, .btn-secondary {
  padding: 14px 40px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin: 10px;
  transition: all 0.2s;
  letter-spacing: 2px;
}

.btn-primary {
  background: linear-gradient(145deg, #e94560, #c73650);
  color: #fff;
}

.btn-primary:hover {
  background: linear-gradient(145deg, #ff5a7a, #e94560);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(233, 69, 96, 0.4);
}

.btn-secondary {
  background: linear-gradient(145deg, #16213e, #1a1a2e);
  color: #e94560;
  border: 2px solid #0f3460;
}

.btn-secondary:hover {
  background: #0f3460;
  transform: translateY(-2px);
}

.controls-hint {
  margin-top: 30px;
  color: #888;
  font-size: 14px;
  line-height: 2;
}

.final-score {
  font-size: 28px;
  color: #e94560;
  margin: 20px 0;
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .game-container {
    flex-direction: column;
    align-items: center;
  }

  .game-info {
    flex-direction: row;
    min-width: auto;
  }

  .info-panel {
    flex-direction: row;
    gap: 20px;
  }

  .title {
    font-size: 36px;
  }
}
</style>
