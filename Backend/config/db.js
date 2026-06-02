// Classic Academy EIMS - Hybrid Database Connector (MySQL with SQLite Fallback)
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

let dbType = 'mysql'; // Default to mysql
let mysqlPool = null;
let sqliteDb = null;

// Configuration
const MYSQL_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'classic_academy_eims_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  connectTimeout: 2000, // 2 seconds timeout to fail fast
  multipleStatements: true
};

const SQLITE_FILE = path.join(__dirname, '..', 'database', 'classic_academy_eims.sqlite');

// Ensure database directory exists
const dbDir = path.dirname(SQLITE_FILE);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Convert MySQL query syntax to SQLite syntax (simple adjustments)
function convertQueryToSQLite(sql) {
  let cleanSql = sql;
  // Replace MySQL specific functions or operators if needed
  // SQLite uses auto-increment differently, but for standard SELECT/INSERT/UPDATE/DELETE the syntax is identical
  return cleanSql;
}

// Promisify SQLite methods
function runSQLiteQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        // Return in MySQL double-array structure [rows, fields]
        resolve([rows, null]);
      }
    });
  });
}

function runSQLiteCmd(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        // Mock the MySQL result object format
        resolve([{
          insertId: this.lastID,
          affectedRows: this.changes
        }, null]);
      }
    });
  });
}

// Unified query wrapper
async function query(sql, params = []) {
  if (dbType === 'mysql') {
    try {
      return await mysqlPool.query(sql, params);
    } catch (error) {
      console.error('MySQL execution error, falling back to SQLite query:', error.message);
      // Fallback if MySQL fails mid-run (unlikely but safe)
      return runSQLiteQuery(convertQueryToSQLite(sql), params);
    }
  } else {
    const isWrite = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|REPLACE)/i.test(sql);
    if (isWrite) {
      return runSQLiteCmd(convertQueryToSQLite(sql), params);
    } else {
      return runSQLiteQuery(convertQueryToSQLite(sql), params);
    }
  }
}

