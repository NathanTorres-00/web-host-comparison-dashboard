import { useMemo, useState } from 'react'
import type { ScoredHost } from '../types/host'

type SortKey =
  | 'total'
  | 'name'
  | 'introMonthly'
  | 'renewalMonthly'
  | 'supportQuality'
  | 'performanceTier'

type Props = {
  scored: ScoredHost[]
}

type Row = ScoredHost & { renewalJump: number }

function prepareRows(scored: ScoredHost[]): Row[] {
  return scored.map((s) => ({
    ...s,
    renewalJump: s.host.renewalMonthly / Math.max(s.host.introMonthly, 0.01),
  }))
}

function YesNo({ val }: { val: boolean }) {
  return <span className={val ? 'chip-yes' : 'chip-no'}>{val ? 'Yes' : 'No'}</span>
}

function BackupChip({ val }: { val: 'daily' | 'basic' | 'none' }) {
  const cls = val === 'daily' ? 'chip-daily' : val === 'basic' ? 'chip-basic' : 'chip-none'
  return <span className={cls}>{val}</span>
}

function MalwareChip({ val }: { val: 'included' | 'optional' | 'none' }) {
  const cls = val === 'included' ? 'chip-included' : val === 'optional' ? 'chip-optional' : 'chip-none'
  return <span className={cls}>{val}</span>
}

function ScoreCell({ val }: { val: number }) {
  const cls = val >= 70 ? 'score-high' : val >= 45 ? 'score-mid' : 'score-low'
  return <span className={cls}>{val.toFixed(1)}</span>
}

function JumpCell({ val }: { val: number }) {
  const cls = val > 5 ? 'score-low' : val > 3 ? 'score-mid' : 'score-high'
  return <span className={cls}>{val.toFixed(1)}×</span>
}

type ColDef = {
  id: string
  label: string
  short: string
  sortKey?: SortKey
  align?: 'left' | 'right'
  render: (r: Row) => React.ReactNode
  sortValue: (r: Row) => number | string
  /** string value used for uniform-col detection */
  strValue: (r: Row) => string
}

