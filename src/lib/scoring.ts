import { HOSTS } from '../data/hosts'
import type { DimensionWeights, HostRecord, MoneyBack, ScoredHost } from '../types/host'

function moneyBackNumeric(m: MoneyBack): number {
  if (m === 'varies') return 30
  return m
}

function minMax<T>(items: T[], pick: (t: T) => number): { min: number; max: number } {
  const vals = items.map(pick)
  return { min: Math.min(...vals), max: Math.max(...vals) }
}

function norm(lowerIsBetter: boolean, value: number, min: number, max: number): number {
  if (max === min) return 55
  const t = (value - min) / (max - min)
  return lowerIsBetter ? (1 - t) * 100 : t * 100
}

function backupScore(b: HostRecord['backups']): number {
  switch (b) {
    case 'daily':
      return 100
    case 'basic':
      return 65
    default:
      return 35
  }
}

function malwareScore(m: HostRecord['malwareProtection']): number {
  switch (m) {
    case 'included':
      return 100
    case 'optional':
      return 70
    default:
      return 40
  }
}

export function scoreDimensions(hosts: HostRecord[] = HOSTS) {
  const intro = minMax(hosts, (h) => h.introMonthly)
  const renew = minMax(hosts, (h) => h.renewalMonthly)
  const mb = minMax(hosts, (h) => moneyBackNumeric(h.moneyBackDays))

  return hosts.map((h) => {
    const penalties: string[] = []
    const renewalJump = h.renewalMonthly / Math.max(h.introMonthly, 0.01)
    if (renewalJump > 4) penalties.push('Large promo→renewal price jump')
    if (!h.migrationFree) penalties.push('Migration may cost extra')
    if (h.backups === 'none') penalties.push('No routine backups on entry tier (as modeled)')

    const priceIntro = norm(true, h.introMonthly, intro.min, intro.max)
    const priceRenew = norm(true, h.renewalMonthly, renew.min, renew.max)
    const priceMb = norm(false, moneyBackNumeric(h.moneyBackDays), mb.min, mb.max)
    let price =
      0.45 * priceIntro + 0.45 * priceRenew + 0.1 * priceMb
    if (renewalJump > 5) price -= 8
    if (renewalJump > 8) price -= 7
    price = Math.max(0, Math.min(100, price))

    const security =
      0.18 * (h.sslIncluded ? 100 : 60) +
      0.22 * backupScore(h.backups) +
      0.15 * (h.wafAvailable ? 100 : 55) +
      0.25 * malwareScore(h.malwareProtection) +
      0.2 * (h.twoFactorAccount ? 100 : 50)

    const ease =
      0.35 * (h.panelRating * 10) +
      0.3 * (h.redirectEase * 10) +
      0.2 * (10 - h.setupDifficulty) * 10 +
      0.15 * (h.stagingAvailable ? 100 : 65)

    const support = h.supportQuality * 10

    const performance = h.performanceTier * 10

    return {
      host: h,
      breakdown: { price, security, ease, support, performance },
      penalties,
    }
  })
}

function normalizeWeights(w: DimensionWeights): DimensionWeights {
  const sum = w.price + w.security + w.ease + w.support + w.performance
  if (sum <= 0) return { price: 0.2, security: 0.2, ease: 0.2, support: 0.2, performance: 0.2 }
  return {
    price: w.price / sum,
    security: w.security / sum,
    ease: w.ease / sum,
    support: w.support / sum,
    performance: w.performance / sum,
  }
}

export function scoreHosts(weights: DimensionWeights): ScoredHost[] {
  const nw = normalizeWeights(weights)
  const dims = scoreDimensions()
  const scored: ScoredHost[] = dims.map((d) => {
    const { breakdown } = d
    const total =
      nw.price * breakdown.price +
      nw.security * breakdown.security +
      nw.ease * breakdown.ease +
      nw.support * breakdown.support +
      nw.performance * breakdown.performance
    return {
      host: d.host,
      total,
      breakdown,
      penalties: d.penalties,
    }
  })
  return scored.sort((a, b) => b.total - a.total)
}

export const WEIGHT_PRESETS: Record<
  string,
  { label: string; description: string; weights: DimensionWeights }
> = {
  balanced: {
    label: 'Balanced',
    description: 'Equal emphasis across dimensions.',
    weights: { price: 0.2, security: 0.2, ease: 0.2, support: 0.2, performance: 0.2 },
  },
  budget: {
    label: 'Budget-first',
    description: 'Prioritize low promo and renewal cost.',
    weights: { price: 0.5, security: 0.15, ease: 0.2, support: 0.1, performance: 0.05 },
  },
  security: {
    label: 'Security-first',
    description: 'Backups, malware/WAF posture, and account safety features.',
    weights: { price: 0.1, security: 0.45, ease: 0.15, support: 0.15, performance: 0.15 },
  },
  ease: {
    label: 'Ease-first',
    description: 'Panel quality, redirects/DNS workflows, and gentle setup.',
    weights: { price: 0.15, security: 0.15, ease: 0.45, support: 0.15, performance: 0.1 },
  },
}
