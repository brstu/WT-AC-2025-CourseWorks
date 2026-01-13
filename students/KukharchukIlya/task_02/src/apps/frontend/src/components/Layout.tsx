import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <nav style={{ padding: '1rem', background: '#f0f0f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/">Home</Link>
        {isAuthenticated && (
          <>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">Orders</Link>
            {user?.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
            <span>{user?.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
        {!isAuthenticated && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      <main style={{ padding: '2rem' }}>{children}</main>
    </div>
  )
}
