import { T } from '../tokens'

/** Animated aurora background — radial blobs + grain overlay. Positioned absolute. */
export function Aurora() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Pearl base */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(120% 80% at 0% 0%, #ffffff 0%, transparent 60%),
          radial-gradient(100% 70% at 100% 100%, #eef0ff 0%, transparent 60%),
          linear-gradient(180deg, ${T.bg} 0%, ${T.bg2} 100%)
        `,
      }} />
      {/* Indigo blob */}
      <div style={{
        position: 'absolute', width: 300, height: 300, top: -80, right: -100,
        background: `radial-gradient(circle, ${T.indigo}55 0%, transparent 65%)`,
        filter: 'blur(30px)',
      }} />
      {/* Cyan blob */}
      <div style={{
        position: 'absolute', width: 260, height: 260, bottom: -60, left: -80,
        background: `radial-gradient(circle, ${T.cyan}44 0%, transparent 65%)`,
        filter: 'blur(30px)',
      }} />
      {/* Lavender blob */}
      <div style={{
        position: 'absolute', width: 200, height: 200, top: '45%', left: '55%',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, oklch(0.85 0.12 320 / 0.4) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      {/* Subtle grain */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.25, mixBlendMode: 'multiply',
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.4  0 0 0 0 0.42  0 0 0 0 0.55  0 0 0 0.08 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
      }} />
    </div>
  )
}
