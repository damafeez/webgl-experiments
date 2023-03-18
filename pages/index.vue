<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { Particle, loadImage, getImageData } from '~~/utils'

const canvasRef = ref<HTMLCanvasElement>()

watchEffect((onCleanUp) => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  const particles: Particle[] = []
  const cursor = {
    x: Infinity,
    y: Infinity,
  }

  const fps = 60
  let animationId: number
  const renderLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach((particle) => {
      particle.update(cursor)
      particle.draw(ctx)
    })

    setTimeout(() => {
      window.requestAnimationFrame(renderLoop)
    }, 1000 / fps)
  }
  window.requestAnimationFrame(renderLoop)

  const onMouseEnter = (_e: MouseEvent) => {
    canvas.addEventListener('mouseout', onMouseOut, { once: true })
  }

  const onMouseOut = (_e: MouseEvent) => {
    cursor.x = Infinity
    cursor.y = Infinity
  }

  const onMouseMove = (e: MouseEvent) => {
    cursor.x = (e.offsetX / canvas.offsetWidth) * canvas.width
    cursor.y = (e.offsetY / canvas.offsetHeight) * canvas.height
  }

  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('mouseenter', onMouseEnter)
  ;(async () => {
    const img = await loadImage('/me.png', 160).catch(() => null)
    if (!img) return

    const aspect = img.width / img.height
    if (aspect > 1) {
      canvas.width = canvas.parentElement?.offsetWidth ?? 0
      canvas.height = canvas.width * aspect
    } else {
      canvas.height = canvas.parentElement?.offsetHeight ?? 0
      canvas.width = canvas.height * aspect
    }

    const imageData = getImageData(img)
    if (!imageData) return

    const gapX = canvas.width > img.width ? canvas.width / img.width : 0

    const threshold = 50
    for (let i = 0, x = 0, y = 0; i < imageData.length; i += 4) {
      const r = imageData[i + 0]
      const g = imageData[i + 1]
      const b = imageData[i + 2]
      const a = imageData[i + 3]

      const gray = 0.2 * r + 0.72 * g + 0.07 * b
      const color = `rgba(${gray}, ${gray}, ${gray}, ${a})`
      const radius = 1.1

      x += gapX
      // if at the right edge of image
      if ((i / 4) % img.width === 0) {
        x = 0
        y += gapX
      }

      if (gray > threshold) {
        const particle = new Particle({ x, y, color, radius })
        particle.draw(ctx)

        particles.push(particle)
      }
    }
  })()

  onCleanUp(() => {
    window.cancelAnimationFrame(animationId)
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
</style>