const COLS: ColDef[] = [
  {
    id: 'name',
    label: 'Provider',
    short: 'Host',
    sortKey: 'name',
    align: 'left',
    render: (r) => (
      <a href={r.host.website} target="_blank" rel="noreferrer noopener">
        {r.host.name}
      </a>
    ),
    sortValue: (r) => r.host.name.toLowerCase(),
    strValue: (r) => r.host.name,
  },
  {
    id: 'total',
    label: 'Weighted score',
    short: 'Score',
    sortKey: 'total',
    align: 'right',
    render: (r) => <ScoreCell val={r.total} />,
    sortValue: (r) => r.total,
    strValue: (r) => r.total.toFixed(1),
  },
  {
    id: 'intro',
    label: 'Intro $/mo (illustrative)',
    short: 'Intro',
    sortKey: 'introMonthly',
    align: 'right',
    render: (r) => `$${r.host.introMonthly.toFixed(2)}`,
    sortValue: (r) => r.host.introMonthly,
    strValue: (r) => r.host.introMonthly.toFixed(2),
  },
  {
    id: 'renew',
    label: 'Renewal $/mo (illustrative)',
    short: 'Renew',
    sortKey: 'renewalMonthly',
    align: 'right',
    render: (r) => `$${r.host.renewalMonthly.toFixed(2)}`,
    sortValue: (r) => r.host.renewalMonthly,
    strValue: (r) => r.host.renewalMonthly.toFixed(2),
  },
  {
    id: 'jump',
    label: 'Renewal ÷ intro (promo jump)',
    short: '×Jump',
    align: 'right',
    render: (r) => <JumpCell val={r.renewalJump} />,
    sortValue: (r) => r.renewalJump,
    strValue: (r) => r.renewalJump.toFixed(1),
  },
  {
    id: 'ssl',
    label: 'Free SSL included',
    short: 'SSL',
    align: 'right',
    render: (r) => <YesNo val={r.host.sslIncluded} />,
    sortValue: (r) => (r.host.sslIncluded ? 1 : 0),
    strValue: (r) => String(r.host.sslIncluded),
  },
  {
    id: 'backups',
    label: 'Backups (modeled tier)',
    short: 'Bkup',
    align: 'left',
    render: (r) => <BackupChip val={r.host.backups} />,
    sortValue: (r) => r.host.backups,
    strValue: (r) => r.host.backups,
  },
  {
    id: 'waf',
    label: 'WAF / DDoS protection available',
    short: 'WAF',
    align: 'right',
    render: (r) => <YesNo val={r.host.wafAvailable} />,
    sortValue: (r) => (r.host.wafAvailable ? 1 : 0),
    strValue: (r) => String(r.host.wafAvailable),
  },
  {
    id: 'malware',
    label: 'Malware tooling',
    short: 'Malware',
    align: 'left',
    render: (r) => <MalwareChip val={r.host.malwareProtection} />,
    sortValue: (r) => r.host.malwareProtection,
    strValue: (r) => r.host.malwareProtection,
  },
  {
    id: '2fa',
    label: 'Account 2FA support',
    short: '2FA',
    align: 'right',
    render: (r) => <YesNo val={r.host.twoFactorAccount} />,
    sortValue: (r) => (r.host.twoFactorAccount ? 1 : 0),
    strValue: (r) => String(r.host.twoFactorAccount),
  },
  {
    id: 'panel',
    label: 'Control panel rating (1–10)',
    short: 'Panel',
    align: 'right',
    render: (r) => r.host.panelRating,
    sortValue: (r) => r.host.panelRating,
    strValue: (r) => String(r.host.panelRating),
  },
  {
    id: 'redirect',
    label: 'Redirect / DNS ease (1–10)',
    short: 'DNS ease',
    align: 'right',
    render: (r) => r.host.redirectEase,
    sortValue: (r) => r.host.redirectEase,
    strValue: (r) => String(r.host.redirectEase),
  },
  {
    id: 'support',
    label: 'Support quality (1–10)',
    short: 'Support',
    sortKey: 'supportQuality',
    align: 'right',
    render: (r) => r.host.supportQuality,
    sortValue: (r) => r.host.supportQuality,
    strValue: (r) => String(r.host.supportQuality),
  },
  {
    id: 'perf',
    label: 'Performance tier (1–10)',
    short: 'Perf',
    sortKey: 'performanceTier',
    align: 'right',
    render: (r) => r.host.performanceTier,
    sortValue: (r) => r.host.performanceTier,
    strValue: (r) => String(r.host.performanceTier),
  },
  {
    id: 'sites',
    label: 'Sites on entry plan (modeled)',
    short: 'Sites',
    align: 'right',
    render: (r) => r.host.sitesOnEntry,
    sortValue: (r) => r.host.sitesOnEntry,
    strValue: (r) => String(r.host.sitesOnEntry),
  },
  {
    id: 'staging',
    label: 'Staging environment',
    short: 'Staging',
    align: 'right',
    render: (r) => <YesNo val={r.host.stagingAvailable} />,
    sortValue: (r) => (r.host.stagingAvailable ? 1 : 0),
    strValue: (r) => String(r.host.stagingAvailable),
  },
  {
    id: 'migrate',
    label: 'Free migration advertised',
    short: 'Migration',
    align: 'right',
    render: (r) => <YesNo val={r.host.migrationFree} />,
    sortValue: (r) => (r.host.migrationFree ? 1 : 0),
    strValue: (r) => String(r.host.migrationFree),
  },
]

function sortRows(rows: Row[], key: SortKey, dir: 'asc' | 'desc'): Row[] {
  const copy = [...rows]
  const mult = dir === 'asc' ? 1 : -1
  copy.sort((a, b) => {
    let av: number | string = 0
    let bv: number | string = 0
    switch (key) {
      case 'total':         av = a.total;              bv = b.total;              break
      case 'name':          av = a.host.name.toLowerCase(); bv = b.host.name.toLowerCase(); break
      case 'introMonthly':  av = a.host.introMonthly;  bv = b.host.introMonthly;  break
      case 'renewalMonthly':av = a.host.renewalMonthly;bv = b.host.renewalMonthly;break
      case 'supportQuality':av = a.host.supportQuality;bv = b.host.supportQuality;break
      case 'performanceTier':av = a.host.performanceTier;bv = b.host.performanceTier;break
      default:              av = a.total;              bv = b.total
    }
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mult
    return String(av).localeCompare(String(bv)) * mult
  })
  return copy
}

