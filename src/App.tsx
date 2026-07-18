import { useEffect, useState } from 'react'
import './App.css'

type Packet = {
  id: number
  style: React.CSSProperties
}

type Winner = 'defender' | 'attacker' | null
type Phase = 'probing' | 'firewall-hold' | 'breach-attempt'

type BattleState = {
  defender: number
  attacker: number
  winner: Winner
  phase: Phase
  round: number
}

const MAX_HEALTH = 100

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

const initialBattleState: BattleState = {
  defender: MAX_HEALTH,
  attacker: MAX_HEALTH,
  winner: null,
  phase: 'probing',
  round: 1,
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function App() {
  const [battle, setBattle] = useState<BattleState>(initialBattleState)

  useEffect(() => {
    if (battle.winner) {
      return
    }

    const timer = window.setInterval(() => {
      setBattle((current) => {
        if (current.winner) {
          return current
        }

        const attackerStrike = 9 + Math.floor(Math.random() * 11)
        const defenderStrike = 7 + Math.floor(Math.random() * 13)
        const defenderPatch = Math.random() < 0.22 ? 5 : 0
        const attackerSurge = Math.random() < 0.18 ? 4 : 0

        const nextDefender = clamp(
          current.defender - attackerStrike + defenderPatch,
          0,
          MAX_HEALTH,
        )
        const nextAttacker = clamp(
          current.attacker - defenderStrike + attackerSurge,
          0,
          MAX_HEALTH,
        )

        let phase: Phase = 'probing'
        const healthGap = nextDefender - nextAttacker
        if (Math.abs(healthGap) < 14) {
          phase = 'breach-attempt'
        } else if (healthGap > 0) {
          phase = 'firewall-hold'
        }

        let winner: Winner = null
        if (nextDefender <= 0 || nextAttacker <= 0) {
          winner = nextDefender > nextAttacker ? 'defender' : 'attacker'
        }

        return {
          ...current,
          defender: nextDefender,
          attacker: nextAttacker,
          phase,
          winner,
        }
      })
    }, 900)

    return () => window.clearInterval(timer)
  }, [battle.winner])

  useEffect(() => {
    if (!battle.winner) {
      return
    }

    const resetTimer = window.setTimeout(() => {
      setBattle((current) => ({
        defender: MAX_HEALTH,
        attacker: MAX_HEALTH,
        winner: null,
        phase: 'probing',
        round: current.round + 1,
      }))
    }, 3200)

    return () => window.clearTimeout(resetTimer)
  }, [battle.winner])

  const defenderCompromised = battle.defender <= 34
  const attackerCompromised = battle.attacker <= 34

  const statusText = battle.winner
    ? battle.winner === 'defender'
      ? 'Defense Core neutralized the botnet wave.'
      : 'Botnet Hive breached the perimeter.'
    : battle.phase === 'firewall-hold'
      ? 'Defense Core is forcing the swarm backward.'
      : battle.phase === 'breach-attempt'
        ? 'Critical exchange detected. Countermeasures unstable.'
        : 'Botnet probes are searching for weak points.'

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

        <div className="battle-hud" role="status" aria-live="polite">
          <div className="meter defender-meter">
            <span>Defense {battle.defender}%</span>
            <div className="track">
              <i style={{ width: `${battle.defender}%` }}></i>
            </div>
          </div>
          <div className="round">Round {battle.round}</div>
          <div className="meter attacker-meter">
            <span>Botnet {battle.attacker}%</span>
            <div className="track">
              <i style={{ width: `${battle.attacker}%` }}></i>
            </div>
          </div>
        </div>

        <div
          className={`node defender ${defenderCompromised ? 'compromised' : ''} ${battle.winner === 'attacker' ? 'defeated' : ''}`}
        >
          <span className="label">Defense Core</span>
          <span className="ring ring-1"></span>
          <span className="ring ring-2"></span>
          <span className="ring ring-3"></span>
          <span className="core"></span>
        </div>

        <div
          className={`node attacker ${attackerCompromised ? 'compromised' : ''} ${battle.winner === 'defender' ? 'defeated' : ''}`}
        >
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

        <div className="battle-banner" role="status" aria-live="polite">
          <strong>{battle.phase.replace('-', ' ')}</strong>
          <p>{statusText}</p>
        </div>
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
