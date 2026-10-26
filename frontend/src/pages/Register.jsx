import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Citizen' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/register', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #e9d8fd 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>📝</div>
          <h1 style={{ fontSize: '24px', margin: '0 0 6px 0', color: '#1a202c' }}>Create Account</h1>
          <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>
            Join CivicPulse and help your city
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fed7d7',
            color: '#c53030',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 500
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Field label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" />

          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a5568', marginBottom: '8px' }}>
            I am a
          </label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {['Citizen', 'Government'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                style={{
                  flex: 1,
                  padding: '14px 10px',
                  border: form.role === r ? '2px solid #667eea' : '2px solid #e2e8f0',
                  borderRadius: '10px',
                  background: form.role === r ? 'linear-gradient(135deg, #ebf4ff, #e9d8fd)' : 'white',
                  color: form.role === r ? '#667eea' : '#4a5568',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {r === 'Citizen' ? '👤 Citizen' : '🏛️ Government'}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#718096' }}>
          Already have an account? <Link to="/login" style={{ color: '#667eea', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4a5568', marginBottom: '6px' }}>
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        style={{
          width: '100%',
          padding: '12px 14px',
          border: '2px solid #e2e8f0',
          borderRadius: '10px',
          fontSize: '14px',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
}
