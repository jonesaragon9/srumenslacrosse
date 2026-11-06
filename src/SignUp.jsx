import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
    emailRedirectTo: 'http://localhost:5174/',
  },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for a verification link!')
    }

    setLoading(false)
  }

  return (
    <div className="signup-container">
      <h2>Player Registration</h2>
      <p>Create your SRU Men's Club Lacrosse account.</p>

      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (at least 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  )
}