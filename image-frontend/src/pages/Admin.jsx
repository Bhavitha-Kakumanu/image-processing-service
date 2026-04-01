import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8081/api/auth/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUsers(res.data))
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="page-container">
      <div className="page-header d-flex align-items-center gap-3">
        <button className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('/')}>← Back</button>
        <div>
          <h2>Admin — Registered Users</h2>
          <p>{users.length} user{users.length !== 1 ? 's' : ''} registered</p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading users...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && users.length === 0 && (
        <div className="text-center py-5">
          <h5 style={{ color: '#666' }}>No users registered yet</h5>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div style={{ background: 'white', borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table className="table table-hover mb-0">
            <thead style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              <tr>
                <th style={{ color: 'white', padding: '16px', fontWeight: 600 }}>#</th>
                <th style={{ color: 'white', padding: '16px', fontWeight: 600 }}>Name</th>
                <th style={{ color: 'white', padding: '16px', fontWeight: 600 }}>Email</th>
                <th style={{ color: 'white', padding: '16px', fontWeight: 600 }}>Registered</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td style={{ padding: '14px 16px', color: '#888' }}>{index + 1}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>{user.name}</td>
                  <td style={{ padding: '14px 16px', color: '#667eea' }}>{user.email}</td>
                  <td style={{ padding: '14px 16px', color: '#888', fontSize: '13px' }}>
                    {user.createdAt ? formatDate(user.createdAt) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}