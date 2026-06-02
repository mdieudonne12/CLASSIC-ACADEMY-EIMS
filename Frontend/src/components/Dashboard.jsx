import React, { useState, useEffect } from 'react';

export default function Dashboard({ token }) {
  const [stats, setStats] = useState({
    total_employees: 0,
    total_departments: 0,
    attendance_rate: 100,
    monthly_payroll_spend: 0
  });
  const [charts, setCharts] = useState({
    deptHeadcount: [],
    genderDistribution: [],
    payrollTrends: [],
    attendanceDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch dashboard summary
        const summaryRes = await fetch('http://localhost:5000/api/reports/summary', { headers });
        const summaryData = await summaryRes.json();
        
        // Fetch chart analytics
        const chartsRes = await fetch('http://localhost:5000/api/reports/charts', { headers });
        const chartsData = await chartsRes.json();

        if (summaryData.success && chartsData.success) {
          setStats(summaryData.stats);
          setCharts(chartsData);
        } else {
          setError('Failed to fetch analytics statistics.');
        }
      } catch (err) {
        setError('Could not connect to API server.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '20px' }}>
        <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid var(--border-color)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading analytical workspace...</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Helper values for custom SVG charts
  const maxPayroll = charts.payrollTrends.length > 0 
    ? Math.max(...charts.payrollTrends.map(t => parseFloat(t.total_net))) 
    : 1;

  const totalGender = charts.genderDistribution.length > 0 
    ? charts.genderDistribution.reduce((acc, curr) => acc + curr.count, 0) 
    : 1;

  const formatRWF = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(value);
  };

  const getMonthName = (monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1] || monthNum;
  };

  return (
    <div>
      {error && <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid var(--color-danger)' }}>{error}</div>}

      {/* Stats Cards Row */}
      <div className="stats-grid">
        {/* Total Employees */}
        <div className="glass-panel stat-card">
          <div className="stat-info">
            <h3>{stats.total_employees}</h3>
            <p>Employees</p>
          </div>
          <div className="stat-icon" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
        </div>

        {/* Total Departments */}
        <div className="glass-panel stat-card">
          <div className="stat-info">
            <h3>{stats.total_departments}</h3>
            <p>Departments</p>
          </div>
          <div className="stat-icon" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21v-7a5 5 0 0 1 10 0v7"></path><path d="M14 21v-3a3 3 0 0 1 6 0v3"></path><path d="M12 3v4"></path><path d="M8 5h8"></path></svg>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="glass-panel stat-card">
          <div className="stat-info">
            <h3>{stats.attendance_rate}%</h3>
            <p>Attendance</p>
          </div>
          <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
        </div>

        {/* Monthly Spend */}
        <div className="glass-panel stat-card">
          <div className="stat-info">
            <h3 style={{ fontSize: '1.4rem', margin: '10px 0 2px 0' }}>{formatRWF(stats.monthly_payroll_spend)}</h3>
            <p>Monthly Payroll</p>
          </div>
          <div className="stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="6"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Row */}
      <div className="dashboard-grid">
        {/* Left: Monthly Payroll Spending (Bar Chart) */}
        <div className="glass-panel section-panel">
          <div className="panel-header">
            <h3>Monthly Payroll Spend Expenditure (RWF)</h3>
          </div>
          {charts.payrollTrends.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', color: 'var(--text-muted)' }}>No processed payroll records found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', height: '220px', alignItems: 'end', justifyContent: 'space-around', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
                {charts.payrollTrends.map((t, idx) => {
                  const percent = Math.max(10, Math.round((parseFloat(t.total_net) / maxPayroll) * 100));
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px', zIndex: 2 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', fontFamily: 'monospace' }}>{Math.round(t.total_net / 1000)}k</span>
                      <div className="chart-bar" style={{
                        width: '32px',
                        height: `${percent * 1.5}px`,
                        background: 'linear-gradient(to top, hsla(180, 100%, 45%, 0.2) 0%, var(--accent) 100%)',
                        boxShadow: '0 0 10px 0 var(--accent-glow)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.5s ease'
                      }}></div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{`${getMonthName(t.month)} '${String(t.year).slice(-2)}`}</span>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>Aggregated Net Salary payments (last 6 completed payroll periods)</p>
            </div>
          )}
        </div>

        {/* Right: Gender Headcount Donut */}
        <div className="glass-panel section-panel">
          <div className="panel-header">
            <h3>Staff Gender Ratios</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', height: '240px', gap: '15px' }}>
            {charts.genderDistribution.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No gender metrics found.</p>
            ) : (
              <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                {/* SVG Semi-Donut/Circle */}
                <svg width="120" height="120" viewBox="0 0 42 42" className="donut" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--border-color)" strokeWidth="4"></circle>
                  {charts.genderDistribution.map((g, idx) => {
                    const percent = Math.round((g.count / totalGender) * 100);
                    let strokeDasharray = `${percent} ${100 - percent}`;
                    let strokeDashoffset = idx === 1 ? 100 - charts.genderDistribution[0].count / totalGender * 100 : 0;
                    const strokeColor = g.gender === 'Male' ? 'var(--accent)' : 'var(--color-danger)';
                    return (
                      <circle 
                        key={idx}
                        cx="21" 
                        cy="21" 
                        r="15.915" 
                        fill="transparent" 
                        stroke={strokeColor} 
                        strokeWidth="4" 
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                      ></circle>
                    );
                  })}
                </svg>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {charts.genderDistribution.map((g, idx) => {
                    const pct = Math.round((g.count / totalGender) * 100);
                    const bulletColor = g.gender === 'Male' ? 'var(--accent)' : 'var(--color-danger)';
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: bulletColor }}></span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{g.gender}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{g.count} staff ({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Department breakdown & Activity log */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Department Roster Headcounts */}
        <div className="glass-panel section-panel">
          <div className="panel-header">
            <h3>Department Roster Headcount</h3>
          </div>
          {charts.deptHeadcount.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>No departments found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {charts.deptHeadcount.map((dept, idx) => {
                const totalActive = stats.total_employees || 1;
                const ratio = Math.min(100, Math.round((dept.count / totalActive) * 100));
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 500 }}>{dept.department_name}</span>
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{dept.count} Active</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${ratio}%`, background: 'var(--accent)', borderRadius: '10px', boxShadow: '0 0 6px 0 var(--accent-glow)' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Administration Guidelines */}
        <div className="glass-panel section-panel">
          <div className="panel-header">
            <h3>Administrative Activity Board</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="activity-item" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ padding: '8px', background: 'var(--color-success-bg)', borderRadius: '6px', color: 'var(--color-success)', height: 'fit-content' }}>✓</div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Daily Attendance Roster Active</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Admin logged standard check-in cycles for staff roster.</p>
              </div>
            </div>
            <div className="activity-item" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ padding: '8px', background: 'var(--color-info-bg)', borderRadius: '6px', color: 'var(--color-info)', height: 'fit-content' }}>ℹ</div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Hybrid Database Safe-T</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>System auto-switched to active engine. Backups secure.</p>
              </div>
            </div>
            <div className="activity-item" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '8px', background: 'var(--color-warning-bg)', borderRadius: '6px', color: 'var(--color-warning)', height: 'fit-content' }}>⚡</div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Bulk Employee CSV Import Ready</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Staff registry supports direct Excel/CSV drops in Directory.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
