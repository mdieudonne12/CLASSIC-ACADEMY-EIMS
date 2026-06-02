// Classic Academy EIMS - Reports and Analytics Controller
const db = require('../config/db');

// Get overall stats summary for dashboard counters
async function getDashboardSummary(req, res, next) {
  try {
    // 1. Total active employees
    const [employees] = await db.query("SELECT COUNT(*) as count FROM employees WHERE status = 'Active'");
    const totalEmployees = employees[0].count || 0;

    // 2. Total departments
    const [departments] = await db.query("SELECT COUNT(*) as count FROM departments");
    const totalDepartments = departments[0].count || 0;

    // 3. Attendance rate for today
    const todayStr = new Date().toISOString().split('T')[0];
    const [attendanceToday] = await db.query(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status IN ('Present', 'Late') THEN 1 ELSE 0 END) as present_count FROM attendance WHERE date = ?",
      [todayStr]
    );
    
    let attendanceRateToday = 100;
    if (attendanceToday[0] && attendanceToday[0].total > 0) {
      attendanceRateToday = Math.round((attendanceToday[0].present_count / attendanceToday[0].total) * 100);
    } else {
      // Fallback: Average attendance rate of last 30 days
      const [attendanceAvg] = await db.query(
        "SELECT COUNT(*) as total, SUM(CASE WHEN status IN ('Present', 'Late') THEN 1 ELSE 0 END) as present_count FROM attendance"
      );
      if (attendanceAvg[0] && attendanceAvg[0].total > 0) {
        attendanceRateToday = Math.round((attendanceAvg[0].present_count / attendanceAvg[0].total) * 100);
      }
    }

    // 4. Current Month Payroll Total
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const [payrollSum] = await db.query(
      "SELECT SUM(basic_salary + allowance - deductions) as total FROM salaries WHERE pay_period_month = ? AND pay_period_year = ? AND payment_status = 'Paid'",
      [currentMonth, currentYear]
    );
    
    // Fallback: If no paid payroll in current month, get latest processed month
    let monthlyPayroll = payrollSum[0].total || 0;
    if (monthlyPayroll === 0 || monthlyPayroll === null) {
      const [latestPayroll] = await db.query(
        "SELECT SUM(basic_salary + allowance - deductions) as total FROM salaries WHERE payment_status = 'Paid' GROUP BY pay_period_year, pay_period_month ORDER BY pay_period_year DESC, pay_period_month DESC LIMIT 1"
      );
      monthlyPayroll = (latestPayroll[0] && latestPayroll[0].total) || 0;
    }

    return res.status(200).json({
      success: true,
      stats: {
        total_employees: totalEmployees,
        total_departments: totalDepartments,
        attendance_rate: attendanceRateToday,
        monthly_payroll_spend: parseFloat(monthlyPayroll)
      }
    });

  } catch (error) {
    next(error);
  }
}

// Get detailed data charts
async function getChartAnalytics(req, res, next) {
  try {
    // 1. Department Employee Count
    const [deptHeadcount] = await db.query(`
      SELECT d.department_name, COUNT(e.employee_id) as count 
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id AND e.status = 'Active'
      GROUP BY d.department_id
    `);

    // 2. Gender distribution
    const [genderDistribution] = await db.query(`
      SELECT gender, COUNT(*) as count 
      FROM employees 
      WHERE status = 'Active' AND gender IS NOT NULL AND gender != ''
      GROUP BY gender
    `);

    // 3. Monthly payroll trend (Last 6 months)
    const [payrollTrends] = await db.query(`
      SELECT 
        pay_period_year as year, 
        pay_period_month as month, 
        SUM(basic_salary + allowance - deductions) as total_net,
        SUM(basic_salary) as total_basic,
        SUM(allowance) as total_allowance,
        SUM(deductions) as total_deductions
      FROM salaries
      WHERE payment_status = 'Paid'
      GROUP BY pay_period_year, pay_period_month
      ORDER BY pay_period_year DESC, pay_period_month DESC
      LIMIT 6
    `);

    // Reverse trend to be chronological
    const chronologicalTrends = payrollTrends.reverse();

    // 4. Attendance Distribution (All time aggregates)
    const [attendanceDistribution] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM attendance
      GROUP BY status
    `);

    return res.status(200).json({
      success: true,
      deptHeadcount,
      genderDistribution,
      payrollTrends: chronologicalTrends,
      attendanceDistribution
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummary,
  getChartAnalytics
};
