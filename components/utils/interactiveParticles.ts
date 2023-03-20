import { Particle, getImageData, mapRange } from '~~/utils'

export const makeParticles = (
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
