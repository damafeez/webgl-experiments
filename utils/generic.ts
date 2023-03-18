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

export const randomInRange = (from: number, to: number): number =>
  from + Math.floor(Math.random() * (to - from))
