import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const linkStyle = (path) => ({
    color: 'white',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '14px',
    padding: '8px 14px',
    borderRadius: '8px',
    background: location.pathname === path ? 'rgba(255,255,255,0.2)' : 'transparent',
    transition: 'background 0.2s'
  });

  const handleLogout = () => {
    if (!confirm('Logout?')) return;
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      padding: '14px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
      flexWrap: 'wrap',
      gap: '12px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
        <h1 style={{ fontSize: '20px', margin: 0, fontWeight: 700 }}>🏛️ CivicPulse</h1>
        <p style={{ fontSize: '11px', opacity: 0.85, margin: 0 }}>
          Smart Civic Issue Reporting
        </p>
      </Link>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        {user ? (
          <>
            <Link to="/" style={linkStyle('/')}>🏠 Dashboard</Link>
            <Link to="/report" style={linkStyle('/report')}>📝 Report</Link>
            <Link to="/complaints" style={linkStyle('/complaints')}>📋 Complaints</Link>
            <NotificationBell />
            <Link to="/profile" style={{
              ...linkStyle('/profile'),
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: user.role === 'Government' ? 'rgba(246,173,85,0.9)' : 'rgba(255,255,255,0.25)',
              padding: '6px 14px',
              borderRadius: '20px'
            }}>
              <span style={{ fontSize: '14px' }}>
                {user.role === 'Government' ? '🏛️' : '👤'}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{user.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '7px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle('/login')}>Login</Link>
            <Link to="/register" style={{
              ...linkStyle('/register'),
              background: 'white',
              color: '#667eea',
              fontWeight: 600
            }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}