export function ComparisonTable({ scored }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [pinned, setPinned] = useState<Set<string>>(() => new Set())
  const [hideUniform, setHideUniform] = useState(false)

  const rows = useMemo(() => prepareRows(scored), [scored])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.host.name.toLowerCase().includes(q))
  }, [rows, search])

  const sorted = useMemo(() => {
    const pins = sortRows(filtered.filter((r) => pinned.has(r.host.id)), sortKey, sortDir)
    const rest = sortRows(filtered.filter((r) => !pinned.has(r.host.id)), sortKey, sortDir)
    return [...pins, ...rest]
  }, [filtered, sortKey, sortDir, pinned])

  const visibleCols = useMemo(() => {
    if (!hideUniform || sorted.length <= 1) return COLS
    return COLS.filter((col) => {
      const first = col.strValue(sorted[0])
      return sorted.some((r) => col.strValue(r) !== first)
    })
  }, [sorted, hideUniform])

  const togglePin = (id: string) => {
    setPinned((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const onHeaderClick = (col: ColDef) => {
    if (!col.sortKey) return
    if (sortKey === col.sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col.sortKey)
      setSortDir(col.sortKey === 'name' ? 'asc' : 'desc')
    }
  }

  return (
    <section className="panel table-panel" aria-labelledby="table-heading">
      <div className="panel-header">
        <div className="panel-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10h18M3 6h18M3 14h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="panel-heading">
          <h2 id="table-heading">Full comparison table</h2>
          <p className="panel-lede">
            Click column headers to sort. Pin rows to keep them at the top. Hide identical columns to focus on differences.
          </p>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="search-field">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Filter by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Filter hosts by name"
          />
        </div>
        <label className="check-field">
          <input
            type="checkbox"
            checked={hideUniform}
            onChange={(e) => setHideUniform(e.target.checked)}
          />
          Hide identical columns
        </label>
      </div>

      <div className="table-wrap" role="region" aria-label="Host comparison table" tabIndex={0}>
        <table className="compare-table">
          <thead>
            <tr>
              <th scope="col" className="pin-col">
                <abbr title="Pin row to top">📌</abbr>
              </th>
              {visibleCols.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={col.sortKey ? 'sortable' : ''}
                  aria-sort={
                    col.sortKey && sortKey === col.sortKey
                      ? sortDir === 'asc' ? 'ascending' : 'descending'
                      : undefined
                  }
                >
                  {col.sortKey ? (
                    <button type="button" className="th-btn" onClick={() => onHeaderClick(col)}>
                      <abbr title={col.label}>{col.short}</abbr>
                      {sortKey === col.sortKey && (
                        <span aria-hidden="true">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </button>
                  ) : (
                    <abbr title={col.label}>{col.short}</abbr>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.host.id} className={pinned.has(r.host.id) ? 'is-pinned' : undefined}>
                <td className="pin-col">
                  <input
                    type="checkbox"
                    checked={pinned.has(r.host.id)}
                    onChange={() => togglePin(r.host.id)}
                    aria-label={`Pin ${r.host.name}`}
                  />
                </td>
                {visibleCols.map((col) => (
                  <td key={col.id} className={col.align === 'right' ? 'num' : ''}>
                    {col.render(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="host-notes">
        <summary>Strengths, limitations & sources ▾</summary>
        <ul className="notes-list">
          {sorted.map((r) => (
            <li key={r.host.id}>
              <strong>{r.host.name}:</strong> {r.host.strengths}{' '}
              <em className="limitation">Limitations: {r.host.limitations}</em>
              {r.penalties.length > 0 && (
                <span className="flags">⚠ Flags: {r.penalties.join('; ')}</span>
              )}
              <span className="source-links">
                Sources:{' '}
                {r.host.sourceLinks.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 ? ', ' : ''}
                    <a href={s.url} target="_blank" rel="noreferrer noopener">
                      {s.label}
                    </a>
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}
