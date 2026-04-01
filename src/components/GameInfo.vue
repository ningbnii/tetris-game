<template>
  <div class="game-info">
    <div class="info-panel">
      <div class="info-item">
        <div class="info-label">SCORE</div>
        <div class="info-value">{{ formatNumber(score) }}</div>
      </div>
      <div class="info-item">
        <div class="info-label">LEVEL</div>
        <div class="info-value">{{ level }}</div>
      </div>
      <div class="info-item">
        <div class="info-label">LINES</div>
        <div class="info-value">{{ lines }}</div>
      </div>
    </div>
    <div class="next-piece-panel">
      <div class="info-label">NEXT</div>
      <canvas ref="nextCanvas" width="100" height="100" class="next-canvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, ref } from 'vue'

const props = defineProps({
  score: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lines: { type: Number, default: 0 },
  nextPiece: { type: Object, default: null },
})

const nextCanvas = ref(null)

const formatNumber = (num) => {
  return num.toString().padStart(6, '0')
}

const drawNextPiece = () => {
  if (!nextCanvas.value || !props.nextPiece) return
  const canvas = nextCanvas.value
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const { shape, color } = props.nextPiece
  const previewSize = 20
  const offsetX = (canvas.width - shape[0].length * previewSize) / 2
  const offsetY = (canvas.height - shape.length * previewSize) / 2

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const x = offsetX + c * previewSize
        const y = offsetY + r * previewSize
        ctx.fillStyle = '#' + color.toString(16).padStart(6, '0')
        ctx.fillRect(x + 1, y + 1, previewSize - 2, previewSize - 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fillRect(x + 1, y + 1, previewSize - 2, 2)
        ctx.fillRect(x + 1, y + 1, 2, previewSize - 2)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.fillRect(x + 1, y + previewSize - 3, previewSize - 2, 2)
        ctx.fillRect(x + previewSize - 3, y + 1, 2, previewSize - 2)
      }
    }
  }
}

watch(() => props.nextPiece, drawNextPiece, { deep: true })
onMounted(drawNextPiece)
</script>

<style scoped>
.game-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 140px;
}

.info-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(145deg, #16213e, #1a1a2e);
  padding: 16px;
  border-radius: 8px;
  border: 2px solid #0f3460;
}

.info-item {
  text-align: center;
}

.info-label {
  font-size: 12px;
  color: #888;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.info-value {
  font-size: 24px;
  font-weight: bold;
  color: #e94560;
  font-family: 'Courier New', monospace;
}

.next-piece-panel {
  background: linear-gradient(145deg, #16213e, #1a1a2e);
  padding: 16px;
  border-radius: 8px;
  border: 2px solid #0f3460;
  text-align: center;
}

.next-canvas {
  margin-top: 8px;
}
</style>
