
import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function PlayerProfile() {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [position, setPosition] = useState('')
  const [year, setYear] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data: { user }, error: authError } =
      await supabase.auth.getUser()

    if (authError || !user) {
      setMessage('Please sign in before submitting your profile.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('player_profiles')
      .insert({
        id: user.id,
        full_name: name.trim(),
        jersey_number: Number(number),
        position: position,
        class_year: year
      })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Profile submitted! Waiting for administrator approval.')
    }

    setLoading(false)
  }

  return (
    <div className="signup-container">
      <h2>Create Your Player Profile</h2>
      <p>Enter your information for SRU Men's Club Lacrosse.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Jersey Number"
          min="0"
          max="99"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />

        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
        >
          <option value="">Select Position</option>
          <option value="Attack">Attack</option>
          <option value="Midfield">Midfield</option>
          <option value="Defense">Defense</option>
          <option value="Goalie">Goalie</option>
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        >
          <option value="">Select Class Year</option>
          <option value="Freshman">Freshman</option>
          <option value="Sophomore">Sophomore</option>
          <option value="Junior">Junior</option>
          <option value="Senior">Senior</option>
          <option value="Graduate">Graduate</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Profile'}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  )
}
