import Phaser from 'phaser'
import TetrisGame from './TetrisGame.js'
import { COLS, ROWS, BLOCK_SIZE } from './constants.js'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.tetris = null
    this.graphics = null
    this.ghostGraphics = null
    this.nextGraphics = null
    this.dropTimer = 0
    this.callbacks = {}
    this.boardGraphics = []
    this.flashLines = []
    this.flashTimer = 0
    this.flashing = false
    this.flashCount = 0
  }

  setCallbacks(callbacks) {
    this.callbacks = callbacks
  }

  create() {
    this.tetris = new TetrisGame()
    this.graphics = this.add.graphics()
    this.ghostGraphics = this.add.graphics()

    for (let r = 0; r < ROWS; r++) {
      this.boardGraphics[r] = []
      for (let c = 0; c < COLS; c++) {
        this.boardGraphics[r][c] = this.add.graphics()
      }
    }

    this.input.keyboard.on('keydown-LEFT', () => {
      if (this.tetris.paused || this.tetris.gameOver) return
      this.tetris.move(-1, 0)
      this.render()
    })

    this.input.keyboard.on('keydown-RIGHT', () => {
      if (this.tetris.paused || this.tetris.gameOver) return
      this.tetris.move(1, 0)
      this.render()
    })

    this.input.keyboard.on('keydown-DOWN', () => {
      if (this.tetris.paused || this.tetris.gameOver) return
      const dropped = this.tetris.drop()
      this.tetris.score += dropped
      this.dropTimer = 0
      this.render()
      this.updateUI()
    })

    this.input.keyboard.on('keydown-UP', () => {
      if (this.tetris.paused || this.tetris.gameOver) return
      this.tetris.tryRotate(1)
      this.render()
    })

    this.input.keyboard.on('keydown-Z', () => {
      if (this.tetris.paused || this.tetris.gameOver) return
      this.tetris.tryRotate(-1)
      this.render()
    })

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.tetris.paused || this.tetris.gameOver) return
      this.tetris.hardDrop()
      this.dropTimer = 0
      this.render()
      this.updateUI()
    })

    this.input.keyboard.on('keydown-P', () => {
      this.togglePause()
    })

    this.input.keyboard.on('keydown-ESC', () => {
      this.togglePause()
    })

    this.render()
    this.updateUI()
  }

  togglePause() {
    if (this.tetris.gameOver) return
    this.tetris.paused = !this.tetris.paused
    this.updateUI()
  }

  update(time, delta) {
    if (this.flashing) {
      this.flashTimer += delta
      if (this.flashTimer > 80) {
        this.flashTimer = 0
        this.flashCount++
        if (this.flashCount >= 6) {
          this.flashing = false
          this.flashCount = 0
          this.flashLines = []
        }
        this.render()
      }
      return
    }

    if (this.tetris.paused || this.tetris.gameOver) return

    this.dropTimer += delta
    const speed = this.tetris.getSpeed()
    if (this.dropTimer >= speed) {
      this.dropTimer = 0
      if (!this.tetris.move(0, 1)) {
        this.tetris.lock()
        const cleared = this.checkLines()
        if (cleared > 0) {
          this.updateUI()
        }
        if (this.tetris.gameOver) {
          this.updateUI()
          if (this.callbacks.onGameOver) {
            this.callbacks.onGameOver(this.tetris.score)
          }
          return
        }
      }
      this.render()
      this.updateUI()
    }
  }

  checkLines() {
    const linesToClear = []
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.tetris.board[r].every(cell => cell !== 0)) {
        linesToClear.push(r)
      }
    }
    if (linesToClear.length > 0) {
      this.flashLines = linesToClear
      this.flashing = true
      this.flashCount = 0
      this.flashTimer = 0
      this.tetris.clearLines()
      return linesToClear.length
    }
    return 0
  }

  render() {
    this.graphics.clear()
    this.ghostGraphics.clear()

    this.drawBackground()
    this.drawBoard()
    this.drawGhost()
    this.drawCurrentPiece()
  }

  drawBackground() {
    this.graphics.fillStyle(0x1a1a2e, 1)
    this.graphics.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE)

    this.graphics.lineStyle(1, 0x2a2a4e, 0.5)
    for (let r = 0; r <= ROWS; r++) {
      this.graphics.lineBetween(0, r * BLOCK_SIZE, COLS * BLOCK_SIZE, r * BLOCK_SIZE)
    }
    for (let c = 0; c <= COLS; c++) {
      this.graphics.lineBetween(c * BLOCK_SIZE, 0, c * BLOCK_SIZE, ROWS * BLOCK_SIZE)
    }
  }

  drawBoard() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const g = this.boardGraphics[r][c]
        g.clear()
        if (this.tetris.board[r][c]) {
          if (this.flashing && this.flashLines.includes(r)) {
            if (this.flashCount % 2 === 0) {
              g.fillStyle(0xffffff, 1)
              g.fillRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2)
            }
          } else {
            this.drawBlock(g, c * BLOCK_SIZE, r * BLOCK_SIZE, this.tetris.board[r][c])
          }
        }
      }
    }
  }

  drawBlock(g, x, y, color) {
    g.fillStyle(color, 1)
    g.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2)

    g.fillStyle(0xffffff, 0.3)
    g.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, 3)
    g.fillRect(x + 1, y + 1, 3, BLOCK_SIZE - 2)

    g.fillStyle(0x000000, 0.2)
    g.fillRect(x + 1, y + BLOCK_SIZE - 4, BLOCK_SIZE - 2, 3)
    g.fillRect(x + BLOCK_SIZE - 4, y + 1, 3, BLOCK_SIZE - 2)
  }

  drawGhost() {
    if (!this.tetris.currentPiece) return
    const { shape, x, color } = this.tetris.currentPiece
    const ghostY = this.tetris.getGhostY()
    if (ghostY === this.tetris.currentPiece.y) return

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const px = (x + c) * BLOCK_SIZE
          const py = (ghostY + r) * BLOCK_SIZE
          this.ghostGraphics.lineStyle(2, color, 0.4)
          this.ghostGraphics.strokeRect(px + 2, py + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4)
        }
      }
    }
  }

  drawCurrentPiece() {
    if (!this.tetris.currentPiece) return
    const { shape, x, y, color } = this.tetris.currentPiece
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] && y + r >= 0) {
          const px = (x + c) * BLOCK_SIZE
          const py = (y + r) * BLOCK_SIZE
          this.drawBlock(this.graphics, px, py, color)
        }
      }
    }
  }


  updateUI() {
    if (this.callbacks.onUpdate) {
      this.callbacks.onUpdate(this.tetris.getState())
    }
  }

  restart() {
    this.tetris.reset()
    this.dropTimer = 0
    this.flashing = false
    this.flashCount = 0
    this.flashLines = []
    this.flashTimer = 0
    this.render()
    this.updateUI()
  }

  shutdown() {
    this.callbacks = {}
  }
}
