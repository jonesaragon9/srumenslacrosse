
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const emptyGame = {
  opponent: '', date: '', time: '', location: '',
  status: 'Upcoming', sru_score: '', opponent_score: ''
}

export default function AdminDashboard({ onGamesChanged }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [games, setGames] = useState([])
  const [gameForm, setGameForm] = useState({ ...emptyGame })
  const [editingGameId, setEditingGameId] = useState(null)
  const [savingGame, setSavingGame] = useState(false)
  const [gameMessage, setGameMessage] = useState('')

  async function loadGames() {
    const { data, error } = await supabase.from('games').select('*').order('date')
    if (error) {
      setGameMessage('Cannot load games: ' + error.message + '. Run the supplied SQL setup first.')
    } else {
      setGames(data || [])
    }
  }

  function resetGameForm() {
    setGameForm({ ...emptyGame })
    setEditingGameId(null)
  }

  function editGame(game) {
    setEditingGameId(game.id)
    setGameForm({
      opponent: game.opponent || '', date: game.date || '',
      time: game.time || '', location: game.location || '',
      status: game.status || 'Upcoming',
      sru_score: game.sru_score ?? '', opponent_score: game.opponent_score ?? ''
    })
    document.getElementById('game-editor')?.scrollIntoView({ behavior: 'smooth' })
  }

  async function saveGame(event) {
    event.preventDefault()
    if (!isAdmin || savingGame) return
    if (gameForm.status === 'Final' && (gameForm.sru_score === '' || gameForm.opponent_score === '')) {
      setGameMessage('Enter both final scores before marking a game Final.')
      return
    }
    setSavingGame(true)
    setGameMessage('Saving game...')
    const payload = {
      opponent: gameForm.opponent.trim(), date: gameForm.date,
      time: gameForm.time.trim(), location: gameForm.location.trim(),
      status: gameForm.status,
      sru_score: gameForm.status === 'Final' ? Number(gameForm.sru_score) : null,
      opponent_score: gameForm.status === 'Final' ? Number(gameForm.opponent_score) : null
    }
    const query = editingGameId
      ? supabase.from('games').update(payload).eq('id', editingGameId)
      : supabase.from('games').insert(payload)
    const { data, error } = await query.select('id')
    setSavingGame(false)
    if (error || !data?.length) {
      setGameMessage('Game not saved: ' + (error?.message || 'Check your admin permissions.'))
      return
    }
    resetGameForm()
    await loadGames()
    onGamesChanged?.()
    setGameMessage('Game saved successfully!')
  }

  async function deleteGame(game) {
    if (!isAdmin || !window.confirm(`Delete the game against ${game.opponent} on ${game.date}?`)) return
    setGameMessage('Deleting game...')
    const { data, error } = await supabase.from('games').delete().eq('id', game.id).select('id')
    if (error || !data?.length) {
      setGameMessage('Game not deleted: ' + (error?.message || 'Check your admin permissions.'))
      return
    }
    if (editingGameId === game.id) resetGameForm()
    await loadGames()
    onGamesChanged?.()
    setGameMessage('Game deleted.')
  }


  async function loadPlayers() {
    setLoading(true)

    const { data: { user }, error: userError } =
      await supabase.auth.getUser()

    if (userError || !user) {
      setIsAdmin(false)
      setMessage('Please log in first.')
      setLoading(false)
      return
    }

    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminError || !admin) {
      setIsAdmin(false)
      setMessage('You do not have administrator access.')
      setLoading(false)
      return
    }

    setIsAdmin(true)
    await loadGames()

    const { data, error } = await supabase
      .from('player_profiles')
      .select('*')
      .order('full_name')

    if (error) {
      setMessage(error.message)
    } else {
      setPlayers(data || [])
    }

    setLoading(false)
  }

  async function updatePlayer(player) {
    setMessage('Saving changes...')

    const { data, error } = await supabase
      .from('player_profiles')
      .update({
        full_name: player.full_name,
        jersey_number: Number(player.jersey_number),
        position: player.position,
        class_year: player.class_year,
        approved: player.approved,
        games: Number(player.games),
        goals: Number(player.goals),
        assists: Number(player.assists),
        ground_balls: Number(player.ground_balls),
        saves: Number(player.saves),
        goals_allowed: Number(player.goals_allowed),
        minutes_played: Number(player.minutes_played)
      })
      .eq('id', player.id)
      .select('id')

    if (error) {
      setMessage('Error: ' + error.message)
      return
    }

    if (!data || data.length === 0) {
      setMessage('No player was updated. Check administrator permissions.')
      return
    }

    await loadPlayers()
    setMessage(player.full_name + ' updated successfully!')
  }

  function changePlayer(id, field, value) {
    setPlayers(current =>
      current.map(player =>
        player.id === id
          ? { ...player, [field]: value }
          : player
      )
    )
  }

  useEffect(() => {
    loadPlayers()
  }, [])

  if (loading) {
    return <p>Loading Admin Dashboard...</p>
  }

  if (!isAdmin) {
    return <p>{message || 'Administrator access required.'}</p>
  }

  const pendingPlayers = players.filter(player => !player.approved)
  const approvedPlayers = players.filter(player => player.approved)

  function renderPlayer(player) {
    return (
      <div key={player.id} className="admin-player">
        <h3>
          {player.full_name} #{player.jersey_number}
        </h3>

        <p>{player.position} | {player.class_year}</p>

        <label>
          Player Name
          <input
            type="text"
            value={player.full_name}
            onChange={e =>
              changePlayer(player.id, 'full_name', e.target.value)
            }
          />
        </label>

        <label>
          Jersey Number
          <input
            type="number"
            min="0"
            max="99"
            value={player.jersey_number}
            onChange={e =>
              changePlayer(player.id, 'jersey_number', e.target.value)
            }
          />
        </label>

        <label>
          Position
          <select
            value={player.position}
            onChange={e =>
              changePlayer(player.id, 'position', e.target.value)
            }
          >
            <option value="Attack">Attack</option>
            <option value="Midfield">Midfield</option>
            <option value="Defense">Defense</option>
            <option value="Goalie">Goalie</option>
            <option value="LSM">LSM</option>
            <option value="FOGO">FOGO</option>
          </select>
        </label>

        <label>
          Class Year
          <input
            type="text"
            value={player.class_year}
            onChange={e =>
              changePlayer(player.id, 'class_year', e.target.value)
            }
          />
        </label>

        <label>
          Approved
          <input
            type="checkbox"
            checked={player.approved}
            onChange={e =>
              changePlayer(player.id, 'approved', e.target.checked)
            }
          />
        </label>

        <h4>Player Statistics</h4>

        {[
          ['games', 'Games Played'],
          ['goals', 'Goals'],
          ['assists', 'Assists'],
          ['ground_balls', 'Ground Balls'],
          ['saves', 'Goalie Saves'],
          ['goals_allowed', 'Goals Allowed'],
          ['minutes_played', 'Minutes Played']
        ].map(([field, label]) => (
          <label key={field}>
            {label}
            <input
              type="number"
              min="0"
              value={player[field] ?? 0}
              onChange={e =>
                changePlayer(player.id, field, e.target.value)
              }
            />
          </label>
        ))}

        <button onClick={() => updatePlayer(player)}>
          Save Player Changes
        </button>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <h1>SRU Lacrosse Admin Dashboard</h1>
      <p>Manage player approvals, information, and statistics.</p>

      {message && <p>{message}</p>}

      <section aria-label="Manage games">
        <h2>Manage Games & Scores</h2>
        <p>Add games, edit the schedule, and enter final scores. All approved admins can manage games.</p>
        {gameMessage && <p role="status">{gameMessage}</p>}
        <form id="game-editor" className="admin-game-form" onSubmit={saveGame}>
          <h3>{editingGameId ? 'Edit Game' : 'Add New Game'}</h3>
          <div className="admin-game-grid">
            <label>Opponent
              <input required maxLength="120" value={gameForm.opponent}
                onChange={e => setGameForm({ ...gameForm, opponent: e.target.value })} />
            </label>
            <label>Date
              <input type="date" required value={gameForm.date}
                onChange={e => setGameForm({ ...gameForm, date: e.target.value })} />
            </label>
            <label>Time (example: 7:00 PM)
              <input required maxLength="60" value={gameForm.time}
                onChange={e => setGameForm({ ...gameForm, time: e.target.value })} />
            </label>
            <label>Location
              <input required maxLength="160" value={gameForm.location}
                onChange={e => setGameForm({ ...gameForm, location: e.target.value })} />
            </label>
            <label>Game Status
              <select value={gameForm.status}
                onChange={e => setGameForm({ ...gameForm, status: e.target.value })}>
                <option value="Upcoming">Upcoming</option>
                <option value="Final">Final</option>
                <option value="Canceled">Canceled</option>
              </select>
            </label>
            {gameForm.status === 'Final' && <>
              <label>SRU Score
                <input type="number" required min="0" step="1" value={gameForm.sru_score}
                  onChange={e => setGameForm({ ...gameForm, sru_score: e.target.value })} />
              </label>
              <label>Opponent Score
                <input type="number" required min="0" step="1" value={gameForm.opponent_score}
                  onChange={e => setGameForm({ ...gameForm, opponent_score: e.target.value })} />
              </label>
            </>}
          </div>
          <div className="admin-game-actions">
            <button type="submit" disabled={savingGame}>
              {savingGame ? 'Saving...' : editingGameId ? 'Save Game Changes' : 'Add Game'}
            </button>
            {editingGameId && <button type="button" className="secondary" onClick={resetGameForm}>Cancel Editing</button>}
          </div>
        </form>
        <h3>Scheduled Games ({games.length})</h3>
        <div className="admin-game-list">
          {games.length === 0 && <p>No games in the database yet.</p>}
          {games.map(game => <div className="admin-game-item" key={game.id}>
            <h3>{game.opponent}</h3>
            <p>{game.date} · {game.time} · {game.location}</p>
            <p><strong>{game.status}</strong>{game.status === 'Final' ? ` · SRU ${game.sru_score} – ${game.opponent_score}` : ''}</p>
            <div className="admin-game-actions">
              <button type="button" onClick={() => editGame(game)}>Edit</button>
              <button type="button" className="danger" onClick={() => deleteGame(game)}>Delete</button>
            </div>
          </div>)}
        </div>
      </section>

      <h2>Pending Player Approvals ({pendingPlayers.length})</h2>

      {pendingPlayers.length === 0 ? (
        <p>No players waiting for approval.</p>
      ) : (
        pendingPlayers.map(player => renderPlayer(player))
      )}

      <h2>Approved Team Roster ({approvedPlayers.length})</h2>

      {approvedPlayers.length === 0 ? (
        <p>No approved players yet.</p>
      ) : (
        approvedPlayers.map(player => renderPlayer(player))
      )}
    </div>
  )
}
