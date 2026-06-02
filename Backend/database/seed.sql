-- Classic Academy Employee Information Management System (EIMS)
-- Database Seed Script for MySQL (classic_academy_eims_db)

USE classic_academy_eims_db;

-- Clear previous data (ordered by dependency)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE salaries;
TRUNCATE TABLE attendance;
TRUNCATE TABLE users;
TRUNCATE TABLE employees;
TRUNCATE TABLE departments;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Seed Departments
INSERT INTO departments (department_id, department_name, description) VALUES
(1, 'Administration', 'School leadership, finance, and human resources offices.'),
(2, 'Mathematics & Sciences', 'Department responsible for Mathematics, Physics, Chemistry, and Biology courses.'),
(3, 'Languages & Humanities', 'Department responsible for English, Kinyarwanda, French, History, and Geography.'),
(4, 'Technical & Vocational', 'Department responsible for Computer Science, ICT, and Electronics.'),
(5, 'Operations & Support', 'Groundskeeping, kitchen staff, security, and facilities maintenance.');

-- 2. Seed Employees
-- HINT: Pre-calculated bcrypt hashes for passwords in users table will be 'password123'
INSERT INTO employees (employee_id, first_name, last_name, email, phone, gender, date_of_birth, hire_date, department_id, position, status, avatar_url) VALUES
(1, 'John', 'Mugisha', 'john.mugisha@classicacademy.ac.rw', '+250788123456', 'Male', '1978-05-15', '2015-01-10', 1, 'Headmaster', 'Active', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'),
(2, 'Alice', 'Umutoni', 'alice.umutoni@classicacademy.ac.rw', '+250788234567', 'Female', '1985-08-20', '2017-03-01', 1, 'HR Manager', 'Active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
(3, 'Jean Bosco', 'Nshimiyimana', 'bosco.n@classicacademy.ac.rw', '+250788345678', 'Male', '1982-11-05', '2016-09-01', 2, 'Senior Math Teacher', 'Active', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
(4, 'Marie', 'Uwera', 'marie.uwera@classicacademy.ac.rw', '+250788456789', 'Female', '1990-02-28', '2019-01-05', 3, 'English Teacher', 'Active', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'),
(5, 'Eric', 'Ndahiro', 'eric.ndahiro@classicacademy.ac.rw', '+250788567890', 'Male', '1993-07-14', '2021-02-15', 4, 'Computer Science Instructor', 'Active', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
(6, 'David', 'Hakizimana', 'david.h@classicacademy.ac.rw', '+250788678901', 'Male', '1988-12-10', '2018-05-20', 5, 'Facilities Supervisor', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(7, 'Grace', 'Mutoni', 'grace.m@classicacademy.ac.rw', '+250788789012', 'Female', '1995-04-03', '2022-09-01', 2, 'Biology Assistant', 'Active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150');

-- 3. Seed Users (Roles: Admin, Manager, Employee)
-- Passwords are all hashed bcrypt for 'password123': '$2a$10$S04mWPmwhwkcb6BNxi2di.aZjmPINLZyM4xPc8oG/lZVVVRCg6Np2'
INSERT INTO users (user_id, username, password_hash, email, role, employee_id) VALUES
(1, 'admin', '$2a$10$S04mWPmwhwkcb6BNxi2di.aZjmPINLZyM4xPc8oG/lZVVVRCg6Np2', 'john.mugisha@classicacademy.ac.rw', 'Admin', 1),
(2, 'manager', '$2a$10$S04mWPmwhwkcb6BNxi2di.aZjmPINLZyM4xPc8oG/lZVVVRCg6Np2', 'alice.umutoni@classicacademy.ac.rw', 'Manager', 2),
(3, 'teacher', '$2a$10$S04mWPmwhwkcb6BNxi2di.aZjmPINLZyM4xPc8oG/lZVVVRCg6Np2', 'bosco.n@classicacademy.ac.rw', 'Employee', 3),
(4, 'instructor', '$2a$10$S04mWPmwhwkcb6BNxi2di.aZjmPINLZyM4xPc8oG/lZVVVRCg6Np2', 'eric.ndahiro@classicacademy.ac.rw', 'Employee', 5);

-- 4. Seed Attendance
-- Records for a few days in May 2026
INSERT INTO attendance (employee_id, date, status, time_in, time_out, notes) VALUES
(1, '2026-05-25', 'Present', '07:30:00', '17:00:00', 'On time'),
(2, '2026-05-25', 'Present', '07:45:00', '17:15:00', 'HR desk active'),
(3, '2026-05-25', 'Present', '07:20:00', '16:30:00', 'Morning class math'),
(4, '2026-05-25', 'Late', '08:15:00', '16:45:00', 'Traffic delays'),
(5, '2026-05-25', 'Present', '07:55:00', '17:00:00', 'Lab sessions'),
(6, '2026-05-25', 'Present', '07:10:00', '18:00:00', 'Facilities checked'),
(7, '2026-05-25', 'Absent', NULL, NULL, 'Medical appointment'),

(1, '2026-05-26', 'Present', '07:40:00', '17:00:00', ''),
(2, '2026-05-26', 'Present', '07:50:00', '17:00:00', ''),
(3, '2026-05-26', 'Present', '07:15:00', '16:30:00', ''),
(4, '2026-05-26', 'Present', '07:50:00', '16:50:00', ''),
(5, '2026-05-26', 'Present', '07:45:00', '17:00:00', ''),
(6, '2026-05-26', 'Present', '07:05:00', '17:30:00', ''),
(7, '2026-05-26', 'Present', '07:58:00', '16:00:00', 'Returned duty'),

(1, '2026-05-27', 'Present', '07:35:00', '17:00:00', ''),
(2, '2026-05-27', 'Present', '07:40:00', '17:10:00', ''),
(3, '2026-05-27', 'Late', '08:05:00', '16:30:00', 'Rain storm delay'),
(4, '2026-05-27', 'Present', '07:45:00', '17:00:00', ''),
(5, '2026-05-27', 'Present', '07:50:00', '17:00:00', ''),
(6, '2026-05-27', 'Present', '07:15:00', '18:00:00', ''),
(7, '2026-05-27', 'Present', '07:52:00', '16:00:00', '');

-- 5. Seed Salaries
-- Payroll historical logs for April 2026 (all Paid) and May 2026 (some Pending/Paid)
INSERT INTO salaries (employee_id, basic_salary, allowance, deductions, pay_period_month, pay_period_year, payment_date, payment_status, payslip_number) VALUES
(1, 1200000.00, 150000.00, 50000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-001'),
(2, 850000.00, 80000.00, 30000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-002'),
(3, 750000.00, 50000.00, 20000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-003'),
(4, 750000.00, 50000.00, 20000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-004'),
(5, 800000.00, 70000.00, 25000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-005'),
(6, 450000.00, 30000.00, 10000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-006'),
(7, 400000.00, 20000.00, 8000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-007'),

(1, 1200000.00, 150000.00, 50000.00, 5, 2026, '2026-05-28', 'Paid', 'PAY-202605-001'),
(2, 850000.00, 80000.00, 30000.00, 5, 2026, '2026-05-28', 'Paid', 'PAY-202605-002'),
(3, 750000.00, 50000.00, 20000.00, 5, 2026, NULL, 'Pending', 'PAY-202605-003'),
(4, 750000.00, 50000.00, 20000.00, 5, 2026, NULL, 'Pending', 'PAY-202605-004'),
(5, 800000.00, 70000.00, 25000.00, 5, 2026, '2026-05-28', 'Paid', 'PAY-202605-005');
