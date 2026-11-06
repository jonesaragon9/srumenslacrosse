
import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function LogIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogIn(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('You are now logged in!')
    }

    setLoading(false)
  }

  return (
    <div className="signup-container">
      <h2>Player Log In</h2>
      <p>Sign in to your SRU Men's Club Lacrosse account.</p>

      <form onSubmit={handleLogIn}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  )
}
