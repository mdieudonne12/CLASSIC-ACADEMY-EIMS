import React from 'react';

export default function SystemERD() {
  const schema = [
    {
      name: 'users',
      description: 'System User Logins & Roles',
      fields: [
        { name: 'user_id', type: 'INT (PK)', key: 'pk' },
        { name: 'username', type: 'VARCHAR(50) [UQ]', key: '' },
        { name: 'password_hash', type: 'VARCHAR(255)', key: '' },
        { name: 'email', type: 'VARCHAR(100) [UQ]', key: '' },
        { name: 'role', type: "ENUM('Admin', 'Manager', 'Employee')", key: '' },
        { name: 'employee_id', type: 'INT (FK)', key: 'fk' },
        { name: 'created_at', type: 'TIMESTAMP', key: '' }
      ]
    },
    {
      name: 'employees',
      description: 'Central Employee Registry',
      fields: [
        { name: 'employee_id', type: 'INT (PK)', key: 'pk' },
        { name: 'first_name', type: 'VARCHAR(50)', key: '' },
        { name: 'last_name', type: 'VARCHAR(50)', key: '' },
        { name: 'email', type: 'VARCHAR(100) [UQ]', key: '' },
        { name: 'phone', type: 'VARCHAR(20)', key: '' },
        { name: 'gender', type: 'VARCHAR(10)', key: '' },
        { name: 'date_of_birth', type: 'DATE', key: '' },
        { name: 'hire_date', type: 'DATE', key: '' },
        { name: 'department_id', type: 'INT (FK)', key: 'fk' },
        { name: 'position', type: 'VARCHAR(100)', key: '' },
        { name: 'status', type: "ENUM('Active', 'Inactive', 'On Leave')", key: '' },
        { name: 'avatar_url', type: 'VARCHAR(255)', key: '' },
        { name: 'created_at', type: 'TIMESTAMP', key: '' }
      ]
    },
    {
      name: 'departments',
      description: 'School Departments Roster',
      fields: [
        { name: 'department_id', type: 'INT (PK)', key: 'pk' },
        { name: 'department_name', type: 'VARCHAR(100) [UQ]', key: '' },
        { name: 'description', type: 'TEXT', key: '' },
        { name: 'created_at', type: 'TIMESTAMP', key: '' }
      ]
    },
    {
      name: 'attendance',
      description: 'Daily Check-in Tracker',
      fields: [
        { name: 'attendance_id', type: 'INT (PK)', key: 'pk' },
        { name: 'employee_id', type: 'INT (FK)', key: 'fk' },
        { name: 'date', type: 'DATE', key: '' },
        { name: 'status', type: "ENUM('Present', 'Absent', 'Late', 'Excused')", key: '' },
        { name: 'time_in', type: 'TIME', key: '' },
        { name: 'time_out', type: 'TIME', key: '' },
        { name: 'notes', type: 'VARCHAR(255)', key: '' }
      ]
    },
    {
      name: 'salaries',
      description: 'Payroll Invoices & Receipts',
      fields: [
        { name: 'salary_id', type: 'INT (PK)', key: 'pk' },
        { name: 'employee_id', type: 'INT (FK)', key: 'fk' },
        { name: 'basic_salary', type: 'DECIMAL(10,2)', key: '' },
        { name: 'allowance', type: 'DECIMAL(10,2)', key: '' },
        { name: 'deductions', type: 'DECIMAL(10,2)', key: '' },
        { name: 'pay_period_month', type: 'INT', key: '' },
        { name: 'pay_period_year', type: 'INT', key: '' },
        { name: 'payment_date', type: 'DATE', key: '' },
        { name: 'payment_status', type: "ENUM('Paid', 'Pending', 'Failed')", key: '' },
        { name: 'payslip_number', type: 'VARCHAR(50) [UQ]', key: '' }
      ]
    }
  ];

  return (
    <div className="erd-container">
      <div className="glass-panel section-panel" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '8px' }}>Classic Academy relational 3NF Schema & ERD</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
          This visual represents the Third Normal Form (3NF) relational database schema for the school EIMS. 
          Foreign keys enforce data integrity across tables, with cascade and set-null bindings applied on delete actions to maintain logical constraints automatically.
        </p>
      </div>

      <div className="erd-canvas">
        {schema.map((table, idx) => (
          <div key={idx} className="erd-node glass-panel" style={{ minWidth: '250px' }}>
            <div className="erd-node-header">
              <span>{table.name}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Table</span>
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.15)', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', fontStyle: 'italic' }}>
              {table.description}
            </div>
            <div className="erd-node-fields">
              {table.fields.map((f, fIdx) => (
                <div key={fIdx} className={`erd-field ${f.key}`}>
                  <span className="field-name" style={{ fontWeight: f.key ? 'bold' : 'normal' }}>{f.name}</span>
                  <span className="field-type" style={{ color: f.key === 'pk' ? 'var(--accent)' : 'var(--text-secondary)' }}>{f.type}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel section-panel" style={{ marginTop: '20px' }}>
        <h4 style={{ color: 'var(--accent)', marginBottom: '10px' }}>Normalization Details (3NF Compliance)</h4>
        <ul style={{ listStyleType: 'square', paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>
            <strong>First Normal Form (1NF):</strong> All fields are atomic (e.g., separating <code>first_name</code> and <code>last_name</code>; single attendance status and logs).
          </li>
          <li>
            <strong>Second Normal Form (2NF):</strong> All tables are in 1NF and every column depends entirely on the respective surrogate primary key (such as <code>employee_id</code> or <code>salary_id</code>).
          </li>
          <li>
            <strong>Third Normal Form (3NF):</strong> No transitive dependencies exist. For example, employee addresses are avoided in the primary registry, and the <code>department_name</code> is separated into the <code>departments</code> table to prevent repeating texts in the employee roster. Net salaries are calculated on-the-fly dynamically to avoid data anomalies.
          </li>
        </ul>
      </div>
    </div>
  );
}
