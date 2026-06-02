import React, { useState, useEffect } from 'react';

export default function DepartmentManagement({ token, userRole }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null); // null means adding
  const [formData, setFormData] = useState({ department_name: '', description: '' });

  // Access check
  const canEdit = userRole === 'Admin' || userRole === 'Manager';

  const fetchDepartments = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('http://localhost:5000/api/departments', { headers });
      const data = await res.json();
      if (data.success) {
        setDepartments(data.departments);
      } else {
        setError(data.message || 'Failed to fetch departments.');
      }
    } catch (err) {
      setError('Could not connect to API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [token]);

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({ department_name: '', description: '' });
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({ 
      department_name: dept.department_name, 
      description: dept.description || '' 
    });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.department_name) {
      setError('Department name is required.');
      return;
    }

    try {
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      let url = 'http://localhost:5000/api/departments';
      let method = 'POST';

      if (editingDept) {
        url = `http://localhost:5000/api/departments/${editingDept.department_id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(editingDept ? 'Department updated successfully.' : 'Department created successfully.');
        setModalOpen(false);
        fetchDepartments();
      } else {
        setError(data.message || 'Error saving department.');
      }
    } catch (err) {
      setError('Server connection error.');
    }
  };

  const handleDelete = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department? Employees inside this department will be set to unassigned.')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`http://localhost:5000/api/departments/${deptId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Department deleted successfully.');
        fetchDepartments();
      } else {
        setError(data.message || 'Failed to delete department.');
      }
    } catch (err) {
      setError('Server connection error.');
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Loading departments roster...</div>;
  }

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 style={{ fontSize: '1.4rem' }}>Departments Overview</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Organize, view, and update divisions at Classic Academy.</p>
        </div>
        {canEdit && (
          <button className="btn-primary" style={{ width: 'auto', display: 'flex', gap: '8px', padding: '10px 20px', alignItems: 'center' }} onClick={openAddModal}>
            <span>+ Add Department</span>
          </button>
        )}
      </div>

      {error && <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid var(--color-danger)' }}>{error}</div>}
      {success && <div style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid var(--color-success)' }}>{success}</div>}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {departments.map((dept) => (
          <div key={dept.department_id} className="glass-panel section-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', minHeight: '200px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{dept.department_name}</h4>
                <span className="badge badge-active">{dept.employee_count} Staff</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                {dept.description || 'No detailed description set.'}
              </p>
            </div>
            
            {canEdit && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => openEditModal(dept)}>Edit</button>
                <button className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleDelete(dept.department_id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>{editingDept ? 'Update Department' : 'Create New Department'}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Department Name</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    name="department_name" 
                    className="input-control" 
                    placeholder="e.g. Administration, Mathematics & Sciences"
                    value={formData.department_name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <div className="input-wrapper">
                  <textarea 
                    name="description" 
                    className="input-control" 
                    rows="4" 
                    placeholder="Describe the operations of this department..."
                    value={formData.description} 
                    onChange={handleInputChange}
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
