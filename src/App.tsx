import { useMemo, useState } from 'react'
import './App.css'

type Packet = {
  id: number
  style: React.CSSProperties
}

type Winner = 'team' | 'glitch' | null

type Phase = 'ready' | 'protecting' | 'boosting' | 'scanning' | 'celebration'

type ActionType = 'protect' | 'boost' | 'scan'

type GameState = {
  teamShield: number
  glitchMeter: number
  winner: Winner
  phase: Phase
  round: number
  level: number
  stars: number
  shield: number
  boost: number
  message: string
}

const MAX_VALUE = 100
const MAX_SKILL = 10
const MAX_LEVEL = 10

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const makePackets = (intensity: number): Packet[] =>
  Array.from({ length: 12 }, (_, index) => {
    const drift = ((index % 5) - 2) * 14 * intensity
    const delay = `${index * 0.3}s`
    const duration = `${3.2 + (index % 4) * 0.5}s`
    const lane = `${18 + (index % 6) * 12}%`

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

const initialGameState: GameState = {
  teamShield: MAX_VALUE,
  glitchMeter: MAX_VALUE,
  winner: null,
  phase: 'ready',
  round: 1,
  level: 1,
  stars: 0,
  shield: 5,
  boost: 5,
  message: 'Tap Protect, Boost, or Scan to help the Cyber Team.',
}

function App() {
  const [game, setGame] = useState<GameState>(initialGameState)

  const packets = useMemo(
    () => makePackets(0.45 + game.level * 0.04),
    [game.level],
  )

  const doAction = (action: ActionType) => {
    setGame((current) => {
      if (current.winner) {
        return current
      }

      const levelBonus = current.level - 1
      let nextTeamShield = current.teamShield
      let nextGlitchMeter = current.glitchMeter
      let nextShield = current.shield
      let nextBoost = current.boost
      let nextStars = current.stars
      let nextPhase: Phase = 'ready'
      let nextMessage = current.message

      if (action === 'protect') {
        const block = 14 + current.shield * 2 + Math.floor(Math.random() * 6)
        const glitch = 6 + levelBonus + Math.floor(Math.random() * 6)
        nextTeamShield = clamp(current.teamShield + Math.floor(block / 3), 0, MAX_VALUE)
        nextGlitchMeter = clamp(current.glitchMeter - Math.max(0, glitch - block), 0, MAX_VALUE)
        nextStars += 8 + Math.floor(block / 5)
        nextPhase = 'protecting'
        nextMessage = 'Great shield! You protected the team.'
      }

      if (action === 'boost') {
        nextShield = clamp(current.shield + 1, 1, MAX_SKILL)
        nextBoost = clamp(current.boost + 1, 1, MAX_SKILL)
        nextTeamShield = clamp(current.teamShield + 10, 0, MAX_VALUE)
        nextStars += 12
        nextPhase = 'boosting'
        nextMessage = 'Nice boost! Your team got stronger.'
      }

      if (action === 'scan') {
        const scanHelp = 10 + current.boost * 2 + Math.floor(Math.random() * 7)
        const counter = 5 + levelBonus + Math.floor(Math.random() * 5)
        nextGlitchMeter = clamp(current.glitchMeter - scanHelp, 0, MAX_VALUE)
        nextTeamShield = clamp(current.teamShield - Math.max(0, counter - current.shield), 0, MAX_VALUE)
        nextStars += 15 + Math.floor(scanHelp / 6)
        nextPhase = 'scanning'
        nextMessage = 'Awesome scan! You found the glitch spots.'
      }

      const threshold = current.level * 90
      const leveledUp = nextStars >= threshold && current.level < MAX_LEVEL
      const nextLevel = leveledUp ? current.level + 1 : current.level
      const adjustedStars = leveledUp ? nextStars + 25 : nextStars

      let winner: Winner = null
      if (nextTeamShield <= 0 || nextGlitchMeter <= 0) {
        winner = nextTeamShield > nextGlitchMeter ? 'team' : 'glitch'
        nextMessage =
          winner === 'team'
            ? 'Hooray! The Cyber Team kept the system safe.'
            : 'Oops! The glitches won this round.'
        nextPhase = 'celebration'
      }

      return {
        ...current,
        teamShield: nextTeamShield,
        glitchMeter: nextGlitchMeter,
        winner,
        phase: nextPhase,
        round: current.round + 1,
        level: nextLevel,
        stars: adjustedStars,
        shield: nextShield,
        boost: nextBoost,
        message: nextMessage,
      }
    })
  }

  const resetGame = () => setGame(initialGameState)
  const progress = ((game.stars % 90) / 90) * 100
  const teamLow = game.teamShield <= 34
  const glitchLow = game.glitchMeter <= 34

  const statusText = game.winner
    ? game.winner === 'team'
      ? 'The Cyber Team won the round!'
      : 'The glitch meter ran out first.'
    : game.phase === 'boosting'
      ? 'Boost power is ready!'
      : game.phase === 'scanning'
        ? 'Scan found new helper spots!'
        : game.phase === 'protecting'
          ? 'A strong shield is holding steady!'
          : 'Pick a button to help the team.'

  return (
    <main className="battle-page kid-mode">
      <header className="battle-header">
        <p className="eyebrow">Friendly Cyber Adventure</p>
        <h1>Cyber Helpers</h1>
        <p className="subtitle">
          Help the team with Protect, Boost, and Scan. Collect stars, level up,
          and keep the system happy.
        </p>
      </header>

      <section className="control-panel" aria-label="Game controls">
        <button type="button" onClick={() => doAction('protect')}>Protect</button>
        <button type="button" onClick={() => doAction('boost')}>Boost</button>
        <button type="button" onClick={() => doAction('scan')}>Scan</button>
        <button type="button" className="secondary" onClick={resetGame}>Reset</button>
      </section>

      <section className="stats-row" aria-label="Game stats">
        <div className="stat-card">
          <span>Level</span>
          <strong>{game.level}</strong>
        </div>
        <div className="stat-card">
          <span>Stars</span>
          <strong>{game.stars}</strong>
        </div>
        <div className="stat-card wide">
          <span>Level progress</span>
          <div className="track">
            <i style={{ width: `${progress}%` }}></i>
          </div>
        </div>
      </section>

      <section className="arena kid-arena" aria-label="Friendly cyber scene">
        <div className="atmosphere" aria-hidden="true"></div>
        <div className="sparkles" aria-hidden="true"></div>

        <div className="battle-hud" role="status" aria-live="polite">
          <div className="meter defender-meter">
            <span>Team Shield {game.teamShield}%</span>
            <div className="track">
              <i style={{ width: `${game.teamShield}%` }}></i>
            </div>
          </div>
          <div className="round">Round {game.round}</div>
          <div className="meter attacker-meter">
            <span>Glitch Meter {game.glitchMeter}%</span>
            <div className="track">
              <i style={{ width: `${game.glitchMeter}%` }}></i>
            </div>
          </div>
        </div>

        <div
          className={`node defender ${teamLow ? 'compromised' : ''} ${game.winner === 'glitch' ? 'defeated' : ''}`}
        >
          <span className="label">Cyber Team</span>
          <span className="node-meta">Shield {game.shield}</span>
          <span className="ring ring-1"></span>
          <span className="ring ring-2"></span>
          <span className="ring ring-3"></span>
          <span className="core"></span>
        </div>

        <div
          className={`node attacker ${glitchLow ? 'compromised' : ''} ${game.winner === 'team' ? 'defeated' : ''}`}
        >
          <span className="label">Glitch Cloud</span>
          <span className="node-meta">Boost {game.boost}</span>
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
          <strong>{statusText}</strong>
          <p>{game.message}</p>
        </div>
      </section>

      <section className="battle-notes">
        <h2>How to play</h2>
        <p>
          Press Protect, Boost, or Scan to earn stars and keep the Cyber Team
          safe. The game is made for young kids and uses friendly words and
          bright feedback.
        </p>
      </section>
    </main>
  )
}

export default App
