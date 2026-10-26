import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import ComplaintCard from '../components/ComplaintCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [issuesRes, statsRes] = await Promise.all([
        API.get('/issues'),
        API.get('/stats')
      ]);
      setIssues(issuesRes.data);
      setStats(statsRes.data);
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

  const recent = issues.slice(0, 4);

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        borderRadius: '16px',
        padding: '28px',
        color: 'white',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)'
      }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '26px' }}>
          👋 Welcome, {user.name}
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
          {user.role === 'Government'
            ? '🏛️ Manage and resolve civic complaints from your dashboard'
            : '👤 Report issues in your city and track their progress'}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <StatCard icon="📊" label="Total" value={stats.total} color="#667eea" />
        <StatCard icon="⏳" label="Pending" value={stats.pending} color="#ed8936" />
        <StatCard icon="🔄" label="In Progress" value={stats.inProgress} color="#4299e1" />
        <StatCard icon="✅" label="Resolved" value={stats.resolved} color="#48bb78" />
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '30px'
      }}>
        <QuickAction
          to="/report"
          icon="📝"
          title="Report Issue"
          desc="Submit a new civic complaint"
          color="#667eea"
        />
        <QuickAction
          to="/complaints"
          icon="📋"
          title="All Complaints"
          desc="Browse and filter issues"
          color="#764ba2"
        />
        <QuickAction
          to="/profile"
          icon="👤"
          title="My Profile"
          desc="View your account details"
          color="#48bb78"
        />
      </div>

      {/* Recent */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#2d3748' }}>
          🕐 Recent Complaints
        </h2>
        {loading ? (
          <p style={{ color: '#a0aec0', textAlign: 'center', padding: '40px' }}>Loading...</p>
        ) : recent.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#a0aec0'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
            No complaints yet. <Link to="/report" style={{ color: '#667eea', fontWeight: 600 }}>Report the first one!</Link>
          </div>
        ) : (
          recent.map(c => (
            <ComplaintCard
              key={c._id}
              complaint={c}
              onResolve={handleResolve}
              onDelete={handleDelete}
              canDelete={user.role === 'Government'}
            />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#718096', marginTop: '6px', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

function QuickAction({ to, icon, title, desc, color }) {
  return (
    <Link to={to} style={{
      textDecoration: 'none',
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      display: 'block',
      borderTop: `3px solid ${color}`,
      transition: 'transform 0.2s'
    }}>
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: '#2d3748', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ fontSize: '13px', color: '#718096' }}>{desc}</div>
    </Link>
  );
}