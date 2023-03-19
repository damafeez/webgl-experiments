<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { Particle, loadImage, getImageData, mapRange } from '~~/utils'

const canvasRef = ref<HTMLCanvasElement>()

// configuration
const fps = 30
const colorThreshold = 25
const imgUrl = '/me.png'
const resolution = 100

const cursor = {
  x: Infinity,
  y: Infinity,
}

const getRenderLoop = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
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

const onMouseEnter = (e: Event) => {
  e.target?.addEventListener('mouseout', onMouseOut, { once: true })
}

const onMouseOut = (_e: Event) => {
  cursor.x = Infinity
  cursor.y = Infinity
}

const onMouseMove = (e: MouseEvent) => {
  const canvas = e.target as HTMLCanvasElement

  cursor.x = (e.offsetX / canvas.offsetWidth) * canvas.width
  cursor.y = (e.offsetY / canvas.offsetHeight) * canvas.height
}

const makeParticles = (img: HTMLImageElement, width: number) => {
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

watchEffect(async (onCleanUp) => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  const img = await loadImage(imgUrl, resolution).catch(() => null)
  if (!img) return

  const aspect = img.width / img.height
  const parentWidth = Math.max(canvas.parentElement?.offsetWidth ?? 0, 800)
  const parentHeight = canvas.parentElement?.offsetHeight ?? 0
  const parentAspect = parentWidth / parentHeight

  if (aspect >= 1 && parentAspect <= 1) {
    canvas.width = parentWidth
    canvas.height = canvas.width / aspect
  } else {
    canvas.height = parentHeight
    canvas.width = canvas.height * aspect
  }

  const particles = makeParticles(img, canvas.width)
  particles.forEach((particle) => particle.draw(ctx))

  const [renderLoop, stopRenderLoop] = getRenderLoop(ctx, particles)

  window.requestAnimationFrame(renderLoop)
  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('mouseenter', onMouseEnter)

  onCleanUp(() => {
    stopRenderLoop()
    canvas.removeEventListener('mousemove', onMouseMove)
    canvas.removeEventListener('mouseenter', onMouseEnter)
  })
})
</script>

<template>
  <main class="container">
    <!-- this div/wrapper helps the canvas to scale while respecting container's padding  -->
    <div class="canvas-wrapper">
      <canvas ref="canvasRef" />
    </div>
  </main>
</template>

<style scoped>
main {
  min-height: 100vh;
  display: grid;
}
.canvas-wrapper {
  display: grid;
  place-content: center;
}

canvas {
  max-width: 100%;
}
</style>
