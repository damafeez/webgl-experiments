export const getImageData = (img: HTMLImageElement): Uint8ClampedArray | undefined => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = img.width
  canvas.height = img.height

  ctx?.drawImage(img, 0, 0)

  return ctx?.getImageData(0, 0, canvas.width, canvas.height).data
}

export const loadImage = (url: string, maxWidth?: number): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = url

    img.onerror = reject
    img.onload = () => {
      // compress and shrink image
      if (maxWidth && img.width > maxWidth) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = Math.min(maxWidth, img.width)
        canvas.height = (canvas.width / img.width) * img.height

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

        const el = document.createElement('img')
        el.src = canvas.toDataURL('image/png')
        resolve(el)
      } else {
        resolve(img)
      }
    }
  })
}

type IParticle = {
  x: number
  y: number
  radius?: number
  color?: string
}
export class Particle {
  x: number
  y: number
  ax: number
  ay: number
  vx: number
  vy: number
  ix: number
  iy: number

  radius: number
  color: string

  minDist: number
  pushFactor: number
  pullFactor: number
  dampFactor: number

  constructor({ x, y, radius = 0.5, color = 'gray' }: IParticle) {
    // position
    this.x = x
    this.y = y

    // acceleration
    this.ax = 0
    this.ay = 0

    // velocity
    this.vx = 0
    this.vy = 0

    // initial position
    this.ix = x
    this.iy = y

    this.radius = radius
    this.color = color

    this.minDist = randomInRange(100, 200)
    this.pushFactor = randomInRange(0.01, 0.02)
    this.pullFactor = randomInRange(0.002, 0.006)
    this.dampFactor = randomInRange(0.9, 0.95)
  }

  update(cursor: { x: number; y: number }) {
    let dx, dy, dd, distDelta
    let idxColor

    // pull force
    dx = this.ix - this.x
    dy = this.iy - this.y
    dd = Math.sqrt(dx * dx + dy * dy)

    this.ax = dx * this.pullFactor
    this.ay = dy * this.pullFactor

    // idxColor = Math.floor(math.mapRange(dd, 0, 200, 0, colors.length - 1, true));
    // this.color = colors[idxColor];

    // push force
    dx = this.x - cursor.x
    dy = this.y - cursor.y
    dd = Math.sqrt(dx * dx + dy * dy)

    distDelta = this.minDist - dd

    if (dd < this.minDist) {
      this.ax += (dx / dd) * distDelta * this.pushFactor
      this.ay += (dy / dd) * distDelta * this.pushFactor
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

export const randomInRange = (from: number, to: number): number =>
  from + Math.floor(Math.random() * (to - from))
