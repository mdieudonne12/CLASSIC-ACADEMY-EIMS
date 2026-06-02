-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 02, 2026 at 06:02 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `classic_academy_eims_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` enum('Present','Absent','Late','Excused') DEFAULT 'Present',
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`attendance_id`, `employee_id`, `date`, `status`, `time_in`, `time_out`, `notes`, `created_at`) VALUES
(1, 1, '2026-05-25', 'Present', '07:30:00', '17:00:00', 'On time', '2026-05-29 07:16:49'),
(2, 2, '2026-05-25', 'Present', '07:45:00', '17:15:00', 'HR desk active', '2026-05-29 07:16:49'),
(3, 3, '2026-05-25', 'Present', '07:20:00', '16:30:00', 'Morning class math', '2026-05-29 07:16:49'),
(4, 4, '2026-05-25', 'Late', '08:15:00', '16:45:00', 'Traffic delays', '2026-05-29 07:16:49'),
(5, 5, '2026-05-25', 'Present', '07:55:00', '17:00:00', 'Lab sessions', '2026-05-29 07:16:49'),
(6, 6, '2026-05-25', 'Present', '07:10:00', '18:00:00', 'Facilities checked', '2026-05-29 07:16:49'),
(7, 7, '2026-05-25', 'Absent', NULL, NULL, 'Medical appointment', '2026-05-29 07:16:49'),
(8, 1, '2026-05-26', 'Present', '07:40:00', '17:00:00', '', '2026-05-29 07:16:49'),
(9, 2, '2026-05-26', 'Present', '07:50:00', '17:00:00', '', '2026-05-29 07:16:49'),
(10, 3, '2026-05-26', 'Present', '07:15:00', '16:30:00', '', '2026-05-29 07:16:49'),
(11, 4, '2026-05-26', 'Present', '07:50:00', '16:50:00', '', '2026-05-29 07:16:49'),
(12, 5, '2026-05-26', 'Present', '07:45:00', '17:00:00', '', '2026-05-29 07:16:49'),
(13, 6, '2026-05-26', 'Present', '07:05:00', '17:30:00', '', '2026-05-29 07:16:49'),
(14, 7, '2026-05-26', 'Present', '07:58:00', '16:00:00', 'Returned duty', '2026-05-29 07:16:49'),
(15, 1, '2026-05-27', 'Present', '07:35:00', '17:00:00', '', '2026-05-29 07:16:49'),
(16, 2, '2026-05-27', 'Present', '07:40:00', '17:10:00', '', '2026-05-29 07:16:49'),
(17, 3, '2026-05-27', 'Late', '08:05:00', '16:30:00', 'Rain storm delay', '2026-05-29 07:16:49'),
(18, 4, '2026-05-27', 'Present', '07:45:00', '17:00:00', '', '2026-05-29 07:16:49'),
(19, 5, '2026-05-27', 'Present', '07:50:00', '17:00:00', '', '2026-05-29 07:16:49'),
(20, 6, '2026-05-27', 'Present', '07:15:00', '18:00:00', '', '2026-05-29 07:16:49'),
(21, 7, '2026-05-27', 'Present', '07:52:00', '16:00:00', '', '2026-05-29 07:16:49');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `department_name`, `description`, `created_at`) VALUES
(1, 'Administration', 'School leadership, finance, and human resources offices.', '2026-05-29 07:16:49'),
(2, 'Mathematics & Sciences', 'Department responsible for Mathematics, Physics, Chemistry, and Biology courses.', '2026-05-29 07:16:49'),
(3, 'Languages & Humanities', 'Department responsible for English, Kinyarwanda, French, History, and Geography.', '2026-05-29 07:16:49'),
(4, 'Dancing Trainers', 'Department responsible for Computer Science, ICT, and Electronics.', '2026-05-29 07:16:49'),
(5, 'Operations & Support', 'Groundskeeping, kitchen staff, security, and facilities maintenance.', '2026-05-29 07:16:49');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `position` varchar(100) NOT NULL,
  `status` enum('Active','Inactive','On Leave') DEFAULT 'Active',
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `first_name`, `last_name`, `email`, `phone`, `gender`, `date_of_birth`, `hire_date`, `department_id`, `position`, `status`, `avatar_url`, `created_at`) VALUES
(1, 'John', 'Mugisha', 'john.mugisha@classicacademy.ac.rw', '+250788123456', 'Male', '1978-05-15', '2015-01-10', 1, 'Headmaster', 'Active', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', '2026-05-29 07:16:49'),
(2, 'Alice', 'Umutoni', 'alice.umutoni@classicacademy.ac.rw', '+250788234567', 'Female', '1985-08-20', '2017-03-01', 1, 'HR Manager', 'Active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', '2026-05-29 07:16:49'),
(3, 'Jean Bosco', 'Nshimiyimana', 'bosco.n@classicacademy.ac.rw', '+250788345678', 'Male', '1982-11-05', '2016-09-01', 2, 'Senior Math Teacher', 'Active', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', '2026-05-29 07:16:49'),
(4, 'Marie', 'Uwera', 'marie.uwera@classicacademy.ac.rw', '+250788456789', 'Female', '1990-02-28', '2019-01-05', 3, 'English Teacher', 'Active', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', '2026-05-29 07:16:49'),
(5, 'Eric', 'Ndahiro', 'eric.ndahiro@classicacademy.ac.rw', '+250788567890', 'Male', '1993-07-14', '2021-02-15', 4, 'Computer Science Instructor', 'Active', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', '2026-05-29 07:16:49'),
(6, 'David', 'Hakizimana', 'david.h@classicacademy.ac.rw', '+250788678901', 'Male', '1988-12-10', '2018-05-20', 5, 'Facilities Supervisor', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '2026-05-29 07:16:49'),
(7, 'Grace', 'Mutoni', 'grace.m@classicacademy.ac.rw', '+250788789012', 'Female', '1995-04-03', '2022-09-01', 2, 'Biology Assistant', 'Active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', '2026-05-29 07:16:49'),
(8, 'Ineza Dushimire', 'Eloi', 'inezadushimiree@gmail.com', '0722568787', 'Male', '2007-12-02', '2026-03-28', 1, 'Basketball Coach', 'Active', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '2026-05-29 07:31:29'),
(9, 'Umubyeyi', 'Sandrine', 'sandrinee14@gmail.com', '0793452677', 'Female', '2000-08-06', '2026-05-28', 4, 'Trainer', 'Active', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '2026-05-29 07:43:30');

-- --------------------------------------------------------

--
-- Table structure for table `salaries`
--

CREATE TABLE `salaries` (
  `salary_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `basic_salary` decimal(10,2) NOT NULL,
  `allowance` decimal(10,2) DEFAULT 0.00,
  `deductions` decimal(10,2) DEFAULT 0.00,
  `pay_period_month` int(11) NOT NULL CHECK (`pay_period_month` between 1 and 12),
  `pay_period_year` int(11) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_status` enum('Paid','Pending','Failed') DEFAULT 'Pending',
  `payslip_number` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salaries`
--

INSERT INTO `salaries` (`salary_id`, `employee_id`, `basic_salary`, `allowance`, `deductions`, `pay_period_month`, `pay_period_year`, `payment_date`, `payment_status`, `payslip_number`, `created_at`) VALUES
(1, 1, 1200000.00, 150000.00, 50000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-001', '2026-05-29 07:16:50'),
(2, 2, 850000.00, 80000.00, 30000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-002', '2026-05-29 07:16:50'),
(3, 3, 750000.00, 50000.00, 20000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-003', '2026-05-29 07:16:50'),
(4, 4, 750000.00, 50000.00, 20000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-004', '2026-05-29 07:16:50'),
(5, 5, 800000.00, 70000.00, 25000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-005', '2026-05-29 07:16:50'),
(6, 6, 450000.00, 30000.00, 10000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-006', '2026-05-29 07:16:50'),
(7, 7, 400000.00, 20000.00, 8000.00, 4, 2026, '2026-04-30', 'Paid', 'PAY-202604-007', '2026-05-29 07:16:50'),
(8, 1, 1200000.00, 150000.00, 50000.00, 5, 2026, '2026-05-28', 'Paid', 'PAY-202605-001', '2026-05-29 07:16:50'),
(9, 2, 850000.00, 80000.00, 30000.00, 5, 2026, '2026-05-28', 'Paid', 'PAY-202605-002', '2026-05-29 07:16:50'),
(10, 3, 750000.00, 50000.00, 20000.00, 5, 2026, NULL, 'Pending', 'PAY-202605-003', '2026-05-29 07:16:50'),
(11, 4, 750000.00, 50000.00, 20000.00, 5, 2026, NULL, 'Pending', 'PAY-202605-004', '2026-05-29 07:16:50'),
(12, 5, 800000.00, 70000.00, 25000.00, 5, 2026, '2026-05-28', 'Paid', 'PAY-202605-005', '2026-05-29 07:16:50'),
(13, 9, 50000000.00, 700000.00, 100000.00, 8, 2026, '2026-05-29', 'Paid', 'PAY-202608-1226', '2026-05-29 07:49:05'),
(14, 9, 400000.00, 50000.00, 200000.00, 5, 2026, '2026-05-29', 'Paid', 'PAY-202605-5495', '2026-05-29 07:50:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('Admin','Manager','Employee') DEFAULT 'Employee',
  `employee_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `role`, `employee_id`, `created_at`) VALUES
(1, 'admin', '$2a$10$S04mWPmwhwkcb6BNxi2di.aZjmPINLZyM4xPc8oG/lZVVVRCg6Np2', 'john.mugisha@classicacademy.ac.rw', 'Admin', 1, '2026-05-29 07:16:49'),
(2, 'manager', '$2a$10$S04mWPmwhwkcb6BNxi2di.aZjmPINLZyM4xPc8oG/lZVVVRCg6Np2', 'alice.umutoni@classicacademy.ac.rw', 'Manager', 2, '2026-05-29 07:16:49'),
(3, 'teacher', '$2a$10$S04mWPmwhwkcb6BNxi2di.aZjmPINLZyM4xPc8oG/lZVVVRCg6Np2', 'bosco.n@classicacademy.ac.rw', 'Employee', 3, '2026-05-29 07:16:49'),
(4, 'instructor', '$2a$10$S04mWPmwhwkcb6BNxi2di.aZjmPINLZyM4xPc8oG/lZVVVRCg6Np2', 'eric.ndahiro@classicacademy.ac.rw', 'Employee', 5, '2026-05-29 07:16:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD UNIQUE KEY `unique_employee_date` (`employee_id`,`date`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`),
  ADD UNIQUE KEY `department_name` (`department_name`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `salaries`
--
ALTER TABLE `salaries`
  ADD PRIMARY KEY (`salary_id`),
  ADD UNIQUE KEY `payslip_number` (`payslip_number`),
  ADD UNIQUE KEY `unique_employee_pay_period` (`employee_id`,`pay_period_month`,`pay_period_year`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `employee_id` (`employee_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `salaries`
--
ALTER TABLE `salaries`
  MODIFY `salary_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL;

--
-- Constraints for table `salaries`
--
ALTER TABLE `salaries`
  ADD CONSTRAINT `salaries_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
