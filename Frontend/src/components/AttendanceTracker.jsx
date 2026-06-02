import React, { useState, useEffect } from 'react';

export default function AttendanceTracker({ token, userRole }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const canEdit = userRole === 'Admin' || userRole === 'Manager';

  const fetchAttendanceSheet = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`http://localhost:5000/api/attendance?date=${date}`, { headers });
      const data = await res.json();
      if (data.success) {
        // Map null values to defaulted present for ease of use
        const mappedRecords = data.records.map(r => ({
          ...r,
          status: r.status || 'Present',
          time_in: r.time_in || '07:30',
          time_out: r.time_out || '17:00',
          notes: r.notes || ''
        }));
        setRecords(mappedRecords);
      } else {
        setError(data.message || 'Error fetching attendance sheet.');
      }
    } catch (err) {
      setError('Could not connect to API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceSheet();
  }, [token, date]);

  const handleStatusChange = (employeeId, newStatus) => {
    setRecords(prev => prev.map(r => {
      if (r.employee_id === employeeId) {
        return { 
          ...r, 
          status: newStatus,
          // Clear check-in times if marked absent
          time_in: newStatus === 'Absent' ? '' : (r.time_in || '07:30'),
          time_out: newStatus === 'Absent' ? '' : (r.time_out || '17:00')
        };
      }
      return r;
    }));
  };

  const handleFieldChange = (employeeId, field, value) => {
    setRecords(prev => prev.map(r => {
      if (r.employee_id === employeeId) {
        return { ...r, [field]: value };
      }
      return r;
    }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    // Prepare payload
    const payload = {
      date,
      records: records.map(r => ({
        employee_id: r.employee_id,
        status: r.status,
        time_in: r.status === 'Absent' ? null : r.time_in,
        time_out: r.status === 'Absent' ? null : r.time_out,
        notes: r.notes
      }))
    };

    try {
      const res = await fetch('http://localhost:5000/api/attendance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(`Attendance sheet for ${date} saved successfully!`);
        fetchAttendanceSheet();
      } else {
        setError(data.message || 'Failed to save attendance logs.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    }
  };

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 style={{ fontSize: '1.4rem' }}>Daily Attendance registry</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Track, audit, and log attendance checklists at Classic Academy.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Log Date:</label>
          <input 
            type="date" 
            className="input-control" 
            style={{ width: '160px', padding: '8px 12px' }} 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
        </div>
      </div>

      {error && <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid var(--color-danger)' }}>{error}</div>}
      {success && <div style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid var(--color-success)' }}>{success}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden', padding: '10px 0' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading daily log sheet...</p>
        ) : records.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No active employees found to log.</p>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Staff Profile</th>
                  <th>Department & Role</th>
                  <th>Attendance Status</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Administrative Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.employee_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img className="user-avatar" src={rec.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="" style={{ width: '32px', height: '32px' }} />
                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{`${rec.first_name} ${rec.last_name}`}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{rec.department_name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{rec.position}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {['Present', 'Absent', 'Late', 'Excused'].map((status) => {
                          const isActive = rec.status === status;
                          let btnStyle = { padding: '5px 10px', fontSize: '0.75rem', borderRadius: '30px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: canEdit ? 'pointer' : 'default', transition: 'all 0.2s ease' };
                          
                          if (isActive) {
                            if (status === 'Present') {
                              btnStyle.background = 'var(--color-success-bg)';
                              btnStyle.borderColor = 'var(--color-success)';
                              btnStyle.color = 'var(--color-success)';
                            } else if (status === 'Absent') {
                              btnStyle.background = 'var(--color-danger-bg)';
                              btnStyle.borderColor = 'var(--color-danger)';
                              btnStyle.color = 'var(--color-danger)';
                            } else if (status === 'Late') {
                              btnStyle.background = 'var(--color-warning-bg)';
                              btnStyle.borderColor = 'var(--color-warning)';
                              btnStyle.color = 'var(--color-warning)';
                            } else {
                              btnStyle.background = 'var(--color-info-bg)';
                              btnStyle.borderColor = 'var(--color-info)';
                              btnStyle.color = 'var(--color-info)';
                            }
                          }

                          return (
                            <button 
                              key={status}
                              type="button" 
                              style={btnStyle}
                              onClick={() => canEdit && handleStatusChange(rec.employee_id, status)}
                              disabled={!canEdit}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="input-control" 
                        style={{ padding: '6px 10px', width: '75px', textAlign: 'center', fontSize: '0.82rem', borderRadius: '4px' }}
                        value={rec.time_in} 
                        onChange={(e) => handleFieldChange(rec.employee_id, 'time_in', e.target.value)}
                        disabled={!canEdit || rec.status === 'Absent'}
                        placeholder="07:30"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="input-control" 
                        style={{ padding: '6px 10px', width: '75px', textAlign: 'center', fontSize: '0.82rem', borderRadius: '4px' }}
                        value={rec.time_out} 
                        onChange={(e) => handleFieldChange(rec.employee_id, 'time_out', e.target.value)}
                        disabled={!canEdit || rec.status === 'Absent'}
                        placeholder="17:00"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="input-control" 
                        style={{ padding: '6px 10px', fontSize: '0.82rem', borderRadius: '4px' }}
                        placeholder="e.g. Health checkup, traffic" 
                        value={rec.notes}
                        onChange={(e) => handleFieldChange(rec.employee_id, 'notes', e.target.value)}
                        disabled={!canEdit}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canEdit && records.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn-primary" style={{ width: 'auto', padding: '12px 35px' }} onClick={handleSave}>
            Save Daily Attendance
          </button>
        </div>
      )}
    </div>
  );
}
