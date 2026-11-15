/** Pointer state shared with the shaders (cursor flee) without React re-renders. */
export const pointer = {
  ndc: { x: 9, y: 9 },
  /** Rises with pointer speed, decays when the pointer rests; small fish only flee while it is up. */
  energy: 0,
}

export function trackPointer(el: HTMLElement) {
  let last = { x: 0, y: 0, t: 0 }
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    pointer.ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1
    pointer.ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1
    const now = performance.now()
    const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y)
    if (last.t && now - last.t < 200) pointer.energy = Math.min(1.4, pointer.energy + dist / 140)
    last = { x: e.clientX, y: e.clientY, t: now }
  }
  const leave = () => {
    pointer.ndc.x = 9
    pointer.ndc.y = 9
  }
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerdown', move)
  el.addEventListener('pointerleave', leave)
  return () => {
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerdown', move)
    el.removeEventListener('pointerleave', leave)
  }
}
