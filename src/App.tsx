import { useMemo, useState } from 'react'
import './App.css'
import type { DimensionWeights } from './types/host'
import { scoreHosts, WEIGHT_PRESETS } from './lib/scoring'
import { WeightsPanel } from './components/WeightsPanel'
import { ComparisonTable } from './components/ComparisonTable'
import { Recommendations } from './components/Recommendations'
import { Assumptions } from './components/Assumptions'
import { DATA_AS_OF } from './data/hosts'
import { HOSTS } from './data/hosts'

const DEFAULT_WEIGHTS: DimensionWeights = WEIGHT_PRESETS.balanced.weights

const FORMULA_ITEMS = [
  {
    label: 'Price',
    desc: 'Blends normalized intro rate, renewal rate, and money-back window. Extra penalty applied when renewal is many times the intro rate.',
  },
  {
    label: 'Security',
    desc: 'Blends SSL inclusion, backup tier, WAF availability, malware tooling, and account 2FA — sourced from public feature lists.',
  },
  {
    label: 'Ease of use',
    desc: 'Blends panel rating, redirect/DNS ease, inverted setup difficulty, and staging availability.',
  },
  {
    label: 'Support / Performance',
    desc: 'Subjective 1–10 inputs scaled to 0–100 (illustrative editorial scores).',
  },
]

function App() {
  const [weights, setWeights] = useState<DimensionWeights>(DEFAULT_WEIGHTS)
  const scored = useMemo(() => scoreHosts(weights), [weights])

  const applyPreset = (key: string) => {
    const p = WEIGHT_PRESETS[key]
    if (p) setWeights({ ...p.weights })
  }

  return (
    <>
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-brand">
            <div className="topbar-icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 3h14v2H1zM1 7h9v2H1zM1 11h11v2H1z" />
              </svg>
            </div>
            <span className="topbar-title">Web Host Comparison</span>
          </div>
          <span className="topbar-badge">Decision support · {DATA_AS_OF}</span>
        </div>
      </div>

      <div className="app">
        {/* Hero */}
        <header className="hero">
          <p className="hero-badge">Updated {DATA_AS_OF}</p>
          <h1>
            Find the right <span>web hosting</span> provider
          </h1>
          <p className="hero-sub">
            Compare {HOSTS.length} major hosting providers with adjustable priorities — price, security, ease of use,
            support, and performance. Illustrative pricing; always confirm on the vendor site.
          </p>
          <div className="hero-stats">
            <span className="hero-stat">
              <strong>{HOSTS.length}</strong> providers
            </span>
            <span className="hero-stat">
              <strong>5</strong> scoring dimensions
            </span>
            <span className="hero-stat">
              <strong>4</strong> scenario presets
            </span>
            <span className="hero-stat">
              Data as of <strong>{DATA_AS_OF}</strong>
            </span>
          </div>
        </header>

        {/* Weights */}
        <WeightsPanel weights={weights} onChange={setWeights} onPreset={applyPreset} />

        {/* Top picks */}
        <Recommendations ranked={scored} />

        {/* Scoring formula */}
        <section className="panel formula-panel" aria-labelledby="formula-heading">
          <div className="panel-header">
            <div className="panel-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 7h6m-6 4h4m-4 4h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div className="panel-heading">
              <h2 id="formula-heading">How scoring works</h2>
              <p className="panel-lede">
                Each host gets sub-scores 0–100 per dimension. Your sliders set relative importance; weights normalize
                to sum to 1. Total&nbsp;=&nbsp;Σ&thinsp;(weight<sub>i</sub>&thinsp;×&thinsp;subscore<sub>i</sub>).
              </p>
            </div>
          </div>
          <div className="formula-grid">
            {FORMULA_ITEMS.map((f) => (
              <div key={f.label} className="formula-card">
                <strong>{f.label}</strong>
                {f.desc}
              </div>
            ))}
          </div>
        </section>

        {/* Full table */}
        <ComparisonTable scored={scored} />

        {/* Assumptions */}
        <Assumptions />
      </div>
    </>
  )
}

export default App
