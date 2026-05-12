const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = require('../src/config/db');

async function seed() {
  try {
    console.log('Seeding CampusCare dummy data...');

    const defaultPassword = '123456';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    await pool.query('DELETE FROM audit_logs');
    await pool.query('DELETE FROM clinic_staff_schedules');
    await pool.query('DELETE FROM facility_recommendations');
    await pool.query('DELETE FROM emergency_cases');
    await pool.query('DELETE FROM sick_letters');
    await pool.query('DELETE FROM health_checks');
    await pool.query('DELETE FROM queues');
    await pool.query('DELETE FROM student_health_profiles');
    await pool.query('DELETE FROM students');
    await pool.query('DELETE FROM users');

    await pool.query('ALTER TABLE users AUTO_INCREMENT = 1');
    await pool.query('ALTER TABLE students AUTO_INCREMENT = 1');
    await pool.query('ALTER TABLE student_health_profiles AUTO_INCREMENT = 1');

    const users = [
      ['Rafli Akbar', 'rafli@student.campuscare.test', passwordHash, 'student'],
      ['Siti Aisyah', 'siti@student.campuscare.test', passwordHash, 'student'],
      ['Budi Santoso', 'budi@student.campuscare.test', passwordHash, 'student'],
      ['Nadia Putri', 'nadia@student.campuscare.test', passwordHash, 'student'],

      ['Petugas Klinik', 'petugas@campuscare.test', passwordHash, 'clinic_staff'],
      ['Admin Klinik', 'admin.klinik@campuscare.test', passwordHash, 'clinic_admin'],
      ['Dosen Penanggung Jawab', 'supervisor@campuscare.test', passwordHash, 'supervisor'],
      ['Kemahasiswaan', 'kemahasiswaan@campuscare.test', passwordHash, 'student_affairs'],
      ['Super Admin', 'superadmin@campuscare.test', passwordHash, 'super_admin'],
    ];

    for (const user of users) {
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        user
      );
    }

    const [userRows] = await pool.query('SELECT id, email FROM users');

    function getUserId(email) {
      const user = userRows.find((item) => item.email === email);
      if (!user) throw new Error(`User not found: ${email}`);
      return user.id;
    }

    const students = [
      [
        getUserId('rafli@student.campuscare.test'),
        '231001',
        'Informatika',
        'IF-6A',
        'R.304',
        'L',
        '08123456789',
        'Deli Serdang',
      ],
      [
        getUserId('siti@student.campuscare.test'),
        '231002',
        'D3 Kebidanan',
        'KB-2A',
        'R.201',
        'P',
        '08123456788',
        'Medan',
      ],
      [
        getUserId('budi@student.campuscare.test'),
        '231003',
        'Informatika',
        'IF-6A',
        'R.304',
        'L',
        '08123456787',
        'Medan',
      ],
      [
        getUserId('nadia@student.campuscare.test'),
        '231004',
        'Informatika',
        'IF-6B',
        'R.305',
        'P',
        '08123456786',
        'Deli Serdang',
      ],
    ];

    for (const student of students) {
      await pool.query(
        `INSERT INTO students 
        (user_id, nim, study_program, class_name, room, gender, phone, address) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        student
      );
    }

    const [studentRows] = await pool.query('SELECT id FROM students');

    for (const student of studentRows) {
      await pool.query(
        `INSERT INTO student_health_profiles 
        (
          student_id, 
          blood_type, 
          congenital_disease, 
          chronic_disease, 
          drug_allergy, 
          medical_notes, 
          emergency_contact_name, 
          emergency_contact_phone, 
          emergency_contact_relation, 
          consent_given
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          student.id,
          'O',
          '',
          '',
          '',
          'Data dummy MVP CampusCare',
          'Kontak Darurat',
          '081200000000',
          'Orang Tua',
          true,
        ]
      );
    }

    await pool.query(
      `INSERT INTO app_settings (setting_key, setting_value)
       VALUES 
       ('maintenance_mode', 'false'),
       ('clinic_status', 'open'),
       ('average_light_case_minutes', '8'),
       ('average_medium_case_minutes', '12'),
       ('average_injury_case_minutes', '15'),
       ('checkin_grace_period_minutes', '10')
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`
    );

    console.log('Seed completed.');
    console.log('Default password for all accounts: 123456');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();