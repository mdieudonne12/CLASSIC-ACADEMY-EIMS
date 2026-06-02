import React, { useState, useEffect, useRef } from 'react';

export default function EmployeeManagement({ token, userRole }) {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null); // null means adding
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    gender: 'Male', date_of_birth: '', hire_date: '',
    department_id: '', position: '', status: 'Active', avatar_url: ''
  });

  const [bulkFeedback, setBulkFeedback] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef(null);
  const canEdit = userRole === 'Admin' || userRole === 'Manager';

  const fetchEmployees = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      let url = 'http://localhost:5000/api/employees';
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (deptFilter) params.push(`department_id=${deptFilter}`);
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url, { headers });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (err) {
      setError('Could not connect to API server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('http://localhost:5000/api/departments', { headers });
      const data = await res.json();
      if (data.success) {
        setDepartments(data.departments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [token, search, deptFilter, statusFilter]);

  const openAddForm = () => {
    setEditingEmp(null);
    setFormData({
      first_name: '', last_name: '', email: '', phone: '',
      gender: 'Male', date_of_birth: '', 
      hire_date: new Date().toISOString().split('T')[0],
      department_id: departments[0]?.department_id || '', 
      position: '', status: 'Active', avatar_url: ''
    });
    setFormOpen(true);
  };

  const openEditForm = (emp) => {
    setEditingEmp(emp);
    setFormData({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone || '',
      gender: emp.gender || 'Male',
      date_of_birth: emp.date_of_birth ? emp.date_of_birth.split('T')[0] : '',
      hire_date: emp.hire_date ? emp.hire_date.split('T')[0] : '',
      department_id: emp.department_id || '',
      position: emp.position,
      status: emp.status || 'Active',
      avatar_url: emp.avatar_url || ''
    });
    setFormOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      let url = 'http://localhost:5000/api/employees';
      let method = 'POST';

      if (editingEmp) {
        url = `http://localhost:5000/api/employees/${editingEmp.employee_id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(editingEmp ? 'Employee records updated successfully.' : 'Employee registered successfully.');
        setFormOpen(false);
        fetchEmployees();
      } else {
        setError(data.message || 'Error processing request.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    }
  };

  const handleDelete = async (empId) => {
    if (!window.confirm('Are you sure you want to delete this employee? This will purge all associated user logins, attendance records and salary logs permanently.')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`http://localhost:5000/api/employees/${empId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Employee record successfully removed.');
        fetchEmployees();
      } else {
        setError(data.message || 'Failed to remove employee.');
      }
    } catch (err) {
      setError('Connection error.');
    }
  };

  // CSV Drag and Drop Bulk Uploader logic
  const handleCSVUpload = (e) => {
    setError('');
    setBulkFeedback(null);
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a valid CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      if (lines.length < 2) {
        setError('CSV file is empty or missing data rows.');
        return;
      }

      // Parse CSV header columns
      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
      const records = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Custom CSV line split ignoring commas inside quotes
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^["']|["']$/g, ''));
        const emp = {};
        
        headers.forEach((h, idx) => {
          emp[h] = values[idx] || '';
        });

        // Map alternate column names
        const cleanEmp = {
          first_name: emp.first_name || emp.firstname || '',
          last_name: emp.last_name || emp.lastname || '',
          email: emp.email || '',
          phone: emp.phone || emp.telephone || '',
          gender: emp.gender || '',
          date_of_birth: emp.date_of_birth || emp.dob || '',
          hire_date: emp.hire_date || emp.hired || '',
          department_name: emp.department_name || emp.department || '',
          position: emp.position || emp.role || '',
          status: emp.status || 'Active'
        };

        records.push(cleanEmp);
      }

      // Submit parsed JSON to Backend bulk upload endpoint
      try {
        const res = await fetch('http://localhost:5000/api/employees/bulk', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ employees: records })
        });
        const data = await res.json();
        
        if (data.success) {
          setSuccess(`Bulk import complete. Imported ${data.successCount} employees successfully.`);
          if (data.failureCount > 0) {
            setBulkFeedback(data.errors);
          }
          fetchEmployees();
        } else {
          setError(data.message || 'Bulk upload failed.');
        }
      } catch (err) {
        setError('Server upload failed.');
      }
    };
    reader.readAsText(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 style={{ fontSize: '1.4rem' }}>Employee Directory</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Search, manage profiles, track and audit employee structures.</p>
        </div>
        {canEdit && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" style={{ display: 'flex', gap: '8px', padding: '10px 16px', alignItems: 'center' }} onClick={() => setBulkOpen(true)}>
              <span>📁 Bulk Upload</span>
            </button>
            <button className="btn-primary" style={{ width: 'auto', display: 'flex', gap: '8px', padding: '10px 20px', alignItems: 'center' }} onClick={openAddForm}>
              <span>+ Add Employee</span>
            </button>
          </div>
        )}
      </div>

      {error && <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid var(--color-danger)' }}>{error}</div>}
      {success && <div style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid var(--color-success)' }}>{success}</div>}

      {/* Bulk Import Feedback Errors */}
      {bulkFeedback && (
        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', maxHeight: '150px', overflowY: 'auto' }}>
          <h5 style={{ color: 'var(--color-warning)', marginBottom: '6px' }}>Bulk Import Warnings/Failures:</h5>
          <ul style={{ listStyleType: 'circle', paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {bulkFeedback.map((e, idx) => <li key={idx}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Directory Filter Bar */}
      <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '20px', marginBottom: '30px', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <input 
            type="text" 
            className="input-control" 
            placeholder="Search by name, email, or position..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div style={{ width: '180px' }}>
          <select className="input-control" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
          </select>
        </div>
        <div style={{ width: '150px' }}>
          <select className="input-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Table of employees */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading registry records...</p>
        ) : employees.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No employee records match the selected filters.</p>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Email & Phone</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Status</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.employee_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img className="user-avatar" src={emp.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="" />
                        <div>
                          <h4 style={{ fontSize: '0.95rem' }}>{`${emp.first_name} ${emp.last_name}`}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {emp.employee_id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                        <span>{emp.email}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{emp.phone || 'No phone'}</span>
                      </div>
                    </td>
                    <td>{emp.department_name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                    <td>{emp.position}</td>
                    <td>
                      <span className={`badge badge-${emp.status.toLowerCase().replace(' ', '')}`}>{emp.status}</span>
                    </td>
                    {canEdit && (
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => openEditForm(emp)}>Edit</button>
                          <button className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleDelete(emp.employee_id)}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {formOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>{editingEmp ? 'Edit Employee Details' : 'Register New Employee'}</h3>
              <button className="close-btn" onClick={() => setFormOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>First Name</label>
                  <input type="text" name="first_name" className="input-control" value={formData.first_name} onChange={handleInputChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Last Name</label>
                  <input type="text" name="last_name" className="input-control" value={formData.last_name} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Email Address</label>
                  <input type="email" name="email" className="input-control" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Phone Number</label>
                  <input type="text" name="phone" className="input-control" value={formData.phone} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Department</label>
                  <select name="department_id" className="input-control" value={formData.department_id} onChange={handleInputChange}>
                    <option value="">Unassigned</option>
                    {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Position / Role</label>
                  <input type="text" name="position" className="input-control" placeholder="e.g. Teacher, Administrator" value={formData.position} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Gender</label>
                  <select name="gender" className="input-control" value={formData.gender} onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Status</label>
                  <select name="status" className="input-control" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date of Birth</label>
                  <input type="date" name="date_of_birth" className="input-control" value={formData.date_of_birth} onChange={handleInputChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Hire Date</label>
                  <input type="date" name="hire_date" className="input-control" value={formData.hire_date} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Profile Picture URL</label>
                <input type="text" name="avatar_url" className="input-control" placeholder="URL linking to image avatar" value={formData.avatar_url} onChange={handleInputChange} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>{editingEmp ? 'Update Profile' : 'Register Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Upload Modal */}
      {bulkOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Bulk Import Employee Registry</h3>
              <button className="close-btn" onClick={() => setBulkOpen(false)}>&times;</button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Select a <code>.csv</code> file populated with employee headers. 
              Required headers: <code>first_name</code>, <code>last_name</code>, <code>email</code>, and <code>position</code>.
            </p>

            <div className="dropzone" onClick={triggerFileSelect}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <h4>Drag CSV file here or click to browse</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Supports standard formats (UTF-8)</p>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".csv" 
              onChange={handleCSVUpload} 
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button type="button" className="btn-secondary" onClick={() => setBulkOpen(false)}>Close Panel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
