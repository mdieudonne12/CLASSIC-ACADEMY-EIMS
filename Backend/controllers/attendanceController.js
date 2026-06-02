// Classic Academy EIMS - Attendance Controller
const db = require('../config/db');

// Get daily attendance sheet for a selected date
async function getDailyAttendance(req, res, next) {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date parameter (YYYY-MM-DD) is required.'
    });
  }

  try {
    // Select all active employees and join their attendance for the chosen date
    const queryStr = `
      SELECT 
        e.employee_id, 
        e.first_name, 
        e.last_name, 
        e.position,
        e.avatar_url,
        d.department_name,
        a.attendance_id,
        a.status,
        a.time_in,
        a.time_out,
        a.notes
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN attendance a ON e.employee_id = a.employee_id AND a.date = ?
      WHERE e.status = 'Active'
      ORDER BY d.department_name, e.first_name
    `;

    const [attendanceSheet] = await db.query(queryStr, [date]);

    return res.status(200).json({
      success: true,
      date,
      records: attendanceSheet
    });
  } catch (error) {
    next(error);
  }
}

// Bulk save or update daily attendance logs
async function recordAttendance(req, res, next) {
  const { date, records } = req.body; // Expecting: date (string), records: Array<{employee_id, status, time_in, time_out, notes}>

  if (!date || !records || !Array.isArray(records)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request data. Date and an array of employee attendance records are required.'
    });
  }

  try {
    // Process each record sequentially or in a safe database transaction
    // To make it cross-compatible for MySQL and SQLite, we delete existing records for the given employee and date, then insert new ones.
    // This is clean, safe, and guarantees no unique key conflicts.
    
    for (const record of records) {
      const { employee_id, status, time_in, time_out, notes } = record;

      if (!employee_id || !status) continue;

      // Delete existing record for this employee and date
      await db.query(
        'DELETE FROM attendance WHERE employee_id = ? AND date = ?',
        [employee_id, date]
      );

      // Insert new attendance record
      await db.query(
        `INSERT INTO attendance (employee_id, date, status, time_in, time_out, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          employee_id, 
          date, 
          status, 
          time_in || null, 
          time_out || null, 
          notes || ''
        ]
      );
    }

    return res.status(200).json({
      success: true,
      message: `Daily attendance for ${date} has been recorded successfully.`
    });
  } catch (error) {
    next(error);
  }
}

// Get attendance statistics summary for dashboard / reports
async function getAttendanceStats(req, res, next) {
  const { startDate, endDate } = req.query;

  try {
    let params = [];
    let dateCondition = '';
    
    if (startDate && endDate) {
      dateCondition = 'WHERE date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Attendance distribution count
    const distributionQuery = `
      SELECT status, COUNT(*) as count 
      FROM attendance 
      ${dateCondition}
      GROUP BY status
    `;
    const [distribution] = await db.query(distributionQuery, params);

    // Calculate overall attendance rate
    const totalQuery = `
      SELECT COUNT(*) as total, 
             SUM(CASE WHEN status = 'Present' OR status = 'Late' THEN 1 ELSE 0 END) as present_count
      FROM attendance
      ${dateCondition}
    `;
    const [totalStats] = await db.query(totalQuery, params);

    const total = totalStats[0].total || 0;
    const present = totalStats[0].present_count || 0;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    return res.status(200).json({
      success: true,
      stats: {
        total_records: total,
        present_records: present,
        attendance_rate: rate,
        distribution: distribution
      }
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDailyAttendance,
  recordAttendance,
  getAttendanceStats
};
