import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Register</button>
      </form>
    </div>
  )
}
