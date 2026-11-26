// Shrinks an image to at most `maxWidth` px wide and re-encodes it as WebP (browser only).
// Supabase Free has no image transforms, so covers are compressed before upload.
export async function toWebp(file: File, maxWidth = 1600, quality = 0.85): Promise<Blob> {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, maxWidth / bmp.width)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    bmp.close()
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/webp', quality))
    if (!blob) throw new Error('Trình duyệt không chuyển được ảnh sang WebP')
    return blob
}
