import { randomInRange } from './generic'

type IParticle = {
  x: number
  y: number
  radius?: number
  color?: string
}
export class Particle {
  // postion
  x: number
  y: number
  // initial position
  ix: number
  iy: number
  // acceleration
  ax: number
  ay: number
  // velocity
  vx: number
  vy: number

  radius: number
  color: string

  minDist: number
  pushFactor: number
  pullFactor: number
  dampFactor: number

  constructor({ x, y, radius = 0.5, color = 'gray' }: IParticle) {
    this.x = this.ix = x
    this.y = this.iy = y

    this.ax = 0
    this.ay = 0

    this.vx = 0
    this.vy = 0

    this.radius = radius
    this.color = color

    this.minDist = randomInRange(100, 200)
    this.pushFactor = randomInRange(0.01, 0.02)
    this.pullFactor = randomInRange(0.002, 0.006)
    this.dampFactor = randomInRange(0.8, 0.95)
  }

  update(cursor: { x: number; y: number }) {
    // pull force - we want the particle to return to its initial position
    // at a speed proportional to its distance away (from initial position)
    const dxFromInitial = this.ix - this.x
    const dyFromInitial = this.iy - this.y
    this.ax = dxFromInitial * this.radius * this.pullFactor
    this.ay = dyFromInitial * this.radius * this.pullFactor

    // push force
    const dxToCursor = this.x - cursor.x
    const dyToCursor = this.y - cursor.y
    // absolute distance to cursor position
    const distanceToCursor = Math.sqrt(dxToCursor * dxToCursor + dyToCursor * dyToCursor)
    if (distanceToCursor < this.minDist) {
      const distDelta = this.minDist - distanceToCursor
      this.ax += (dxToCursor / distanceToCursor) * distDelta * this.pushFactor
      this.ay += (dyToCursor / distanceToCursor) * distDelta * this.pushFactor
    }

    this.vx += this.ax
    this.vy += this.ay

    this.vx *= this.dampFactor
    this.vy *= this.dampFactor

    this.x += this.vx
    this.y += this.vy
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
