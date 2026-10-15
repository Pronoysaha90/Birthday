export const LOW = typeof window !== 'undefined' &&
  (window.matchMedia('(max-width:768px)').matches || (navigator.hardwareConcurrency || 8) <= 4)
export const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion:reduce)').matches
