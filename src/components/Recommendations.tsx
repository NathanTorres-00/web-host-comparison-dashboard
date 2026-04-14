import type { ScoredHost } from '../types/host'

type Props = {
  ranked: ScoredHost[]
}

const BAR_DIMS: { key: keyof ScoredHost['breakdown']; label: string; color: string }[] = [
  { key: 'price',       label: 'Price',    color: 'bar-blue' },
  { key: 'security',    label: 'Security', color: 'bar-green' },
  { key: 'ease',        label: 'Ease',     color: 'bar-blue' },
  { key: 'support',     label: 'Support',  color: 'bar-amber' },
  { key: 'performance', label: 'Perf',     color: 'bar-green' },
]

function topReason(s: ScoredHost): string {
  const entries = Object.entries(s.breakdown) as [keyof typeof s.breakdown, number][]
  entries.sort((a, b) => b[1] - a[1])
  const dimLabel: Record<string, string> = {
    price:       'price/value',
    security:    'security posture (as modeled)',
    ease:        'ease of use',
    support:     'support quality',
    performance: 'performance tier',
  }
  const bits = [`Strongest: ${dimLabel[entries[0][0]] ?? entries[0][0]}.`]
  if (s.penalties.length) bits.push(`Watch-out: ${s.penalties[0]}.`)
  return bits.join(' ')
}

const RANK_CLASS = ['rank-1', 'rank-2', 'rank-3']
const RANK_LABEL = ['1st', '2nd', '3rd']

export function Recommendations({ ranked }: Props) {
  const top = ranked.slice(0, 3)

  return (
    <section className="panel rec-panel" aria-labelledby="rec-heading">
      <div className="panel-header">
        <div className="panel-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="panel-heading">
          <h2 id="rec-heading">Top picks (current weights)</h2>
          <p className="panel-lede">
            Ranked by weighted total score. Adjust sliders above to see rankings change in real time.
          </p>
        </div>
      </div>
      <ol className="rec-list">
        {top.map((s, i) => (
          <li key={s.host.id} className="rec-card">
            <div className="rec-card-top">
              <div className={`rec-rank ${RANK_CLASS[i]}`} aria-label={RANK_LABEL[i]}>
                {i + 1}
              </div>
              <div className="rec-host-info">
                <div className="rec-title-row">
                  <h3>{s.host.name}</h3>
                  <span className="rec-score">{s.total.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <p className="rec-reason">{topReason(s)}</p>

            <div className="rec-bars" aria-label="Score breakdown">
              {BAR_DIMS.map(({ key, label, color }) => (
                <div key={key} className="rec-bar-row">
                  <span className="rec-bar-label">{label}</span>
                  <div className="rec-bar-track">
                    <div
                      className={`rec-bar-fill ${color}`}
                      style={{ width: `${s.breakdown[key].toFixed(0)}%` }}
                      role="meter"
                      aria-valuenow={Math.round(s.breakdown[key])}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <span className="rec-bar-val">{s.breakdown[key].toFixed(0)}</span>
                </div>
              ))}
            </div>

            <a
              className="rec-link"
              href={s.host.website}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Visit ${s.host.name} website`}
            >
              Visit {s.host.name} →
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
