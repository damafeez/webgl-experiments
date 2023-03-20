import random from 'canvas-sketch-util/random'
import { getImageData, mapRange, randomInRange } from './generic'

export class Particle {
  // postion
  x: number
  y: number
  // initial position
  initialX: number
  initialY: number
  // acceleration
  ax: number
  ay: number
  // velocity
  vx: number
  vy: number

  color: string
  radius: number
  initialRadius: number

  // random
  cursorProximity: number
  pushFactor: number
  pullFactor: number
  dampFactor: number

  constructor({
    x,
    y,
    radius = 0.5,
    color = 'gray',
  }: {
    x: number
    y: number
    radius?: number
    color?: string
  }) {
    this.x = this.initialX = x
    this.y = this.initialY = y

    this.ax = 0
    this.ay = 0

    this.vx = 0
    this.vy = 0

    this.radius = this.initialRadius = radius
    this.color = color

    this.cursorProximity = randomInRange(100, 200)
    this.pushFactor = randomInRange(0.01, 0.02)
    this.pullFactor = randomInRange(0.002, 0.006)
    this.dampFactor = randomInRange(0.8, 0.95)
  }

  update(cursor: { x: number; y: number }) {
    // pull force - we want the particle to return to its initial position
    // at a speed proportional to its distance away (from initial position)
    const dxFromInitial = this.initialX - this.x
    const dyFromInitial = this.initialY - this.y
    this.ax = dxFromInitial * this.radius * this.pullFactor
    this.ay = dyFromInitial * this.radius * this.pullFactor

    // push force
    const dxToCursor = this.x - cursor.x
    const dyToCursor = this.y - cursor.y
    // absolute distance to cursor position
    const distanceToCursor = Math.sqrt(dxToCursor * dxToCursor + dyToCursor * dyToCursor)
    // is within cursor proximity
    if (distanceToCursor < this.cursorProximity) {
      const distDelta = this.cursorProximity - distanceToCursor
      this.ax += (dxToCursor / distanceToCursor) * distDelta * this.pushFactor
      this.ay += (dyToCursor / distanceToCursor) * distDelta * this.pushFactor
    } else {
      this.x += random.noise2D(this.x, this.y / this.radius, 0.1, 0.4)
      this.y += random.noise2D(this.y, this.x, 0.1, 0.4)
    }

    this.vx += this.ax
    this.vy += this.ay

    this.vx *= this.dampFactor
    this.vy *= this.dampFactor

    this.x += this.vx
    this.y += this.vy

    this.radius = Math.abs(this.initialRadius + (this.vx + this.vy) / 5)
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y)

    ctx.beginPath()
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2)

    ctx.fillStyle = this.color
    ctx.fill()

    ctx.restore()
  }
}

export const getParticlesFromImage = (
  img: HTMLImageElement,
  width: number,
  colorThreshold: number
) => {
  const particles: Particle[] = []
  const imageData = getImageData(img)

  const gap = width > img.width ? width / img.width : 0

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4

      const r = imageData[i + 0]
      const g = imageData[i + 1]
      const b = imageData[i + 2]
      const a = imageData[i + 3]

      const gray = 0.2 * r + 0.72 * g + 0.07 * b
      const color = `rgba(${gray}, ${gray}, ${gray}, ${a})`
      const radius = mapRange(gray, 0, 255, 0.5, 5)

      if (gray > colorThreshold) {
        const particle = new Particle({ x: x * gap, y: y * gap, color, radius })
        particles.push(particle)
      }
    }
  }

  return particles
}
