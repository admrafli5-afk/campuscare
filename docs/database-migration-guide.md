# CampusCare Database Migration Guide

## Tujuan

Dokumen ini menjelaskan tabel tambahan untuk Point 6:
- medicines
- medicine_stock_logs
- prescriptions
- prescription_items
- medical_records

---

## Database

Nama database:

```text
campuscare_db
```

Cek database:

```powershell
D:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe -u root -e "SHOW DATABASES;"
```

Cek tabel:

```powershell
D:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe -u root -e "USE campuscare_db; SHOW TABLES;"
```

---

## File Migration yang Disarankan

```text
database/migrations/006_create_medicine_prescription_medical_records.sql
```

---

## SQL Migration

```sql
USE campuscare_db;

CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medicine_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'tablet',
  stock INT NOT NULL DEFAULT 0,
  minimum_stock INT NOT NULL DEFAULT 10,
  expired_date DATE NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicine_stock_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medicine_id INT NOT NULL,
  type ENUM('in', 'out', 'adjust') NOT NULL,
  quantity INT NOT NULL,
  stock_before INT NOT NULL,
  stock_after INT NOT NULL,
  note TEXT NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_medicine_stock_logs_medicine
    FOREIGN KEY (medicine_id) REFERENCES medicines(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_medicine_stock_logs_user
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prescription_number VARCHAR(50) NOT NULL UNIQUE,
  student_id INT NOT NULL,
  health_check_id INT NULL,
  medical_record_id INT NULL,
  created_by INT NOT NULL,
  notes TEXT NULL,
  status ENUM('active', 'cancelled', 'completed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_prescriptions_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_prescriptions_health_check
    FOREIGN KEY (health_check_id) REFERENCES health_checks(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_prescriptions_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS prescription_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prescription_id INT NOT NULL,
  medicine_id INT NOT NULL,
  medicine_name VARCHAR(150) NOT NULL,
  dosage VARCHAR(100) NULL,
  frequency VARCHAR(100) NULL,
  duration VARCHAR(100) NULL,
  quantity INT NOT NULL DEFAULT 1,
  usage_instruction TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prescription_items_prescription
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_prescription_items_medicine
    FOREIGN KEY (medicine_id) REFERENCES medicines(id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  queue_id INT NULL,
  health_check_id INT NULL,
  doctor_id INT NOT NULL,
  subjective TEXT NOT NULL,
  objective TEXT NOT NULL,
  assessment TEXT NOT NULL,
  plan TEXT NOT NULL,
  diagnosis VARCHAR(255) NULL,
  treatment TEXT NULL,
  doctor_notes TEXT NULL,
  status ENUM('draft', 'final', 'cancelled') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_medical_records_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_medical_records_queue
    FOREIGN KEY (queue_id) REFERENCES queues(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_medical_records_health_check
    FOREIGN KEY (health_check_id) REFERENCES health_checks(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_medical_records_doctor
    FOREIGN KEY (doctor_id) REFERENCES users(id)
    ON DELETE RESTRICT
);
```

---

## Menjalankan Migration

```powershell
cmd /c "D:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe -u root < D:\campuscare\database\migrations\006_create_medicine_prescription_medical_records.sql"
```

---

## Troubleshooting

### Unknown database `campuscare_db`

Import schema utama dulu:

```powershell
cmd /c "D:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe -u root < D:\campuscare\database\campuscare_schema.sql"
```

### ECONNREFUSED 127.0.0.1:3306

Solusi:
- Jalankan Laragon → Start All
- cek `DB_PORT` di `.env`
