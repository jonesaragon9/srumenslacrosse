
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function AdminDashboard() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

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
