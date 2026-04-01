import { COLS, ROWS, SHAPES, PIECE_NAMES, COLORS, WALL_KICKS, WALL_KICKS_I, SCORE_TABLE } from './constants.js'

export default class TetrisGame {
  constructor() {
    this.board = []
    this.currentPiece = null
    this.nextPiece = null
    this.score = 0
    this.lines = 0
    this.level = 1
    this.gameOver = false
    this.paused = false
    this.bag = []
    this.reset()
  }

  reset() {
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
    this.score = 0
    this.lines = 0
    this.level = 1
    this.gameOver = false
    this.paused = false
    this.bag = []
    this.nextPiece = this.randomPiece()
    this.spawnPiece()
  }

  randomPiece() {
    if (this.bag.length === 0) {
      this.bag = [...PIECE_NAMES]
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]]
      }
    }
    const name = this.bag.pop()
    return {
      name,
      shape: SHAPES[name].map(row => [...row]),
      color: COLORS[name],
      x: Math.floor((COLS - SHAPES[name][0].length) / 2),
      y: 0,
      rotation: 0,
    }
  }

  spawnPiece() {
    this.currentPiece = this.nextPiece
    this.nextPiece = this.randomPiece()
    if (!this.isValid(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
      this.gameOver = true
    }
  }

  isValid(shape, offsetX, offsetY) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = offsetX + c
          const newY = offsetY + r
          if (newX < 0 || newX >= COLS || newY >= ROWS) return false
          if (newY >= 0 && this.board[newY][newX]) return false
        }
      }
    }
    return true
  }

  rotate(shape, dir) {
    const N = shape.length
    const rotated = Array.from({ length: N }, () => Array(N).fill(0))
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (dir === 1) {
          rotated[c][N - 1 - r] = shape[r][c]
        } else {
          rotated[N - 1 - c][r] = shape[r][c]
        }
      }
    }
    return rotated
  }

  tryRotate(dir) {
    if (!this.currentPiece || this.currentPiece.name === 'O') return false
    const newShape = this.rotate(this.currentPiece.shape, dir)
    const oldRot = this.currentPiece.rotation
    const newRot = (oldRot + dir + 4) % 4
    const kickKey = `${oldRot}>${newRot}`
    const kicks = this.currentPiece.name === 'I' ? WALL_KICKS_I[kickKey] : WALL_KICKS[kickKey]
    if (!kicks) return false

    for (const [dx, dy] of kicks) {
      if (this.isValid(newShape, this.currentPiece.x + dx, this.currentPiece.y - dy)) {
        this.currentPiece.shape = newShape
        this.currentPiece.x += dx
        this.currentPiece.y -= dy
        this.currentPiece.rotation = newRot
        return true
      }
    }
    return false
  }

  move(dx, dy) {
    if (!this.currentPiece) return false
    if (this.isValid(this.currentPiece.shape, this.currentPiece.x + dx, this.currentPiece.y + dy)) {
      this.currentPiece.x += dx
      this.currentPiece.y += dy
      return true
    }
    return false
  }

  drop() {
    if (!this.currentPiece) return 0
    let dropped = 0
    while (this.move(0, 1)) {
      dropped++
    }
    this.lock()
    return dropped
  }

  hardDrop() {
    if (!this.currentPiece) return 0
    let dropped = 0
    while (this.isValid(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y++
      dropped++
    }
    this.score += dropped * 2
    this.lock()
    return dropped
  }

  getGhostY() {
    if (!this.currentPiece) return 0
    let ghostY = this.currentPiece.y
    while (this.isValid(this.currentPiece.shape, this.currentPiece.x, ghostY + 1)) {
      ghostY++
    }
    return ghostY
  }

  lock() {
    if (!this.currentPiece) return
    const { shape, x, y, color } = this.currentPiece
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const boardY = y + r
          const boardX = x + c
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            this.board[boardY][boardX] = color
          }
        }
      }
    }
    this.clearLines()
    this.spawnPiece()
  }

  clearLines() {
    let cleared = 0
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.board[r].every(cell => cell !== 0)) {
        this.board.splice(r, 1)
        this.board.unshift(Array(COLS).fill(0))
        cleared++
        r++
      }
    }
    if (cleared > 0) {
      this.lines += cleared
      this.score += (SCORE_TABLE[cleared] || 0) * this.level
      this.level = Math.floor(this.lines / 10) + 1
    }
    return cleared
  }

  getSpeed() {
    return Math.max(50, 1000 - (this.level - 1) * 80)
  }

  getState() {
    return {
      board: this.board,
      currentPiece: this.currentPiece,
      nextPiece: this.nextPiece,
      score: this.score,
      lines: this.lines,
      level: this.level,
      gameOver: this.gameOver,
      paused: this.paused,
      ghostY: this.currentPiece ? this.getGhostY() : 0,
    }
  }
}