// Initialize SQLite database schema and seeds
async function initializeSQLite() {
  return new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(SQLITE_FILE, async (err) => {
      if (err) {
        return reject(err);
      }
      console.log('SQLite local database loaded/created at:', SQLITE_FILE);
      
      try {
        // Enable foreign keys
        sqliteDb.run('PRAGMA foreign_keys = ON;');

        // Create Departments Table
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS departments (
            department_id INTEGER PRIMARY KEY AUTOINCREMENT,
            department_name TEXT UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create Employees Table
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS employees (
            employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            gender TEXT,
            date_of_birth DATE,
            hire_date DATE,
            department_id INTEGER,
            position TEXT NOT NULL,
            status TEXT CHECK(status IN ('Active', 'Inactive', 'On Leave')) DEFAULT 'Active',
            avatar_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
          )
        `);

        // Create Users Table
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT CHECK(role IN ('Admin', 'Manager', 'Employee')) DEFAULT 'Employee',
            employee_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
          )
        `);

        // Create Attendance Table
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS attendance (
            attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            date DATE NOT NULL,
            status TEXT CHECK(status IN ('Present', 'Absent', 'Late', 'Excused')) DEFAULT 'Present',
            time_in TEXT,
            time_out TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
            UNIQUE(employee_id, date)
          )
        `);

        // Create Salaries Table
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS salaries (
            salary_id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            basic_salary DECIMAL(10,2) NOT NULL,
            allowance DECIMAL(10,2) DEFAULT 0.00,
            deductions DECIMAL(10,2) DEFAULT 0.00,
            pay_period_month INTEGER NOT NULL,
            pay_period_year INTEGER NOT NULL,
            payment_date DATE,
            payment_status TEXT CHECK(payment_status IN ('Paid', 'Pending', 'Failed')) DEFAULT 'Pending',
            payslip_number TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
            UNIQUE(employee_id, pay_period_month, pay_period_year)
          )
        `);

        // Check if data is already seeded
        sqliteDb.get('SELECT COUNT(*) as count FROM departments', async (err, row) => {
          if (row && row.count === 0) {
            console.log('Database empty. Seeding local SQLite database...');
            
            // Seed Departments
            const depts = [
              [1, 'Administration', 'School leadership, finance, and human resources offices.'],
              [2, 'Mathematics & Sciences', 'Department responsible for Mathematics, Physics, Chemistry, and Biology courses.'],
              [3, 'Languages & Humanities', 'Department responsible for English, Kinyarwanda, French, History, and Geography.'],
              [4, 'Technical & Vocational', 'Department responsible for Computer Science, ICT, and Electronics.'],
              [5, 'Operations & Support', 'Groundskeeping, kitchen staff, security, and facilities maintenance.']
            ];
            for (const d of depts) {
              sqliteDb.run('INSERT INTO departments (department_id, department_name, description) VALUES (?, ?, ?)', d);
            }

            // Seed Employees
            const employees = [
              [1, 'John', 'Mugisha', 'john.mugisha@classicacademy.ac.rw', '+250788123456', 'Male', '1978-05-15', '2015-01-10', 1, 'Headmaster', 'Active', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'],
              [2, 'Alice', 'Umutoni', 'alice.umutoni@classicacademy.ac.rw', '+250788234567', 'Female', '1985-08-20', '2017-03-01', 1, 'HR Manager', 'Active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'],
              [3, 'Jean Bosco', 'Nshimiyimana', 'bosco.n@classicacademy.ac.rw', '+250788345678', 'Male', '1982-11-05', '2016-09-01', 2, 'Senior Math Teacher', 'Active', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'],
              [4, 'Marie', 'Uwera', 'marie.uwera@classicacademy.ac.rw', '+250788456789', 'Female', '1990-02-28', '2019-01-05', 3, 'English Teacher', 'Active', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'],
              [5, 'Eric', 'Ndahiro', 'eric.ndahiro@classicacademy.ac.rw', '+250788567890', 'Male', '1993-07-14', '2021-02-15', 4, 'Computer Science Instructor', 'Active', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'],
              [6, 'David', 'Hakizimana', 'david.h@classicacademy.ac.rw', '+250788678901', 'Male', '1988-12-10', '2018-05-20', 5, 'Facilities Supervisor', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'],
              [7, 'Grace', 'Mutoni', 'grace.m@classicacademy.ac.rw', '+250788789012', 'Female', '1995-04-03', '2022-09-01', 2, 'Biology Assistant', 'Active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150']
            ];
            for (const e of employees) {
              sqliteDb.run('INSERT INTO employees (employee_id, first_name, last_name, email, phone, gender, date_of_birth, hire_date, department_id, position, status, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', e);
            }

            // Seed Users (password123 -> hashed)
            const passwordHash = await bcrypt.hash('password123', 10);
            const users = [
              [1, 'admin', passwordHash, 'john.mugisha@classicacademy.ac.rw', 'Admin', 1],
              [2, 'manager', passwordHash, 'alice.umutoni@classicacademy.ac.rw', 'Manager', 2],
              [3, 'teacher', passwordHash, 'bosco.n@classicacademy.ac.rw', 'Employee', 3],
              [4, 'instructor', passwordHash, 'eric.ndahiro@classicacademy.ac.rw', 'Employee', 5]
            ];
            for (const u of users) {
              sqliteDb.run('INSERT INTO users (user_id, username, password_hash, email, role, employee_id) VALUES (?, ?, ?, ?, ?, ?)', u);
            }

            // Seed Attendance
            const attendance = [
              [1, '2026-05-25', 'Present', '07:30:00', '17:00:00', 'On time'],
              [2, '2026-05-25', 'Present', '07:45:00', '17:15:00', 'HR desk active'],
              [3, '2026-05-25', 'Present', '07:20:00', '16:30:00', 'Morning class math'],
              [4, '2026-05-25', 'Late', '08:15:00', '16:45:00', 'Traffic delays'],
              [5, '2026-05-25', 'Present', '07:55:00', '17:00:00', 'Lab sessions'],
              [6, '2026-05-25', 'Present', '07:10:00', '18:00:00', 'Facilities checked'],
              [7, '2026-05-25', 'Absent', null, null, 'Medical appointment'],

              [1, '2026-05-26', 'Present', '07:40:00', '17:00:00', ''],
              [2, '2026-05-26', 'Present', '07:50:00', '17:00:00', ''],
              [3, '2026-05-26', 'Present', '07:15:00', '16:30:00', ''],
              [4, '2026-05-26', 'Present', '07:50:00', '16:50:00', ''],
              [5, '2026-05-26', 'Present', '07:45:00', '17:00:00', ''],
              [6, '2026-05-26', 'Present', '07:05:00', '17:30:00', ''],
              [7, '2026-05-26', 'Present', '07:58:00', '16:00:00', 'Returned duty'],

              [1, '2026-05-27', 'Present', '07:35:00', '17:00:00', ''],
              [2, '2026-05-27', 'Present', '07:40:00', '17:10:00', ''],
              [3, '2026-05-27', 'Late', '08:05:00', '16:30:00', 'Rain storm delay'],
              [4, '2026-05-27', 'Present', '07:45:00', '17:00:00', ''],
              [5, '2026-05-27', 'Present', '07:50:00', '17:00:00', ''],
              [6, '2026-05-27', 'Present', '07:15:00', '18:00:00', ''],
              [7, '2026-05-27', 'Present', '07:52:00', '16:00:00', '']
            ];
            for (const a of attendance) {
              sqliteDb.run('INSERT INTO attendance (employee_id, date, status, time_in, time_out, notes) VALUES (?, ?, ?, ?, ?, ?)', a);
            }

            // Seed Salaries
            const salaries = [
              [1, 1200000.00, 150000.00, 50000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-001'],
              [2, 850000.00, 80000.00, 30000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-002'],
              [3, 750000.00, 50000.00, 20000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-003'],
              [4, 750000.00, 50000.00, 20000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-004'],
              [5, 800000.00, 70000.00, 25000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-005'],
              [6, 450000.00, 30000.00, 10000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-006'],
              [7, 400000.00, 20000.00, 8000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-007'],

              [1, 1200000.00, 150000.00, 50000.00, 5, 2026, '2026-05-28', 'Paid', 'PAY-202605-001'],
              [2, 850000.00, 80000.00, 30000.00, 5, 2026, '2026-05-28', 'Paid', 'PAY-202605-002'],
              [3, 750000.00, 50000.00, 20000.00, 5, 2026, null, 'Pending', 'PAY-202605-003'],
              [4, 750000.00, 50000.00, 20000.00, 5, 2026, null, 'Pending', 'PAY-202605-004'],
              [5, 800000.00, 70000.00, 25000.00, 5, 2026, '2026-05-28', 'Paid', 'PAY-202605-005']
            ];
            for (const s of salaries) {
              sqliteDb.run('INSERT INTO salaries (employee_id, basic_salary, allowance, deductions, pay_period_month, pay_period_year, payment_date, payment_status, payslip_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', s);
            }
            console.log('Local SQLite database seeded successfully!');
          }
          resolve();
        });
      } catch (ex) {
        reject(ex);
      }
    });
  });
}

// Connect & Initialize function
async function connectDB() {
  try {
    // Attempt MySQL connection
    console.log(`Attempting connection to MySQL: ${MYSQL_CONFIG.user}@${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}/${MYSQL_CONFIG.database}...`);
    
    // Test if we can make a connection without selecting database first (in case database doesn't exist)
    const tempConfig = { ...MYSQL_CONFIG };
    delete tempConfig.database;
    const connection = await mysql.createConnection(tempConfig);
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_CONFIG.database}\``);
    await connection.end();

    // Establish full connection pool
    mysqlPool = mysql.createPool(MYSQL_CONFIG);
    
    // Verify pool is functional
    const [result] = await mysqlPool.query('SELECT 1 + 1 AS result');
    if (result && result[0].result === 2) {
      dbType = 'mysql';
      console.log('Successfully connected to MySQL database: ' + MYSQL_CONFIG.database);
      
      // Let's check if the tables are empty; if so, we can run schema/seed
      const [tableCheck] = await mysqlPool.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = 'departments'
      `, [MYSQL_CONFIG.database]);
      
      if (tableCheck[0].count === 0) {
        console.log('MySQL database is empty. Auto-initializing schema and seeds...');
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
        
        if (fs.existsSync(schemaPath) && fs.existsSync(seedPath)) {
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          const seedSql = fs.readFileSync(seedPath, 'utf8');
          
          await mysqlPool.query(schemaSql);
          await mysqlPool.query(seedSql);
          console.log('MySQL database schema and seed data loaded successfully!');
        } else {
          console.log('SQL scripts not found at', schemaPath);
        }
      }
      return;
    }
  } catch (error) {
    console.warn(`MySQL connection failed (${error.message}). Falling back to local SQLite...`);
    dbType = 'sqlite';
    await initializeSQLite();
  }
}

module.exports = {
  connectDB,
  query,
  getDbType: () => dbType,
  getSQLiteFile: () => SQLITE_FILE
};
