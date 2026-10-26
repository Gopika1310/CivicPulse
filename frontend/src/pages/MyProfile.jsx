import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyProfile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [myIssues, setMyIssues] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await API.get('/issues');
      const mine = res.data.filter(i => i.reportedBy === user.id);
      setMyIssues(mine);
      setStats({
        total: mine.length,
        pending: mine.filter(i => i.status === 'Pending').length,
        resolved: mine.filter(i => i.status === 'Resolved').length
      });
    };
    load();
  }, [user.id]);

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '0 20px' }}>
      {/* Profile Card */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '20px',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          margin: '0 auto 16px',
          background: user.role === 'Government'
            ? 'linear-gradient(135deg, #f6ad55, #ed8936)'
            : 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          color: 'white',
          fontWeight: 700
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>

        <h1 style={{ fontSize: '24px', margin: '0 0 4px 0', color: '#1a202c' }}>
          {user.name}
        </h1>
        <p style={{ color: '#718096', margin: '0 0 12px 0', fontSize: '14px' }}>
          {user.email}
        </p>
        <span style={{
          background: user.role === 'Government'
            ? 'linear-gradient(135deg, #f6ad55, #ed8936)'
            : 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600
        }}>
          {user.role === 'Government' ? '🏛️ Government Official' : '👤 Citizen'}
        </span>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <StatBox label="Total Reports" value={stats.total} color="#667eea" />
        <StatBox label="Pending" value={stats.pending} color="#ed8936" />
        <StatBox label="Resolved" value={stats.resolved} color="#48bb78" />
      </div>

      {/* My Issues */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 16px 0', color: '#2d3748' }}>
          📌 Your Reported Issues
        </h2>
        {myIssues.length === 0 ? (
          <p style={{ color: '#a0aec0', textAlign: 'center', padding: '20px' }}>
            You haven't reported any issues yet.
          </p>
        ) : (
          myIssues.map(i => (
            <div key={i._id} style={{
              padding: '12px 0',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#2d3748' }}>{i.title}</div>
                  <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
                    📍 {i.location} • {i.category}
                  </div>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: i.status === 'Resolved' ? '#c6f6d5' : '#feebc8',
                  color: i.status === 'Resolved' ? '#276749' : '#c05621'
                }}>
                  {i.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      borderTop: `3px solid ${color}`
    }}>
      <div style={{ fontSize: '26px', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px', fontWeight: 500 }}>{label}</div>
    </div>
  );
}