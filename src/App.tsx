import './App.css'

type Packet = {
  id: number
  style: React.CSSProperties
}

const packets: Packet[] = Array.from({ length: 14 }, (_, index) => {
  const drift = ((index % 5) - 2) * 18
  const delay = `${index * 0.35}s`
  const duration = `${3.6 + (index % 4) * 0.55}s`
  const lane = `${20 + (index % 6) * 12}%`

  return {
    id: index,
    style: {
      '--delay': delay,
      '--duration': duration,
      '--drift': `${drift}px`,
      '--lane': lane,
    } as React.CSSProperties,
  }
})

function App() {
  return (
    <main className="battle-page">
      <header className="battle-header">
        <p className="eyebrow">Realtime Simulation</p>
        <h1>Cyber Battle Animation</h1>
        <p className="subtitle">
          Autonomous defense core versus hostile botnet swarm. Pulses, packet
          trails, and shield responses are rendered with pure React and CSS.
        </p>
      </header>

      <section className="arena" aria-label="Animated cyber battle scene">
        <div className="atmosphere" aria-hidden="true"></div>

        <div className="node defender">
          <span className="label">Defense Core</span>
          <span className="ring ring-1"></span>
          <span className="ring ring-2"></span>
          <span className="ring ring-3"></span>
          <span className="core"></span>
        </div>

        <div className="node attacker">
          <span className="label">Botnet Hive</span>
          <span className="ring ring-1"></span>
          <span className="ring ring-2"></span>
          <span className="core"></span>
        </div>

        <div className="beam beam-a" aria-hidden="true"></div>
        <div className="beam beam-b" aria-hidden="true"></div>

        <div className="packets" aria-hidden="true">
          {packets.map((packet) => (
            <span key={packet.id} className="packet" style={packet.style}></span>
          ))}
        </div>

        <div className="scanline" aria-hidden="true"></div>
      </section>

      <section className="battle-notes">
        <h2>Why it does not animate in GitHub mobile app</h2>
        <p>
          GitHub app previews repository files and README markdown, but it does
          not execute this React runtime. Open the running app URL or a deployed
          site to view the live animation.
        </p>
      </section>
    </main>
  )
}

export default App
