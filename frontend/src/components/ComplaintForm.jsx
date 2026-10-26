import { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ComplaintForm({ onAdded }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    category: 'Road'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/issues', {
        ...form,
        reportedBy: user?.id,
        reporterName: user?.name || 'Anonymous'
      });
      setForm({ title: '', description: '', location: '', category: 'Road' });
      if (onAdded) onAdded();
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '12px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none'
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required style={inputStyle} />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required style={{ ...inputStyle, minHeight: '80px' }} />
      <input name="location" placeholder="Location" value={form.location} onChange={handleChange} style={inputStyle} />
      <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
        <option>Road</option><option>Water</option><option>Garbage</option><option>Streetlight</option><option>Other</option>
      </select>
      <button type="submit" disabled={loading} style={{
        background: '#667eea', color: 'white', border: 'none',
        padding: '12px 24px', borderRadius: '10px',
        fontWeight: 600, cursor: 'pointer'
      }}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}