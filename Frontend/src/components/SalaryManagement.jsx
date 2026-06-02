import React, { useState, useEffect } from 'react';

export default function SalaryManagement({ token, userRole }) {
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [year, setYear] = useState(new Date().getFullYear());

  // Modals state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payslipOpen, setPayslipOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  
  const [formData, setFormData] = useState({
    employee_id: '', basic_salary: '', allowance: '0', deductions: '0',
    pay_period_month: new Date().getMonth() + 1,
    pay_period_year: new Date().getFullYear(),
    payment_status: 'Paid', payment_date: new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const canEdit = userRole === 'Admin' || userRole === 'Manager';

  const fetchPayments = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`http://localhost:5000/api/salaries?month=${month}&year=${year}`, { headers });
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (err) {
      setError('Could not connect to API server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('http://localhost:5000/api/employees', { headers });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees.filter(e => e.status === 'Active'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchEmployees();
  }, [token, month, year]);

  const openPaymentModal = () => {
    setFormData({
      employee_id: employees[0]?.employee_id || '',
      basic_salary: '', allowance: '0', deductions: '0',
      pay_period_month: month,
      pay_period_year: year,
      payment_status: 'Paid',
      payment_date: new Date().toISOString().split('T')[0]
    });
    setError('');
    setPaymentOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Autofill basic salary if employee changes
    if (name === 'employee_id') {
      const selected = employees.find(emp => String(emp.employee_id) === String(value));
      // In a real database we could store a default basic salary on the employee record, 
      // but for this dashboard form, we let HR define it or fill standard rates.
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.employee_id || !formData.basic_salary) {
      setError('Employee and basic salary are required.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/salaries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Salary payment recorded successfully.');
        setPaymentOpen(false);
        fetchPayments();
      } else {
        setError(data.message || 'Failed to record payment.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    }
  };

  const viewPayslip = async (payment) => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`http://localhost:5000/api/salaries/payslip/${payment.salary_id}`, { headers });
      const data = await res.json();
      if (data.success) {
        setSelectedPayslip(data.payslip);
        setPayslipOpen(true);
      } else {
        alert(data.message || 'Error loading payslip.');
      }
    } catch (err) {
      alert('Could not fetch payslip details.');
    }
  };

  const printPayslip = () => {
    const printContents = document.getElementById('printable-payslip-area').innerHTML;
    const originalContents = document.body.innerHTML;
    
    // Quick in-browser print window utility
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>CLASSIC ACADEMY PAYSLIP</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; background: #fff; color: #000; }
            .payslip-container { padding: 30px; border: 1px solid #ccc; max-width: 800px; margin: 0 auto; position: relative; }
            .payslip-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 4rem; font-weight: bold; color: rgba(0, 0, 0, 0.03); letter-spacing: 0.1em; pointer-events: none; text-transform: uppercase; }
            .payslip-header { display: flex; justify-content: space-between; border-bottom: 3px double #000; padding-bottom: 15px; margin-bottom: 20px; }
            .school-details h2 { margin: 0 0 5px 0; font-size: 1.4rem; }
            .school-details p { margin: 2px 0; font-size: 0.8rem; color: #444; }
            .payslip-meta { text-align: right; }
            .payslip-meta h3 { margin: 0 0 5px 0; font-size: 1.1rem; }
            .payslip-meta p { margin: 2px 0; font-size: 0.8rem; color: #444; }
            .payslip-body { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 6px 0; font-size: 0.85rem; border-bottom: 1px solid #eee; }
            td.label { font-weight: bold; color: #555; width: 40%; }
            th { text-align: left; padding: 6px; background: #f0f0f0; font-size: 0.85rem; border-bottom: 2px solid #000; }
            td.amount { text-align: right; font-family: monospace; }
            .payslip-summary { grid-column: span 2; background: #f9f9f9; border: 1px solid #ddd; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
            .payslip-footer { border-top: 1px solid #ddd; padding-top: 15px; display: flex; justify-content: space-between; font-size: 0.75rem; color: #666; margin-top: 20px; }
            .signature-block { text-align: center; width: 180px; }
            .signature-line { margin-top: 40px; border-top: 1px solid #000; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="payslip-container">
            ${printContents}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatRWF = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(value);
  };

  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNum - 1] || monthNum;
  };

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 style={{ fontSize: '1.4rem' }}>Salary & Payroll Management</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Process payments, disburse allowances, and audit staff payslips.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select className="input-control" style={{ width: '130px', padding: '8px 12px' }} value={month} onChange={(e) => setMonth(e.target.value)}>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{getMonthName(m)}</option>)}
          </select>
          <select className="input-control" style={{ width: '100px', padding: '8px 12px' }} value={year} onChange={(e) => setYear(e.target.value)}>
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {canEdit && (
            <button className="btn-primary" style={{ width: 'auto', display: 'flex', gap: '8px', padding: '10px 20px', alignItems: 'center' }} onClick={openPaymentModal}>
              <span>💳 Process Salary</span>
            </button>
          )}
        </div>
      </div>

      {error && <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid var(--color-danger)' }}>{error}</div>}
      {success && <div style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid var(--color-success)' }}>{success}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading payroll lists...</p>
        ) : payments.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No payroll payments recorded for the selected cycle.</p>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Payslip No.</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Basic Salary</th>
                  <th>Net Paid</th>
                  <th>Status</th>
                  <th>Disburse Details</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.salary_id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent)' }}>{p.payslip_number}</td>
                    <td>{`${p.first_name} ${p.last_name}`}</td>
                    <td>{p.department_name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{formatRWF(p.basic_salary)}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatRWF(p.net_salary)}</td>
                    <td>
                      <span className={`badge badge-${p.payment_status.toLowerCase()}`}>{p.payment_status}</span>
                    </td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => viewPayslip(p)}>
                        View Payslip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Salary Payment Modal */}
      {paymentOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Process Employee Salary</h3>
              <button className="close-btn" onClick={() => setPaymentOpen(false)}>&times;</button>
            </div>
            {employees.length === 0 ? (
              <p style={{ color: 'var(--color-danger)' }}>No active employees found to pay. Please add employees first.</p>
            ) : (
              <form onSubmit={handlePaymentSubmit}>
                <div className="form-group">
                  <label>Select Employee</label>
                  <select name="employee_id" className="input-control" value={formData.employee_id} onChange={handleInputChange} required>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {`${emp.first_name} ${emp.last_name} (${emp.position})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Basic Salary (RWF)</label>
                    <input type="number" name="basic_salary" className="input-control" placeholder="e.g. 500000" value={formData.basic_salary} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Allowance (RWF)</label>
                    <input type="number" name="allowance" className="input-control" value={formData.allowance} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Deductions (RWF)</label>
                    <input type="number" name="deductions" className="input-control" value={formData.deductions} onChange={handleInputChange} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Payment Date</label>
                    <input type="date" name="payment_date" className="input-control" value={formData.payment_date} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Payment Month</label>
                    <select name="pay_period_month" className="input-control" value={formData.pay_period_month} onChange={handleInputChange}>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{getMonthName(m)}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Payment Year</label>
                    <select name="pay_period_year" className="input-control" value={formData.pay_period_year} onChange={handleInputChange}>
                      {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Disburse Status</label>
                  <select name="payment_status" className="input-control" value={formData.payment_status} onChange={handleInputChange}>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setPaymentOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Disburse Payment</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {payslipOpen && selectedPayslip && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '850px', background: '#ffffff', color: '#1a1a1a' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ color: '#000', background: 'none', WebkitTextFillColor: 'initial' }}>Official Staff Payslip</h3>
              <button className="close-btn" style={{ color: '#666' }} onClick={() => setPayslipOpen(false)}>&times;</button>
            </div>

            <div style={{ padding: '20px 0' }}>
              <div id="printable-payslip-area" className="payslip-container" style={{ boxShadow: 'none', padding: '10px 0' }}>
                <div className="payslip-watermark">CLASSIC ACADEMY</div>
                
                <div className="payslip-header">
                  <div className="school-details">
                    <h2>CLASSIC ACADEMY SCHOOL</h2>
                    <p>Secondary Boarding & Day School</p>
                    <p>Ntarabana Sector, Rulindo District, Northern Province</p>
                    <p>Contact: info@classicacademy.ac.rw | +250 788 123 456</p>
                  </div>
                  <div className="payslip-meta">
                    <h3>PAYSLIP STATEMENT</h3>
                    <p style={{ fontWeight: 'bold' }}>No: {selectedPayslip.payslip_number}</p>
                    <p>Period: {getMonthName(selectedPayslip.pay_period_month)} {selectedPayslip.pay_period_year}</p>
                    <p>Status: <span style={{ color: selectedPayslip.payment_status === 'Paid' ? 'green' : 'orange', fontWeight: 'bold' }}>{selectedPayslip.payment_status}</span></p>
                  </div>
                </div>

                <div className="payslip-body">
                  {/* Left: Employee details */}
                  <div className="employee-payroll-info">
                    <table>
                      <tbody>
                        <tr>
                          <td className="label">Employee Name</td>
                          <td style={{ fontWeight: 'bold' }}>{`${selectedPayslip.first_name} ${selectedPayslip.last_name}`}</td>
                        </tr>
                        <tr>
                          <td className="label">Employee ID</td>
                          <td>EMP-{selectedPayslip.employee_id}</td>
                        </tr>
                        <tr>
                          <td className="label">Department</td>
                          <td>{selectedPayslip.department_name}</td>
                        </tr>
                        <tr>
                          <td className="label">Position</td>
                          <td>{selectedPayslip.position}</td>
                        </tr>
                        <tr>
                          <td className="label">Date of Payment</td>
                          <td>{selectedPayslip.payment_date ? selectedPayslip.payment_date.split('T')[0] : 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Right: Salary breakdown */}
                  <div className="salary-breakdown">
                    <table>
                      <thead>
                        <tr>
                          <th>Salary Parameter</th>
                          <th style={{ textAlign: 'right' }}>Amount (RWF)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Basic Salary (+)</td>
                          <td className="amount">{formatRWF(selectedPayslip.basic_salary)}</td>
                        </tr>
                        <tr>
                          <td>Allowances (+)</td>
                          <td className="amount">{formatRWF(selectedPayslip.allowance)}</td>
                        </tr>
                        <tr>
                          <td>Deductions (-)</td>
                          <td className="amount" style={{ color: 'red' }}>({formatRWF(selectedPayslip.deductions)})</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Summary row */}
                  <div className="payslip-summary">
                    <div>
                      <h4 style={{ textTransform: 'uppercase', color: '#555', fontSize: '0.85rem' }}>Net Salary Disbursed</h4>
                      <p style={{ fontSize: '0.75rem', color: '#888' }}>Direct bank deposit credit</p>
                    </div>
                    <div className="net-amount">
                      <h4>{formatRWF(selectedPayslip.net_salary)}</h4>
                    </div>
                  </div>

                  {/* Signature block */}
                  <div className="payslip-summary" style={{ gridColumn: 'span 2', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', padding: '40px 10px 0 10px' }}>
                    <div className="signature-block">
                      <p style={{ fontSize: '0.8rem', color: '#555' }}>Employee Signature</p>
                      <div className="signature-line">Date: _______________</div>
                    </div>
                    <div className="signature-block">
                      <p style={{ fontSize: '0.8rem', color: '#555' }}>Headmaster Authorized</p>
                      <div className="signature-line">Classic Academy Seal</div>
                    </div>
                  </div>
                </div>

                <div className="payslip-footer">
                  <p>Computer generated payslip. No physical signature required.</p>
                  <p>© 2026 Classic Academy EIMS</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <button type="button" className="btn-secondary" style={{ borderColor: '#ccc', color: '#333' }} onClick={() => setPayslipOpen(false)}>Close</button>
              <button type="button" className="btn-primary" style={{ width: 'auto', padding: '10px 24px', background: '#000', color: '#fff' }} onClick={printPayslip}>Print Payslip</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
