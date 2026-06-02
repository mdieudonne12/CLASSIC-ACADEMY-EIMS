import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import EmployeeManagement from './components/EmployeeManagement';
import DepartmentManagement from './components/DepartmentManagement';
import AttendanceTracker from './components/AttendanceTracker';
import SalaryManagement from './components/SalaryManagement';
import Reports from './components/Reports';
import SystemERD from './components/SystemERD';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Login credentials form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        setLoginError(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      setLoginError('Could not establish connection to the backend server.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setActiveTab('dashboard');
  };

  // If no auth token, render gorgeous glassmorphic Login Page
  if (!token || !user) {
    return (
      <div className="auth-container">
        <div className="glass-panel auth-card">
          <div className="logo-header">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 8px var(--accent-glow))' }}><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
            <h1>Classic Academy</h1>
            <p>Employee Information Management System</p>
          </div>

          {loginError && <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.88rem' }}>{loginError}</div>}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Username</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="Enter username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input 
                  type="password" 
                  className="input-control" 
                  placeholder="Enter password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loggingIn}>
              {loggingIn ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '25px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Ntarabana Sector, Rulindo District, Northern Province
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
          <h2>Classic EIMS</h2>
        </div>

        <ul className="sidebar-menu">
          <li className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            <span>Dashboard</span>
          </li>
          
          <li className={`menu-item ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Employees</span>
          </li>

          <li className={`menu-item ${activeTab === 'departments' ? 'active' : ''}`} onClick={() => setActiveTab('departments')}>
            <svg viewBox="0 0 24 24"><path d="M4 21v-7a5 5 0 0 1 10 0v7"></path><path d="M14 21v-3a3 3 0 0 1 6 0v3"></path><path d="M12 3v4"></path><path d="M8 5h8"></path></svg>
            <span>Departments</span>
          </li>

          <li className={`menu-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>Attendance</span>
          </li>

          <li className={`menu-item ${activeTab === 'salaries' ? 'active' : ''}`} onClick={() => setActiveTab('salaries')}>
            <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="6"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            <span>Payroll</span>
          </li>

          <li className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>Report Center</span>
          </li>

          <li className={`menu-item ${activeTab === 'system_erd' ? 'active' : ''}`} onClick={() => setActiveTab('system_erd')}>
            <svg viewBox="0 0 24 24"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
            <span>System ERD</span>
          </li>
        </ul>

        {/* Sidebar Footer User Info */}
        <div className="sidebar-user">
          <img 
            className="user-avatar" 
            src={user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
            alt="Avatar" 
          />
          <div className="user-details">
            <h4>{`${user.first_name} ${user.last_name}`}</h4>
            <p>{user.position} ({user.role})</p>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="app-main">
        <header className="app-header">
          <div className="header-title">
            <h2 style={{ textTransform: 'capitalize' }}>
              {activeTab === 'system_erd' ? 'Database Architecture' : activeTab.replace('_', ' ')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Classic Academy EIMS • Rulindo District • Academic Session 2026
            </p>
          </div>
        </header>

        {/* Tab Routing Swapper */}
        <div style={{ flex: 1 }}>
          {activeTab === 'dashboard' && <Dashboard token={token} />}
          {activeTab === 'employees' && <EmployeeManagement token={token} userRole={user.role} />}
          {activeTab === 'departments' && <DepartmentManagement token={token} userRole={user.role} />}
          {activeTab === 'attendance' && <AttendanceTracker token={token} userRole={user.role} />}
          {activeTab === 'salaries' && <SalaryManagement token={token} userRole={user.role} />}
          {activeTab === 'reports' && <Reports token={token} />}
          {activeTab === 'system_erd' && <SystemERD />}
        </div>
      </main>
    </div>
  );
}
