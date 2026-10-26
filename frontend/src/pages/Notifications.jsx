import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await API.get(`/notifications/${user.id}/${user.role}`);
      setList(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const markRead = async (id) => {
    await API.patch(`/notifications/${id}/read`);
    load();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#2d3748' }}>
        🔔 Notifications
      </h1>

      {loading ? (
        <p style={{ color: '#a0aec0', textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : list.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '60px 20px',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#a0aec0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔕</div>
          No notifications yet.
        </div>
      ) : (
        list.map(n => (
          <div
            key={n._id}
            onClick={() => !n.read && markRead(n._id)}
            style={{
              background: n.read ? 'white' : 'linear-gradient(135deg, #ebf4ff, #faf5ff)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              borderLeft: n.read ? '4px solid #e2e8f0' : '4px solid #667eea',
              cursor: n.read ? 'default' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'start' }}>
              <p style={{
                fontSize: '14px',
                color: '#2d3748',
                margin: 0,
                fontWeight: n.read ? 400 : 600
              }}>
                {n.message}
              </p>
              {!n.read && (
                <span style={{
                  background: '#667eea',
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}>
                  NEW
                </span>
              )}
            </div>
            <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '6px' }}>
              {new Date(n.createdAt).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}