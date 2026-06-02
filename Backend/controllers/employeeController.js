// Classic Academy EIMS - Employee Controller
const db = require('../config/db');

// Get all employees (with filters and search!)
async function getEmployees(req, res, next) {
  const { search, department_id, status } = req.query;
  let queryStr = `
    SELECT e.*, d.department_name 
    FROM employees e 
    LEFT JOIN departments d ON e.department_id = d.department_id
  `;
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push('(e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.position LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (department_id) {
    conditions.push('e.department_id = ?');
    params.push(department_id);
  }

  if (status) {
    conditions.push('e.status = ?');
    params.push(status);
  }

  if (conditions.length > 0) {
    queryStr += ' WHERE ' + conditions.join(' AND ');
  }

  // Sort by hire date descending by default
  queryStr += ' ORDER BY e.employee_id DESC';

  try {
    const [employees] = await db.query(queryStr, params);
    return res.status(200).json({
      success: true,
      employees
    });
  } catch (error) {
    next(error);
  }
}

// Get single employee by ID
async function getEmployeeById(req, res, next) {
  const { id } = req.params;
  try {
    const [employees] = await db.query(
      'SELECT e.*, d.department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.department_id WHERE e.employee_id = ?', 
      [id]
    );

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    // Fetch employee attendance history (latest 10)
    const [attendance] = await db.query(
      'SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT 10', 
      [id]
    );

    // Fetch employee salary history (latest 6)
    const [salaries] = await db.query(
      'SELECT * FROM salaries WHERE employee_id = ? ORDER BY pay_period_year DESC, pay_period_month DESC LIMIT 6', 
      [id]
    );

    return res.status(200).json({
      success: true,
      employee: employees[0],
      attendance,
      salaries
    });
  } catch (error) {
    next(error);
  }
}

// Register new employee
async function createEmployee(req, res, next) {
  const { 
    first_name, last_name, email, phone, gender, 
    date_of_birth, hire_date, department_id, position, status, avatar_url 
  } = req.body;

  if (!first_name || !last_name || !email || !position) {
    return res.status(400).json({
      success: false,
      message: 'First name, last name, email, and position are required fields.'
    });
  }

  try {
    // Check if email exists
    const [existing] = await db.query('SELECT employee_id FROM employees WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this email is already registered.'
      });
    }

    // Set default avatar if empty
    const finalAvatar = avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    const [result] = await db.query(
      `INSERT INTO employees (
        first_name, last_name, email, phone, gender, 
        date_of_birth, hire_date, department_id, position, status, avatar_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name, last_name, email, phone || null, gender || null,
        date_of_birth || null, hire_date || new Date().toISOString().split('T')[0],
        department_id ? parseInt(department_id) : null, position, status || 'Active', finalAvatar
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Employee registered successfully.',
      employee_id: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

// Edit employee details
async function updateEmployee(req, res, next) {
  const { id } = req.params;
  const { 
    first_name, last_name, email, phone, gender, 
    date_of_birth, hire_date, department_id, position, status, avatar_url 
  } = req.body;

  if (!first_name || !last_name || !email || !position) {
    return res.status(400).json({
      success: false,
      message: 'First name, last name, email, and position are required fields.'
    });
  }

  try {
    // Check if employee exists
    const [employees] = await db.query('SELECT employee_id FROM employees WHERE employee_id = ?', [id]);
    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    // Check email conflicts
    const [conflict] = await db.query('SELECT employee_id FROM employees WHERE email = ? AND employee_id != ?', [email, id]);
    if (conflict.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Another employee is already using this email.'
      });
    }

    await db.query(
      `UPDATE employees SET 
        first_name = ?, last_name = ?, email = ?, phone = ?, gender = ?, 
        date_of_birth = ?, hire_date = ?, department_id = ?, position = ?, status = ?, avatar_url = ?
      WHERE employee_id = ?`,
      [
        first_name, last_name, email, phone || null, gender || null,
        date_of_birth || null, hire_date || null,
        department_id ? parseInt(department_id) : null, position, status || 'Active', avatar_url || null, id
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Employee records updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

// Delete employee
async function deleteEmployee(req, res, next) {
  const { id } = req.params;
  try {
    const [employees] = await db.query('SELECT employee_id FROM employees WHERE employee_id = ?', [id]);
    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    // Delete the employee (cascades to attendance and salaries)
    await db.query('DELETE FROM employees WHERE employee_id = ?', [id]);

    // Also delete any associated user logins
    await db.query('DELETE FROM users WHERE employee_id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Employee deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

// Bulk Upload Employees via JSON list or CSV parsed records
async function bulkUploadEmployees(req, res, next) {
  const { employees } = req.body; // Expecting an array of employee objects

  if (!employees || !Array.isArray(employees) || employees.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid upload data. An array of employee objects is required.'
    });
  }

  let successCount = 0;
  let failureCount = 0;
  const errors = [];

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const { first_name, last_name, email, phone, gender, date_of_birth, hire_date, department_name, position, status } = emp;

    if (!first_name || !last_name || !email || !position) {
      failureCount++;
      errors.push(`Row ${i + 1}: Missing required fields (first_name, last_name, email, position).`);
      continue;
    }

    try {
      // Check email duplicate
      const [dup] = await db.query('SELECT employee_id FROM employees WHERE email = ?', [email]);
      if (dup.length > 0) {
        failureCount++;
        errors.push(`Row ${i + 1}: Email '${email}' is already registered.`);
        continue;
      }

      // Lookup department_id by name if provided
      let deptId = null;
      if (department_name) {
        const [dept] = await db.query('SELECT department_id FROM departments WHERE department_name = ?', [department_name]);
        if (dept.length > 0) {
          deptId = dept[0].department_id;
        } else {
          // If department doesn't exist, create it on the fly! Very nice feature!
          const [newDept] = await db.query('INSERT INTO departments (department_name) VALUES (?)', [department_name]);
          deptId = newDept.insertId;
        }
      }

      const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

      await db.query(
        `INSERT INTO employees (
          first_name, last_name, email, phone, gender, 
          date_of_birth, hire_date, department_id, position, status, avatar_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          first_name, last_name, email, phone || null, gender || null,
          date_of_birth || null, hire_date || new Date().toISOString().split('T')[0],
          deptId, position, status || 'Active', defaultAvatar
        ]
      );
      successCount++;
    } catch (err) {
      failureCount++;
      errors.push(`Row ${i + 1}: DB Error - ${err.message}`);
    }
  }

  return res.status(200).json({
    success: true,
    message: `Bulk import completed. Imported: ${successCount}, Failed: ${failureCount}.`,
    successCount,
    failureCount,
    errors
  });
}

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  bulkUploadEmployees
};
