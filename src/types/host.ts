/** Curated comparison metrics — illustrative; verify current pricing/features before buying. */

export type MoneyBack = number | 'varies'

export interface HostRecord {
  id: string
  name: string
  website: string
  /** USD/mo typical promo (shared entry tier), illustrative */
  introMonthly: number
  /** USD/mo typical renewal, illustrative */
  renewalMonthly: number
  /** Common billing term in months for promo */
  termMonths: number
  moneyBackDays: MoneyBack
  /** Free migration advertised */
  migrationFree: boolean
  /** SSL included on entry plan */
  sslIncluded: boolean
  /** Daily backups on entry or paid add-on: none | basic | daily */
  backups: 'none' | 'basic' | 'daily'
  wafAvailable: boolean
  malwareProtection: 'none' | 'optional' | 'included'
  twoFactorAccount: boolean
  /** 1–10 */
  panelRating: number
  /** DNS / redirects / cPanel or custom UI ease */
  redirectEase: number
  /** 1–10 */
  supportQuality: number
  /** 1–10 higher = harder onboarding */
  setupDifficulty: number
  /** 1–10 perceived speed/uptime tier */
  performanceTier: number
  /** Sites on entry shared plan (typical marketing) */
  sitesOnEntry: number
  stagingAvailable: boolean
  strengths: string
  limitations: string
  sourceLinks: { label: string; url: string }[]
}

export interface DimensionWeights {
  price: number
  security: number
  ease: number
  support: number
  performance: number
}

export interface ScoredHost {
  host: HostRecord
  total: number
  breakdown: {
    price: number
    security: number
    ease: number
    support: number
    performance: number
  }
  penalties: string[]
}
