import sharp from 'sharp'
import { writeFileSync } from 'fs'

// Icon design: dark slate background, glowing ✦ star in blue-violet
function makeSVG(size) {
  const pad = size * 0.18
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38   // star arm length
  const r2 = size * 0.14  // star inner radius
  const dot = size * 0.055

  // Build 4-pointed star path (✦)
  function star(cx, cy, outer, inner) {
    const pts = []
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i - Math.PI / 2
      const radius = i % 2 === 0 ? outer : inner
      pts.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`)
    }
    return `M ${pts.join(' L ')} Z`
  }

  const starPath = star(cx, cy, r, r2)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
    <linearGradient id="star" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#818cf8"/>
      <stop offset="100%" style="stop-color:#38bdf8"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="${size * 0.025}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bg)"/>
  <!-- Star glow layer -->
  <path d="${starPath}" fill="url(#star)" opacity="0.35" filter="url(#glow)"
    transform="scale(1.18) translate(${cx * -0.18}, ${cy * -0.18})"/>
  <!-- Star -->
  <path d="${starPath}" fill="url(#star)" filter="url(#glow)"/>
  <!-- Center dot -->
  <circle cx="${cx}" cy="${cy}" r="${dot}" fill="white" opacity="0.9"/>
</svg>`
}

async function generate(size, filename) {
  const svg = Buffer.from(makeSVG(size))
  await sharp(svg).png().toFile(`public/${filename}`)
  console.log(`Generated public/${filename}`)
}

await generate(192, 'pwa-192.png')
await generate(512, 'pwa-512.png')
await generate(180, 'apple-touch-icon.png')
await generate(32,  'favicon.png')
