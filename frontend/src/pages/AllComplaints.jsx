import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import ComplaintCard from '../components/ComplaintCard';

export default function AllComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await API.get('/issues');
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id) => {
    await API.patch(`/issues/${id}`, { status: 'Resolved' });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this complaint?')) return;
    await API.delete(`/issues/${id}`);
    load();
  };

  const filtered = complaints
    .filter(c => filter === 'All' || c.status === filter)
    .filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#2d3748' }}>
        📋 All Complaints
      </h1>

      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <input
          placeholder="🔍 Search title or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            minWidth: '200px',
            outline: 'none'
          }}
        />
        {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              background: filter === f ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e2e8f0',
              color: filter === f ? 'white' : '#4a5568'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#a0aec0', textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '60px 20px',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#a0aec0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
          No complaints found.
        </div>
      ) : (
        filtered.map(c => (
          <ComplaintCard
            key={c._id}
            complaint={c}
            onResolve={handleResolve}
            onDelete={handleDelete}
            canDelete={user.role === 'Government'}
            canResolve={user.role === 'Government'}
          />
        ))
      )}
    </div>
  );
}