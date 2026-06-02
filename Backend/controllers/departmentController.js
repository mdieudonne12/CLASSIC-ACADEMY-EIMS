// Classic Academy EIMS - Department Controller
const db = require('../config/db');

// Get all departments (with employee headcount!)
async function getDepartments(req, res, next) {
  try {
    const queryStr = `
      SELECT d.*, COUNT(e.employee_id) AS employee_count 
      FROM departments d 
      LEFT JOIN employees e ON d.department_id = e.department_id 
      GROUP BY d.department_id
    `;
    const [departments] = await db.query(queryStr);
    
    return res.status(200).json({
      success: true,
      departments
    });
  } catch (error) {
    next(error);
  }
}

// Get single department detail
async function getDepartmentById(req, res, next) {
  const { id } = req.params;
  try {
    const [departments] = await db.query('SELECT * FROM departments WHERE department_id = ?', [id]);
    
    if (departments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.'
      });
    }

    // Also fetch employees in this department
    const [employees] = await db.query('SELECT employee_id, first_name, last_name, email, position, status FROM employees WHERE department_id = ?', [id]);

    return res.status(200).json({
      success: true,
      department: departments[0],
      employees
    });
  } catch (error) {
    next(error);
  }
}

// Add new department
async function createDepartment(req, res, next) {
  const { department_name, description } = req.body;

  if (!department_name) {
    return res.status(400).json({
      success: false,
      message: 'Department name is required.'
    });
  }

  try {
    // Check if name already exists
    const [existing] = await db.query('SELECT department_id FROM departments WHERE department_name = ?', [department_name]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A department with this name already exists.'
      });
    }

    const [result] = await db.query(
      'INSERT INTO departments (department_name, description) VALUES (?, ?)',
      [department_name, description || '']
    );

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department_id: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

// Update department
async function updateDepartment(req, res, next) {
  const { id } = req.params;
  const { department_name, description } = req.body;

  if (!department_name) {
    return res.status(400).json({
      success: false,
      message: 'Department name is required.'
    });
  }

  try {
    // Check if department exists
    const [departments] = await db.query('SELECT department_id FROM departments WHERE department_id = ?', [id]);
    if (departments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.'
      });
    }

    // Check name conflict
    const [conflict] = await db.query(
      'SELECT department_id FROM departments WHERE department_name = ? AND department_id != ?',
      [department_name, id]
    );
    if (conflict.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Another department with this name already exists.'
      });
    }

    await db.query(
      'UPDATE departments SET department_name = ?, description = ? WHERE department_id = ?',
      [department_name, description || '', id]
    );

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

// Delete department
async function deleteDepartment(req, res, next) {
  const { id } = req.params;
  try {
    const [departments] = await db.query('SELECT department_id FROM departments WHERE department_id = ?', [id]);
    if (departments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.'
      });
    }

    // Note: Database triggers ON DELETE SET NULL on employees, but we can verify
    await db.query('DELETE FROM departments WHERE department_id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
