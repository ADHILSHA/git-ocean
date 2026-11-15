/**
 * PRD §5 species / colour row. Hex is sRGB; the renderer converts to linear.
 * "Navy" and "grey" are lifted in luminance so they stay readable against the
 * abyss (#00060f); see docs/decisions.md D-03.
 */
export interface Species {
  language: string
  label: string
  hex: string
}

export const SPECIES: Species[] = [
  { language: 'Python', label: 'Python', hex: '#3d7bf0' },
  { language: 'Rust', label: 'Rust', hex: '#ffb48a' },
  { language: 'Go', label: 'Go', hex: '#3fe0ea' },
  { language: 'JavaScript', label: 'JavaScript', hex: '#f5dc4c' },
  { language: 'TypeScript', label: 'TypeScript', hex: '#8fb6ff' },
  { language: 'C', label: 'C', hex: '#9aa6b2' },
  { language: 'C++', label: 'C++', hex: '#5268c9' },
  { language: 'Ruby', label: 'Ruby', hex: '#f0505a' },
  { language: 'Java', label: 'Java', hex: '#c98a4b' },
]

/** Languages outside the PRD table share one pale, unclaimed colour. */
export const OTHER_SPECIES: Species = { language: 'Other', label: 'Other species', hex: '#8fb3a9' }

const byLanguage = new Map(SPECIES.map((s) => [s.language, s]))

export function speciesFor(language: string | null): Species {
  return (language && byLanguage.get(language)) || OTHER_SPECIES
}

export function hexToLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const toLin = (c: number) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return [toLin((n >> 16) & 255), toLin((n >> 8) & 255), toLin(n & 255)]
}
