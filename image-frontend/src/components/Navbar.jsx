import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { logout, userEmail, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkStyle = (path) => ({
    color: location.pathname === path ? 'white' : 'rgba(255,255,255,0.75)',
    textDecoration: 'none',
    fontWeight: 500
  });

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0 32px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: '64px',
      boxShadow: '0 2px 20px rgba(102,126,234,0.3)'
    }}>
      <Link to="/" style={{ color: 'white', fontWeight: 700,
        fontSize: '20px', textDecoration: 'none' }}>
        ImageService
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/" style={linkStyle('/')}>Dashboard</Link>
        <Link to="/upload" style={linkStyle('/upload')}>Upload</Link>
        <Link to="/bulk-transform" style={linkStyle('/bulk-transform')}>Bulk Transform</Link>
        {userRole === 'ADMIN' && (
  <Link to="/admin" style={linkStyle('/admin')}>Admin</Link>
)}
        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px' }}>{userEmail}</span>
        <button onClick={handleLogout} style={{
          background: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.4)',
          color: 'white', borderRadius: '8px',
          padding: '6px 16px', cursor: 'pointer', fontWeight: 500
        }}>Logout</button>
      </div>
    </nav>
  );
}