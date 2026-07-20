import { useMemo, useState } from 'react'
import './App.css'

type Packet = {
  id: number
  style: React.CSSProperties
}

type Winner = 'defender' | 'attacker' | null

type Phase = 'probing' | 'firewall-hold' | 'breach-attempt' | 'counterstrike' | 'systems-upgrade'

type ActionType = 'attack' | 'defend' | 'upgrade'

type BattleState = {
  defender: number
  attacker: number
  winner: Winner
  phase: Phase
  round: number
  level: number
  score: number
  defense: number
  offense: number
  log: string
}

const MAX_HEALTH = 100
const MAX_SKILL = 10
const MAX_LEVEL = 10

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const makePackets = (intensity: number): Packet[] =>
  Array.from({ length: 14 }, (_, index) => {
    const drift = ((index % 5) - 2) * 18
    const delay = `${index * 0.28}s`
    const duration = `${3.5 + (index % 4) * 0.45}s`
    const lane = `${20 + (index % 6) * 12}%`

    return {
      id: index,
      style: {
        '--delay': delay,
        '--duration': duration,
        '--drift': `${drift * intensity}px`,
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
  level: 1,
  score: 0,
  defense: 5,
  offense: 5,
  log: 'Choose an action to begin the battle.',
}

function App() {
  const [battle, setBattle] = useState<BattleState>(initialBattleState)

  const packets = useMemo(
    () => makePackets(0.6 + battle.level * 0.06),
    [battle.level],
  )

  const applyAction = (action: ActionType) => {
    setBattle((current) => {
      if (current.winner) {
        return current
      }

      const offenseBoost = current.offense * 1.8
      const defenseBoost = current.defense * 1.8
      const levelBonus = current.level - 1

      let nextDefender = current.defender
      let nextAttacker = current.attacker
      let nextScore = current.score
      let nextPhase: Phase = 'probing'
      let nextLog = current.log
      let nextDefense = current.defense
      let nextOffense = current.offense

      if (action === 'attack') {
        const attackPower = 12 + offenseBoost + levelBonus * 2 + Math.floor(Math.random() * 8)
        const counterDamage = 6 + current.defense + Math.floor(Math.random() * 6)
        nextAttacker = clamp(current.attacker - counterDamage, 0, MAX_HEALTH)
        nextDefender = clamp(current.defender - attackPower, 0, MAX_HEALTH)
        nextScore += Math.round(attackPower * 1.1)
        nextPhase = nextDefender < nextAttacker ? 'breach-attempt' : 'counterstrike'
        nextLog = `Offense launched a breach attempt for ${Math.round(attackPower)} damage.`
      }

      if (action === 'defend') {
        const block = 14 + defenseBoost + Math.floor(Math.random() * 7)
        const incoming = 10 + levelBonus + Math.floor(Math.random() * 7)
        nextDefender = clamp(current.defender - Math.max(0, incoming - block), 0, MAX_HEALTH)
        nextAttacker = clamp(current.attacker - Math.floor(block / 2), 0, MAX_HEALTH)
        nextScore += Math.round(block * 0.8)
        nextPhase = 'firewall-hold'
        nextLog = `Defense reinforced the firewall and blocked ${Math.round(block)} threat.`
      }

      if (action === 'upgrade') {
        nextDefense = clamp(current.defense + 1, 1, MAX_SKILL)
        nextOffense = clamp(current.offense + 1, 1, MAX_SKILL)
        nextScore += 25
        nextPhase = 'systems-upgrade'
        nextLog = 'Systems upgraded. Offense and defense increased by 1.'
        nextDefender = clamp(current.defender + 8, 0, MAX_HEALTH)
      }

      const threshold = current.level * 120
      const leveledUp = nextScore >= threshold && current.level < MAX_LEVEL
      const nextLevel = leveledUp ? current.level + 1 : current.level
      const adjustedScore = leveledUp ? nextScore + 40 : nextScore

      let winner: Winner = null
      if (nextDefender <= 0 || nextAttacker <= 0) {
        winner = nextDefender > nextAttacker ? 'defender' : 'attacker'
        nextLog =
          winner === 'defender'
            ? 'Defense Core neutralized the hostile swarm.'
            : 'Botnet Hive breached the perimeter.'
      }

      return {
        ...current,
        defender: nextDefender,
        attacker: nextAttacker,
        winner,
        phase: nextPhase,
        round: current.round + 1,
        level: nextLevel,
        score: adjustedScore,
        defense: nextDefense,
        offense: nextOffense,
        log: nextLog,
      }
    })
  }

  const resetBattle = () => setBattle(initialBattleState)

  const defenderCompromised = battle.defender <= 34
  const attackerCompromised = battle.attacker <= 34
  const levelProgress = ((battle.score % 120) / 120) * 100

  const statusText = battle.winner
    ? battle.winner === 'defender'
      ? 'Defense Core neutralized the botnet wave.'
      : 'Botnet Hive breached the perimeter.'
    : battle.phase === 'firewall-hold'
      ? 'Defense Core is forcing the swarm backward.'
      : battle.phase === 'breach-attempt'
        ? 'Critical exchange detected. Countermeasures unstable.'
        : battle.phase === 'systems-upgrade'
          ? 'Upgrade complete. Systems are recalibrating.'
          : 'Botnet probes are searching for weak points.'

  return (
    <main className="battle-page">
      <header className="battle-header">
        <p className="eyebrow">Interactive Realtime Simulation</p>
        <h1>Cyber Battle Animation</h1>
        <p className="subtitle">
          Choose offense, defense, or upgrades to shape the battle. Score points,
          climb levels, and keep the firewall alive.
        </p>
      </header>

      <section className="control-panel" aria-label="Battle controls">
        <button type="button" onClick={() => applyAction('attack')}>Offense</button>
        <button type="button" onClick={() => applyAction('defend')}>Defense</button>
        <button type="button" onClick={() => applyAction('upgrade')}>Upgrade</button>
        <button type="button" className="secondary" onClick={resetBattle}>Reset</button>
      </section>

      <section className="stats-row" aria-label="Battle stats">
        <div className="stat-card">
          <span>Level</span>
          <strong>{battle.level}</strong>
        </div>
        <div className="stat-card">
          <span>Score</span>
          <strong>{battle.score}</strong>
        </div>
        <div className="stat-card wide">
          <span>Level progress</span>
          <div className="track">
            <i style={{ width: `${levelProgress}%` }}></i>
          </div>
        </div>
      </section>

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
          <span className="node-meta">DEF {battle.defense}</span>
          <span className="ring ring-1"></span>
          <span className="ring ring-2"></span>
          <span className="ring ring-3"></span>
          <span className="core"></span>
        </div>

        <div
          className={`node attacker ${attackerCompromised ? 'compromised' : ''} ${battle.winner === 'defender' ? 'defeated' : ''}`}
        >
          <span className="label">Botnet Hive</span>
          <span className="node-meta">ATK {battle.offense}</span>
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
          <p className="battle-log">{battle.log}</p>
        </div>
      </section>

      <section className="battle-notes">
        <h2>Gameplay</h2>
        <p>
          Offense weakens the swarm, defense absorbs damage, upgrades improve your
          stats, and score drives progression.
        </p>
      </section>
    </main>
  )
}

export default App
