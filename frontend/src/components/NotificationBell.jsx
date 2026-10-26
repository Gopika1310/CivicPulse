import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await API.get(`/notifications/${user.id}/${user.role}`);
        setCount(res.data.filter(n => !n.read).length);
      } catch (err) {
        console.error(err);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <Link to="/notifications" style={{
      position: 'relative',
      background: 'rgba(255,255,255,0.15)',
      color: 'white',
      padding: '8px 14px',
      borderRadius: '8px',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center'
    }}>
      🔔
      {count > 0 && (
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          background: '#e53e3e',
          color: 'white',
          fontSize: '10px',
          fontWeight: 700,
          borderRadius: '10px',
          padding: '2px 6px',
          minWidth: '18px',
          textAlign: 'center'
        }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}