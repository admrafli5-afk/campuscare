# CampusCare Proposal Summary

## Project Name

CampusCare

Smart Clinic & Student Health Administration System

---

# Overview

CampusCare adalah sistem informasi kesehatan kampus berbasis mobile dan web yang dirancang untuk meningkatkan efisiensi layanan kesehatan kampus Satya Terra Bhinneka.

Sistem ini menggabungkan:

- antrean digital
- QR check-in
- emergency case
- surat izin sakit digital
- rekomendasi akses lift
- dashboard administrasi kesehatan

CampusCare mendukung konsep:

- paperless
- green generation
- smart campus
- efficient health service

---

# Background

Klinik kampus sering menghadapi:

- antrean manual
- ruang tunggu padat
- pencatatan kertas
- proses surat manual
- keterlambatan administrasi
- sulitnya monitoring kesehatan mahasiswa

CampusCare hadir sebagai solusi digital yang:

- ramah mahasiswa
- modern
- efisien
- mudah digunakan
- sesuai konsep Green Generation

---

# Main Goals

Tujuan utama CampusCare:

- mengurangi antrean manual
- meningkatkan efisiensi layanan klinik
- mendukung administrasi paperless
- mempermudah mahasiswa mendapatkan layanan kesehatan
- mempermudah pembuatan surat izin sakit
- membantu kampus melakukan monitoring kesehatan mahasiswa

---

# Main Features

## Mobile App

Fitur mahasiswa:

- login sekali
- cek antrean klinik
- estimasi waktu pemeriksaan
- daftar antrean
- QR check-in
- riwayat kesehatan
- surat izin sakit digital
- rekomendasi lift
- profil kesehatan

---

## Dashboard Klinik

Fitur petugas:

- dashboard antrean
- QR scanner
- check-in mahasiswa
- pemeriksaan awal
- emergency case
- surat izin sakit
- rekomendasi lift
- laporan layanan

---

## Dashboard Kemahasiswaan

Fitur:

- melihat surat izin sakit
- melihat rekomendasi lift
- arsip surat
- rekap administrasi kesehatan

---

# Technology Stack

| Component      | Technology          |
| -------------- | ------------------- |
| Mobile App     | Flutter             |
| Backend API    | Node.js             |
| Framework API  | Express.js          |
| Database       | MySQL               |
| Dashboard Web  | HTML/CSS/JavaScript |
| Authentication | JWT                 |
| QR System      | QR Token            |

---

# System Architecture

Flutter Mobile App
↓
Backend API
↓
MySQL Database
↓
Web Dashboard

Catatan:

- mobile dan web tidak boleh langsung mengakses database
- semua data wajib melalui backend API

---

# Theme & Design

Tema:
Eco Health Campus

Konsep desain:

- hijau
- bersih
- profesional
- modern
- ramah mahasiswa

Color Palette:

- Primary Green → #047857
- Soft Mint → #D1FAE5
- Leaf Green → #22C55E
- Background → #F8FAFC

Typography:

- Poppins

---

# Key Advantages

## Paperless System

Mengurangi penggunaan kertas dalam administrasi klinik.

---

## Smart Queue

Mahasiswa dapat melihat antrean sebelum datang ke klinik.

---

## QR Check-in

Check-in cepat tanpa input manual panjang.

---

## Emergency Case

Pasien darurat dapat langsung ditangani tanpa registrasi normal.

---

## Health Administration

Surat izin sakit dan rekomendasi lift dapat dikelola digital.

---

# Role Distribution

| Role | Main Responsibility             |
| ---- | ------------------------------- |
| A    | Backend & Database              |
| B    | Flutter Mobile App              |
| C    | Web Dashboard Klinik            |
| D    | Dashboard Kemahasiswaan & Surat |
| E    | UI/UX & Documentation           |
| F    | QA Tester & Integration         |

---

# MVP Scope

Versi MVP fokus pada:

- demo aplikasi
- validasi konsep
- data dummy/CSV
- flow utama sistem

Belum termasuk:

- integrasi database resmi kampus
- AI diagnosis
- payment system
- telemedicine

---

# Security

Sistem menggunakan:

- JWT Authentication
- Password Hashing
- Role Based Access Control
- API Validation

---

# Important Notes

- Data MVP menggunakan data dummy sementara
- Klinik hanya memberikan rekomendasi medis
- Persetujuan fasilitas kampus berada pada pihak berwenang
- Sistem mendukung konsep Green Generation Satya Terra Bhinneka

---

# Expected Result

CampusCare diharapkan menjadi:

- sistem kesehatan kampus modern
- layanan klinik paperless
- solusi antrean digital kampus
- platform administrasi kesehatan mahasiswa
- pendukung transformasi smart campus
