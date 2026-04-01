<template>
  <div class="touch-controls">
    <div class="controls-row">
      <button class="touch-btn" @touchstart.prevent="onRotate" @mousedown="onRotate">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
        </svg>
      </button>
      <button class="touch-btn" @touchstart.prevent="onHardDrop" @mousedown="onHardDrop">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path fill="currentColor" d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
    </div>
    <div class="controls-row">
      <button class="touch-btn" @touchstart.prevent="onLeft" @mousedown="onLeft">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>
      <button class="touch-btn" @touchstart.prevent="onDown" @mousedown="onDown">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
        </svg>
      </button>
      <button class="touch-btn" @touchstart.prevent="onRight" @mousedown="onRight">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['left', 'right', 'down', 'rotate', 'hardDrop'])

const onLeft = () => emit('left')
const onRight = () => emit('right')
const onDown = () => emit('down')
const onRotate = () => emit('rotate')
const onHardDrop = () => emit('hardDrop')
</script>

<style scoped>
.touch-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  user-select: none;
  -webkit-user-select: none;
}

.controls-row {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.touch-btn {
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(145deg, #16213e, #1a1a2e);
  color: #e94560;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.1s;
  border: 2px solid #0f3460;
}

.touch-btn:active {
  background: #0f3460;
  transform: scale(0.95);
}

@media (min-width: 768px) {
  .touch-controls {
    display: none;
  }
}
</style>
