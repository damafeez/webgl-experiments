<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { makeParticles } from './utils/interactiveParticles'
import { loadImage, getRenderLoop, notifyError } from '~~/utils'

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

watchEffect(async (onCleanUp) => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  const img = await loadImage(imgUrl, resolution).catch((e) =>
    notifyError(e, 'Error loading image: ')
  )
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

  const particles = makeParticles(img, canvas.width, colorThreshold)

  const [startAnimation, stopAnimation] = getRenderLoop(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach((particle) => {
      particle.update(cursor)
      particle.draw(ctx)
    })
  }, fps)

  startAnimation()
  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('mouseenter', onMouseEnter)

  onCleanUp(() => {
    stopAnimation()
    canvas.removeEventListener('mousemove', onMouseMove)
    canvas.removeEventListener('mouseenter', onMouseEnter)
  })
})

//
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
</script>

<template>
  <div class="canvas-wrapper">
    <canvas ref="canvasRef" />
  </div>
</template>
<style scoped>
.canvas-wrapper {
  display: grid;
  place-content: center;
}

canvas {
  max-width: 100%;
}
</style>
