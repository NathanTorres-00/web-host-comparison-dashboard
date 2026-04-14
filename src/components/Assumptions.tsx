import { DATA_AS_OF } from '../data/hosts'

const ITEMS = [
  {
    title: 'Data freshness',
    body: (
      <>
        Curated illustrative fields as of <time dateTime={DATA_AS_OF}>{DATA_AS_OF}</time>.
        Promo and renewal prices change frequently — verify directly on each vendor's site before purchasing.
      </>
    ),
  },
  {
    title: 'Not a security audit',
    body: 'Scores reflect a simplified model (SSL, backups, WAF, malware tooling, 2FA). Your actual risk depends on configuration, plugins, passwords, and site code — not just the hosting platform.',
  },
  {
    title: 'Normalization scope',
    body: 'Metrics are compared only across the 10 hosts in this dashboard. A score of "90" means strong relative to this list, not 90% of some absolute ideal.',
  },
  {
    title: 'Penalty flags',
    body: 'Red flag indicators appear when a renewal is significantly higher than the intro rate, migration is not free, or no backups are modeled on the entry tier.',
  },
  {
    title: 'Editorial context',
    body: (
      <>
        Host selection aligns with 2026 roundups from{' '}
        <a href="https://www.pcmag.com/picks/the-best-web-hosting-services" target="_blank" rel="noreferrer noopener">
          PCMag
        </a>
        ,{' '}
        <a href="https://www.cnet.com/tech/services-and-software/best-web-hosting/" target="_blank" rel="noreferrer noopener">
          CNET
        </a>
        , and{' '}
        <a href="https://www.techradar.com/web-hosting/best-web-hosting-service-websites" target="_blank" rel="noreferrer noopener">
          TechRadar
        </a>
        .
      </>
    ),
  },
  {
    title: 'Your workflow context',
    body: 'You build sites in Wix and host DNS/domains via a separate provider. This tool focuses on traditional web hosting — compare registrar and DNS forwarding quality separately.',
  },
]

export function Assumptions() {
  return (
    <section className="panel assumptions" aria-labelledby="assume-heading">
      <div className="panel-header">
        <div className="panel-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="panel-heading">
          <h2 id="assume-heading">Assumptions, sources & caveats</h2>
          <p className="panel-lede">
            Read before making purchasing decisions. This tool is decision support only.
          </p>
        </div>
      </div>
      <div className="assume-grid">
        {ITEMS.map((item) => (
          <div key={item.title} className="assume-item">
            <strong>{item.title}</strong>
            {item.body}
          </div>
        ))}
      </div>
    </section>
  )
}
