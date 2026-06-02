import React, { useState } from 'react';

export default function Reports({ token }) {
  const [activeReport, setActiveReport] = useState('employees'); // employees, attendance, payroll
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async (type) => {
    setLoading(true);
    setError('');
    setData([]);
    setActiveReport(type);
    
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      let url = '';
      
      if (type === 'employees') {
        url = 'http://localhost:5000/api/employees';
      } else if (type === 'attendance') {
        // Fetch all attendance logs for a summary
        const today = new Date().toISOString().split('T')[0];
        url = `http://localhost:5000/api/attendance?date=${today}`;
      } else {
        url = 'http://localhost:5000/api/salaries';
      }

      const res = await fetch(url, { headers });
      const resData = await res.json();
      
      if (resData.success) {
        setData(type === 'employees' ? resData.employees : (type === 'attendance' ? resData.records : resData.payments));
      } else {
        setError(resData.message || 'Failed to fetch report data.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReport('employees');
  }, [token]);

  // Dynamic CSV Exporter Utility
  const exportToCSV = () => {
    if (data.length === 0) return;

    let headers = [];
    let rows = [];

    if (activeReport === 'employees') {
      headers = ['Employee ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Position', 'Department', 'Status', 'Hire Date'];
      rows = data.map(e => [
        e.employee_id, e.first_name, e.last_name, e.email, e.phone || '', e.position, e.department_name || 'Unassigned', e.status, e.hire_date ? e.hire_date.split('T')[0] : ''
      ]);
    } else if (activeReport === 'attendance') {
      headers = ['Employee ID', 'Name', 'Department', 'Position', 'Status', 'Clock In', 'Clock Out', 'Notes'];
      rows = data.map(a => [
        a.employee_id, `${a.first_name} ${a.last_name}`, a.department_name || '', a.position, a.status || 'Present', a.time_in || '', a.time_out || '', a.notes || ''
      ]);
    } else {
      headers = ['Payslip No.', 'Employee', 'Department', 'Basic Salary', 'Allowance', 'Deductions', 'Net Salary', 'Month', 'Year', 'Payment Status'];
      rows = data.map(p => [
        p.payslip_number, `${p.first_name} ${p.last_name}`, p.department_name || '', p.basic_salary, p.allowance, p.deductions, p.net_salary, p.pay_period_month, p.pay_period_year, p.payment_status
      ]);
    }

    // Convert values to CSV structure
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `classic_academy_${activeReport}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="erd-container">
      <div className="panel-header">
        <div>
          <h3 style={{ fontSize: '1.4rem' }}>School Report Center</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Extract summaries, audit database rosters, and download Excel/CSV reports.</p>
        </div>
        {data.length > 0 && (
          <button className="btn-primary" style={{ width: 'auto', display: 'flex', gap: '8px', padding: '10px 20px', alignItems: 'center' }} onClick={exportToCSV}>
            <span>📥 Export to CSV</span>
          </button>
        )}
      </div>

      {error && <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid var(--color-danger)' }}>{error}</div>}

      {/* Tab selection */}
      <div className="glass-panel" style={{ display: 'flex', gap: '10px', padding: '12px 20px', marginBottom: '25px' }}>
        <button 
          className="btn-secondary" 
          style={{ background: activeReport === 'employees' ? 'var(--accent-glow)' : 'transparent', borderColor: activeReport === 'employees' ? 'var(--accent)' : 'var(--border-color)', color: activeReport === 'employees' ? '#fff' : 'var(--text-secondary)' }}
          onClick={() => fetchReport('employees')}
        >
          👤 Employees Directory Report
        </button>
        <button 
          className="btn-secondary" 
          style={{ background: activeReport === 'attendance' ? 'var(--accent-glow)' : 'transparent', borderColor: activeReport === 'attendance' ? 'var(--accent)' : 'var(--border-color)', color: activeReport === 'attendance' ? '#fff' : 'var(--text-secondary)' }}
          onClick={() => fetchReport('attendance')}
        >
          📅 Daily Attendance Audit
        </button>
        <button 
          className="btn-secondary" 
          style={{ background: activeReport === 'payroll' ? 'var(--accent-glow)' : 'transparent', borderColor: activeReport === 'payroll' ? 'var(--accent)' : 'var(--border-color)', color: activeReport === 'payroll' ? '#fff' : 'var(--text-secondary)' }}
          onClick={() => fetchReport('payroll')}
        >
          💵 Salaries & Payroll Summary
        </button>
      </div>

      {/* Roster preview */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ textTransform: 'capitalize', fontSize: '1.1rem' }}>{activeReport} Database Roster Preview</h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Previewing {data.length} records</span>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>Aggregating database contents...</p>
        ) : data.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>No records returned from query.</p>
        ) : (
          <div className="table-responsive">
            <table className="custom-table" style={{ fontSize: '0.85rem' }}>
              {activeReport === 'employees' && (
                <>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Department</th>
                      <th>Position</th>
                      <th>Status</th>
                      <th>Hire Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map(e => (
                      <tr key={e.employee_id}>
                        <td>{e.employee_id}</td>
                        <td style={{ fontWeight: 600 }}>{`${e.first_name} ${e.last_name}`}</td>
                        <td>{e.email}</td>
                        <td>{e.phone || 'N/A'}</td>
                        <td>{e.department_name || 'Unassigned'}</td>
                        <td>{e.position}</td>
                        <td><span className={`badge badge-${e.status.toLowerCase().replace(' ', '')}`}>{e.status}</span></td>
                        <td>{e.hire_date ? e.hire_date.split('T')[0] : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeReport === 'attendance' && (
                <>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Staff Member</th>
                      <th>Department</th>
                      <th>Position</th>
                      <th>Status</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map(a => (
                      <tr key={a.employee_id}>
                        <td>{a.employee_id}</td>
                        <td style={{ fontWeight: 600 }}>{`${a.first_name} ${a.last_name}`}</td>
                        <td>{a.department_name || 'N/A'}</td>
                        <td>{a.position}</td>
                        <td><span className={`badge badge-${(a.status || 'Present').toLowerCase()}`}>{a.status || 'Present'}</span></td>
                        <td>{a.time_in || 'N/A'}</td>
                        <td>{a.time_out || 'N/A'}</td>
                        <td>{a.notes || <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeReport === 'payroll' && (
                <>
                  <thead>
                    <tr>
                      <th>Payslip No.</th>
                      <th>Staff Member</th>
                      <th>Department</th>
                      <th>Basic Salary</th>
                      <th>Allowance</th>
                      <th>Deductions</th>
                      <th>Net Pay</th>
                      <th>Cycle</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map(p => (
                      <tr key={p.salary_id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent)' }}>{p.payslip_number}</td>
                        <td style={{ fontWeight: 600 }}>{`${p.first_name} ${p.last_name}`}</td>
                        <td>{p.department_name}</td>
                        <td>{new Intl.NumberFormat('en-US').format(p.basic_salary)} RWF</td>
                        <td>{new Intl.NumberFormat('en-US').format(p.allowance)} RWF</td>
                        <td style={{ color: 'var(--color-danger)' }}>{new Intl.NumberFormat('en-US').format(p.deductions)} RWF</td>
                        <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{new Intl.NumberFormat('en-US').format(p.net_salary)} RWF</td>
                        <td>{p.pay_period_month}/{p.pay_period_year}</td>
                        <td><span className={`badge badge-${p.payment_status.toLowerCase()}`}>{p.payment_status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
