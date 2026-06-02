// Classic Academy EIMS - Salary & Payroll Controller
const db = require('../config/db');

// Get all salary payments / payroll logs
async function getSalaryPayments(req, res, next) {
  const { month, year, department_id } = req.query;
  
  let queryStr = `
    SELECT 
      s.*, 
      (s.basic_salary + s.allowance - s.deductions) AS net_salary,
      e.first_name, 
      e.last_name, 
      e.email,
      e.position,
      d.department_name
    FROM salaries s
    JOIN employees e ON s.employee_id = e.employee_id
    LEFT JOIN departments d ON e.department_id = d.department_id
  `;
  
  const params = [];
  const conditions = [];

  if (month) {
    conditions.push('s.pay_period_month = ?');
    params.push(parseInt(month));
  }

  if (year) {
    conditions.push('s.pay_period_year = ?');
    params.push(parseInt(year));
  }

  if (department_id) {
    conditions.push('e.department_id = ?');
    params.push(parseInt(department_id));
  }

  if (conditions.length > 0) {
    queryStr += ' WHERE ' + conditions.join(' AND ');
  }

  queryStr += ' ORDER BY s.pay_period_year DESC, s.pay_period_month DESC, e.first_name ASC';

  try {
    const [payments] = await db.query(queryStr, params);
    return res.status(200).json({
      success: true,
      payments
    });
  } catch (error) {
    next(error);
  }
}

// Get salary history for a single employee
async function getEmployeeSalaryHistory(req, res, next) {
  const { employeeId } = req.params;

  try {
    const queryStr = `
      SELECT 
        s.*, 
        (s.basic_salary + s.allowance - s.deductions) AS net_salary
      FROM salaries s
      WHERE s.employee_id = ?
      ORDER BY s.pay_period_year DESC, s.pay_period_month DESC
    `;

    const [history] = await db.query(queryStr, [employeeId]);
    return res.status(200).json({
      success: true,
      employeeId,
      history
    });
  } catch (error) {
    next(error);
  }
}

// Record a new salary payment / process payroll
async function recordSalaryPayment(req, res, next) {
  const { 
    employee_id, basic_salary, allowance, deductions, 
    pay_period_month, pay_period_year, payment_status, payment_date 
  } = req.body;

  if (!employee_id || basic_salary === undefined || !pay_period_month || !pay_period_year) {
    return res.status(400).json({
      success: false,
      message: 'Employee ID, basic salary, pay period month and year are required.'
    });
  }

  try {
    // Check if employee exists
    const [employees] = await db.query('SELECT employee_id FROM employees WHERE employee_id = ?', [employee_id]);
    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    // Check if salary payment already exists for this employee for this month/year
    const [existing] = await db.query(
      'SELECT salary_id FROM salaries WHERE employee_id = ? AND pay_period_month = ? AND pay_period_year = ?',
      [employee_id, pay_period_month, pay_period_year]
    );

    const basicVal = parseFloat(basic_salary);
    const allowanceVal = parseFloat(allowance || 0);
    const deductionsVal = parseFloat(deductions || 0);
    const finalPaymentStatus = payment_status || 'Pending';
    const finalPaymentDate = finalPaymentStatus === 'Paid' ? (payment_date || new Date().toISOString().split('T')[0]) : null;

    if (existing.length > 0) {
      // Update existing record
      const salaryId = existing[0].salary_id;
      await db.query(
        `UPDATE salaries SET 
          basic_salary = ?, allowance = ?, deductions = ?, 
          payment_status = ?, payment_date = ?
        WHERE salary_id = ?`,
        [basicVal, allowanceVal, deductionsVal, finalPaymentStatus, finalPaymentDate, salaryId]
      );

      return res.status(200).json({
        success: true,
        message: 'Salary payment updated successfully.',
        salary_id: salaryId
      });
    } else {
      // Create unique payslip number PAY-YYYYMM-RAND
      const randStr = Math.floor(1000 + Math.random() * 9000); // 4-digit code
      const payslipNumber = `PAY-${pay_period_year}${String(pay_period_month).padStart(2, '0')}-${randStr}`;

      const [result] = await db.query(
        `INSERT INTO salaries (
          employee_id, basic_salary, allowance, deductions, 
          pay_period_month, pay_period_year, payment_status, payment_date, payslip_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employee_id, basicVal, allowanceVal, deductionsVal,
          pay_period_month, pay_period_year, finalPaymentStatus, finalPaymentDate, payslipNumber
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'Salary payment recorded successfully.',
        salary_id: result.insertId,
        payslip_number: payslipNumber
      });
    }
  } catch (error) {
    next(error);
  }
}

// Get rich single payslip detail by ID
async function getPayslipById(req, res, next) {
  const { id } = req.params;

  try {
    const queryStr = `
      SELECT 
        s.*, 
        (s.basic_salary + s.allowance - s.deductions) AS net_salary,
        e.first_name, 
        e.last_name, 
        e.email,
        e.phone,
        e.position,
        e.hire_date,
        d.department_name
      FROM salaries s
      JOIN employees e ON s.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE s.salary_id = ?
    `;

    const [payslips] = await db.query(queryStr, [id]);

    if (payslips.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found.'
      });
    }

    return res.status(200).json({
      success: true,
      payslip: payslips[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSalaryPayments,
  getEmployeeSalaryHistory,
  recordSalaryPayment,
  getPayslipById
};
