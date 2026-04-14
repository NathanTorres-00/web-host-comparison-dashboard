import type { DimensionWeights } from '../types/host'
import { WEIGHT_PRESETS } from '../lib/scoring'

type Props = {
  weights: DimensionWeights
  onChange: (w: DimensionWeights) => void
  onPreset: (key: string) => void
}

type DimDef = {
  key: keyof DimensionWeights
  label: string
  plain: string
  measures: string
  color: string
  icon: string
  /**
   * When true the slider is flipped: visually left = high internal weight.
   * "I want cost to be low" → slider left → scoring weight is high.
   */
  invertSlider: boolean
  leftLabel: string   // outcome at slider left
  rightLabel: string  // outcome at slider right
}

const DIMS: DimDef[] = [
  {
    key: 'price',
    label: 'Price',
    plain: 'How price-sensitive are you?',
    measures: 'Intro rate, renewal rate, and money-back window. Penalizes large promo-to-renewal price jumps.',
    color: '#2563eb',
    icon: '💰',
    invertSlider: true,
    leftLabel: 'Lowest cost possible',
    rightLabel: 'Budget is flexible',
  },
  {
    key: 'security',
    label: 'Security',
    plain: 'How important is protecting your sites?',
    measures: 'Free SSL, daily backups, malware scanning, firewall (WAF), and two-factor account login.',
    color: '#16a34a',
    icon: '🔒',
    invertSlider: false,
    leftLabel: 'Basic security is fine',
    rightLabel: 'Security is critical',
  },
  {
    key: 'ease',
    label: 'Ease of use',
    plain: 'How simple does management need to be?',
    measures: 'Control panel quality, redirect and DNS simplicity, setup friction, and staging availability.',
    color: '#7c3aed',
    icon: '🖥️',
    invertSlider: false,
    leftLabel: 'Complexity is ok',
    rightLabel: 'Must be simple',
  },
  {
    key: 'support',
    label: 'Support',
    plain: 'How much do you rely on vendor help?',
    measures: 'Responsiveness, expertise, and availability across chat, phone, and email channels.',
    color: '#0891b2',
    icon: '💬',
    invertSlider: false,
    leftLabel: 'Self-sufficient',
    rightLabel: 'Need strong support',
  },
  {
    key: 'performance',
    label: 'Performance',
    plain: 'How critical is speed and uptime?',
    measures: 'Speed tier and uptime track record drawn from editorial testing roundups.',
    color: '#b45309',
    icon: '⚡',
    invertSlider: false,
    leftLabel: 'Speed is secondary',
    rightLabel: 'Performance critical',
  },
]

function isPresetActive(weights: DimensionWeights, key: string): boolean {
  const p = WEIGHT_PRESETS[key]
  if (!p) return false
  return (Object.keys(p.weights) as (keyof DimensionWeights)[]).every(
    (k) => Math.abs(p.weights[k] - weights[k]) < 0.001,
  )
}

function sumAll(weights: DimensionWeights): number {
  return DIMS.reduce((acc, d) => acc + weights[d.key], 0)
}

function effectivePct(weights: DimensionWeights, key: keyof DimensionWeights): number {
  const total = sumAll(weights)
  if (total <= 0) return 20
  return Math.round((weights[key] / total) * 100)
}

/**
 * Convert the internal weight to the slider's visual position.
 * For inverted dims (price): slider left = high weight, so display = 1 - weight.
 */
function weightToSliderPos(weight: number, invert: boolean): number {
  return invert ? 1 - weight : weight
}

/**
 * Convert the slider's visual position back to an internal weight.
 */
function sliderPosToWeight(pos: number, invert: boolean): number {
  return invert ? 1 - pos : pos
}

const PRESET_ICONS: Record<string, string> = {
  balanced: '⚖️',
  budget:   '💵',
  security: '🛡️',
  ease:     '🎯',
}

export function WeightsPanel({ weights, onChange, onPreset }: Props) {
  const handleSliderChange = (dim: DimDef, rawPos: number) => {
    const newWeight = sliderPosToWeight(rawPos, dim.invertSlider)
    onChange({ ...weights, [dim.key]: newWeight })
  }

  return (
    <section className="panel weights-panel" aria-labelledby="weights-heading">
      {/* Panel header */}
      <div className="panel-header">
        <div className="panel-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h10M4 18h6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="panel-heading">
          <h2 id="weights-heading">What matters most to you?</h2>
          <p className="panel-lede">
            Drag each slider toward the outcome you want. Rankings update instantly.
            The percentage bar shows how your priorities are currently split.
          </p>
        </div>
      </div>

      {/* Quick-start presets */}
      <div className="weights-presets-section">
        <p className="weights-presets-label">Quick-start presets</p>
        <div className="preset-row" role="group" aria-label="Scenario presets">
          {Object.entries(WEIGHT_PRESETS).map(([key, p]) => (
            <button
              key={key}
              type="button"
              className={`preset-btn${isPresetActive(weights, key) ? ' is-active' : ''}`}
              onClick={() => onPreset(key)}
              title={p.description}
            >
              <span className="preset-icon" aria-hidden="true">{PRESET_ICONS[key] ?? '📊'}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Distribution bar */}
      <div className="dist-bar-wrap" aria-label="Priority distribution">
        <p className="dist-bar-label">Your current priority split</p>
        <div className="dist-bar">
          {DIMS.map((d) => {
            const pct = effectivePct(weights, d.key)
            return (
              <div
                key={d.key}
                className="dist-bar-segment"
                style={{ width: `${pct}%`, background: d.color }}
                title={`${d.label}: ${pct}%`}
                aria-label={`${d.label} ${pct}%`}
              />
            )
          })}
        </div>
        <div className="dist-bar-legend">
          {DIMS.map((d) => (
            <span key={d.key} className="dist-legend-item">
              <span className="dist-legend-dot" style={{ background: d.color }} aria-hidden="true" />
              {d.label}&nbsp;<strong>{effectivePct(weights, d.key)}%</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Slider rows */}
      <div className="slider-rows">
        {DIMS.map((d) => {
          const sliderPos = weightToSliderPos(weights[d.key], d.invertSlider)
          const pct = effectivePct(weights, d.key)
          return (
            <div key={d.key} className="slider-row-card">
              {/* Top row: icon + title + live % */}
              <div className="slider-row-top">
                <span className="slider-row-icon" aria-hidden="true">{d.icon}</span>
                <div className="slider-row-text">
                  <span className="slider-row-name">{d.label}</span>
                  <span className="slider-row-plain">{d.plain}</span>
                </div>
                <div className="slider-row-pct" style={{ color: d.color }}>
                  {pct}%
                </div>
              </div>

              {/* Endpoint labels + slider */}
              <div className="slider-row-with-labels">
                <span className="slider-endpoint slider-endpoint-left">{d.leftLabel}</span>
                <div className="slider-row-control">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={sliderPos}
                    onChange={(e) => handleSliderChange(d, Number(e.target.value))}
                    aria-label={`${d.label}: ${d.leftLabel} to ${d.rightLabel}`}
                    style={{ '--slider-color': d.color } as React.CSSProperties}
                  />
                </div>
                <span className="slider-endpoint slider-endpoint-right">{d.rightLabel}</span>
              </div>

              <p className="slider-row-measures">
                <strong>Measures:</strong> {d.measures}
              </p>
            </div>
          )
        })}
      </div>

      <p className="weights-footer-note">
        Sliders are relative — increasing one automatically reduces the share of the others.
        The percentages above each slider show that dimension's share of the total score.
      </p>
    </section>
  )
}
