import { Particle, getImageData, mapRange } from '~~/utils'

export const getRenderLoop = ({
  ctx,
  particles,
  cursor,
  fps = 40,
}: {
  ctx: CanvasRenderingContext2D
  particles: Particle[]
  fps: number
  cursor: {
    x: number
    y: number
  }
}) => {
  let animationId: number
  let timeoutId: NodeJS.Timeout

  const renderLoop = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    particles.forEach((particle) => {
      particle.update(cursor)
      particle.draw(ctx)
    })

    timeoutId = setTimeout(() => {
      animationId = window.requestAnimationFrame(renderLoop)
    }, 1000 / fps)
  }

  const stopRenderLoop = () => {
    window.clearTimeout(timeoutId)
    window.cancelAnimationFrame(animationId)
  }

  return [renderLoop, stopRenderLoop]
}

export const makeParticles = (
  img: HTMLImageElement,
  width: number,
  colorThreshold: number
) => {
  const particles: Particle[] = []
  const imageData = getImageData(img)

  const gapX = width > img.width ? width / img.width : 0

  for (let i = 0, x = 0, y = 0; i < imageData.length; i += 4) {
    const r = imageData[i + 0]
    const g = imageData[i + 1]
    const b = imageData[i + 2]
    const a = imageData[i + 3]

    const gray = 0.2 * r + 0.72 * g + 0.07 * b
    const color = `rgba(${gray}, ${gray}, ${gray}, ${a})`
    const radius = mapRange(gray, 0, 255, 0.5, 5)

    x += gapX
    // if at the right edge of image
    if ((i / 4) % img.width === 0) {
      x = 0
      y += gapX
    }

    if (gray > colorThreshold) {
      const particle = new Particle({ x, y, color, radius })
      particles.push(particle)
    }
  }

  return particles
}
