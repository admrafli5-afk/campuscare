CREATE DATABASE IF NOT EXISTS campuscare_db;
USE campuscare_db;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS app_settings;
DROP TABLE IF EXISTS clinic_staff_schedules;
DROP TABLE IF EXISTS facility_recommendations;
DROP TABLE IF EXISTS emergency_cases;
DROP TABLE IF EXISTS sick_letters;
DROP TABLE IF EXISTS health_checks;
DROP TABLE IF EXISTS queues;
DROP TABLE IF EXISTS student_health_profiles;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM(
    'student',
    'clinic_staff',
    'clinic_admin',
    'supervisor',
    'student_affairs',
    'super_admin'
  ) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nim VARCHAR(50) NOT NULL UNIQUE,
  study_program VARCHAR(100),
  class_name VARCHAR(50),
  room VARCHAR(50),
  gender ENUM('L','P'),
  phone VARCHAR(30),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE student_health_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  blood_type VARCHAR(5),
  congenital_disease TEXT,
  chronic_disease TEXT,
  drug_allergy TEXT,
  medical_notes TEXT,
  emergency_contact_name VARCHAR(150),
  emergency_contact_phone VARCHAR(30),
  emergency_contact_relation VARCHAR(50),
  consent_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE queues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  queue_number VARCHAR(20) NOT NULL UNIQUE,
  complaint TEXT NOT NULL,
  service_type VARCHAR(100),
  priority_level ENUM('light','medium','priority','emergency') DEFAULT 'light',
  estimated_minutes INT DEFAULT 0,
  qr_token VARCHAR(255) NOT NULL UNIQUE,
  status ENUM(
    'waiting',
    'called',
    'on_the_way',
    'checked_in',
    'in_checkup',
    'completed',
    'missed',
    'cancelled',
    'emergency'
  ) DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  called_at TIMESTAMP NULL,
  checked_in_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE health_checks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  queue_id INT NULL,
  student_id INT NOT NULL,
  staff_id INT NOT NULL,
  temperature DECIMAL(4,1),
  blood_pressure VARCHAR(20),
  pulse INT,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  complaint TEXT,
  condition_status ENUM(
    'healthy',
    'light_sick',
    'medium_sick',
    'injury',
    'emergency',
    'need_referral'
  ) DEFAULT 'light_sick',
  recommendation TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (queue_id) REFERENCES queues(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (staff_id) REFERENCES users(id)
);

CREATE TABLE sick_letters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  health_check_id INT NOT NULL,
  letter_number VARCHAR(50) NOT NULL UNIQUE,
  reason TEXT,
  diagnosis_summary TEXT,
  rest_days INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM(
    'draft',
    'waiting_validation',
    'approved',
    'rejected',
    'sent_to_student_affairs',
    'printed',
    'cancelled'
  ) DEFAULT 'draft',
  created_by INT NOT NULL,
  validated_by INT NULL,
  validated_at TIMESTAMP NULL,
  sent_to_student_affairs_at TIMESTAMP NULL,
  verification_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (health_check_id) REFERENCES health_checks(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (validated_by) REFERENCES users(id)
);

CREATE TABLE facility_recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  health_check_id INT NULL,
  letter_number VARCHAR(50) NOT NULL UNIQUE,
  facility_type ENUM('lift','other') DEFAULT 'lift',
  condition_summary TEXT NOT NULL,
  recommendation_reason TEXT NOT NULL,
  recommended_start_date DATE NOT NULL,
  recommended_end_date DATE NOT NULL,
  status ENUM(
    'draft_recommendation',
    'recommended_by_clinic',
    'sent_to_student_affairs',
    'approved_by_campus',
    'rejected_by_campus',
    'expired'
  ) DEFAULT 'draft_recommendation',
  created_by INT NOT NULL,
  validated_by INT NULL,
  validated_at TIMESTAMP NULL,
  sent_to_unit VARCHAR(150),
  campus_decision_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (health_check_id) REFERENCES health_checks(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (validated_by) REFERENCES users(id)
);

CREATE TABLE emergency_cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_number VARCHAR(30) NOT NULL UNIQUE,
  student_id INT NULL,
  temporary_patient_name VARCHAR(150),
  identity_status ENUM('identified','identity_pending') DEFAULT 'identity_pending',
  condition_type VARCHAR(100) NOT NULL,
  location VARCHAR(150),
  brought_by_name VARCHAR(150),
  brought_by_phone VARCHAR(30),
  incident_time DATETIME,
  initial_condition TEXT,
  priority_level ENUM('emergency') DEFAULT 'emergency',
  status ENUM(
    'emergency',
    'emergency_handled',
    'referred',
    'stabilized',
    'completed'
  ) DEFAULT 'emergency',
  handled_by INT NOT NULL,
  supervised_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (handled_by) REFERENCES users(id),
  FOREIGN KEY (supervised_by) REFERENCES users(id)
);

CREATE TABLE clinic_staff_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  role_on_duty VARCHAR(100),
  duty_date DATE NOT NULL,
  shift_start TIME,
  shift_end TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id)
);

CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100),
  target_id INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE app_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);