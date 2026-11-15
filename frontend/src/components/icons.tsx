/** Authored icons: 1.6px stroke, round caps, 20px box. */
type P = { className?: string }
const base = { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

export const SonarIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="8.5" cy="8.5" r="5.5" />
    <path d="M12.6 12.6 17 17" />
    <path d="M6.2 8.5a2.3 2.3 0 0 1 2.3-2.3" />
  </svg>
)
export const ArrowRight = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 10h11M11 6l4 4-4 4" />
  </svg>
)
export const CloseIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 5l10 10M15 5 5 15" />
  </svg>
)
export const StarIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m10 3 2.1 4.4 4.7.6-3.4 3.3.9 4.7L10 13.8 5.7 16l.9-4.7L3.2 8l4.7-.6z" />
  </svg>
)
export const LinkIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.8.8" />
    <path d="M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.8-.8" />
  </svg>
)
export const NetIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3 5l14 10M3 10l9 6.5M8 3.5l9 6.5M17 5 3 15M17 10l-9 6.5M12 3.5 3 10" />
  </svg>
)
export const DiveIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M10 3v12M5.5 10.5 10 15l4.5-4.5" />
    <path d="M4 17.5h12" />
  </svg>
)
