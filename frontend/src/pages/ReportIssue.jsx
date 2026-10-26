import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';

export default function ReportIssue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    category: 'Road',
    coordinates: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLocationSelect = ({ lat, lng, address }) => {
    setForm(prev => ({
      ...prev,
      coordinates: { lat, lng },
      location: address || prev.location || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/issues', {
        ...form,
        reportedBy: user.id,
        reporterName: user.name
      });
      navigate('/complaints');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
      }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 6px 0', color: '#2d3748' }}>
          📝 Report a Civic Issue
        </h1>
        <p style={{ color: '#718096', fontSize: '14px', margin: '0 0 24px 0' }}>
          Click on the map to set the exact location of the problem
        </p>

        {error && (
          <div style={{
            background: '#fed7d7',
            color: '#c53030',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Issue Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Broken road near school"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                <option value="Road">🛣️ Road</option>
                <option value="Water">💧 Water</option>
                <option value="Garbage">🗑️ Garbage</option>
                <option value="Streetlight">💡 Streetlight</option>
                <option value="Other">📌 Other</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail..."
              required
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>📍 Location (click on map below)</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Click on the map or type address"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <MapView
              onLocationSelect={handleLocationSelect}
              marker={form.coordinates}
            />
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
            {loading ? 'Submitting...' : '🚀 Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#4a5568',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '2px solid #e2e8f0',
  borderRadius: '10px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit'
};