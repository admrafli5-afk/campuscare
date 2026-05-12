# CampusCare User Flow

## Overview

CampusCare adalah sistem layanan kesehatan kampus berbasis mobile dan web yang mendukung:

- antrean digital
- QR check-in
- emergency case
- surat izin sakit digital
- rekomendasi akses lift
- administrasi kesehatan kampus

Sistem memiliki 3 alur utama:

1. Alur Mahasiswa
2. Alur Klinik
3. Alur Kemahasiswaan

---

# 1. User Flow Mahasiswa

## 1.1 Login Pertama Kali

Splash Screen
↓
Login
↓
Input NIM dan Password
↓
Verifikasi akun
↓
Masuk ke Home

Catatan:

- login hanya dilakukan sekali
- token disimpan di device
- login ulang hanya jika logout atau maintenance sistem

---

# 1.2 Melihat Antrean Klinik

Home
↓
Menu Klinik
↓
Lihat jumlah antrean aktif
↓
Lihat estimasi waktu pemeriksaan
↓
Pilih daftar antrean atau kembali

Informasi yang tampil:

- jumlah pasien aktif
- estimasi waktu tunggu
- status klinik
- kategori layanan

---

# 1.3 Daftar Antrean Klinik

Home
↓
Pilih Daftar Antrean
↓
Input keluhan awal
↓
Pilih kategori pemeriksaan
↓
Konfirmasi data
↓
Sistem membuat nomor antrean
↓
QR token dibuat
↓
Status menjadi waiting

Data yang diinput:

- keluhan
- gejala awal
- kondisi darurat atau tidak
- penyakit bawaan
- alergi obat

---

# 1.4 Datang ke Klinik

Mahasiswa datang ke klinik
↓
Petugas scan QR
↓
Sistem mencari data mahasiswa
↓
Status berubah menjadi checked_in
↓
Mahasiswa menunggu pemeriksaan

---

# 1.5 Pemeriksaan Mahasiswa

Status dipanggil
↓
Masuk ruang pemeriksaan
↓
Petugas/dokter melakukan pemeriksaan
↓
Input hasil pemeriksaan
↓
Input surat izin sakit jika diperlukan
↓
Input rekomendasi lift jika diperlukan
↓
Status selesai

---

# 1.6 Riwayat Kesehatan

Home
↓
Menu Riwayat Kesehatan
↓
Lihat timeline pemeriksaan
↓
Lihat surat izin sakit
↓
Lihat rekomendasi lift
↓
Lihat riwayat penyakit

Data yang tampil:

- tanggal pemeriksaan
- keluhan
- diagnosis
- surat izin
- rekomendasi fasilitas

---

# 1.7 Emergency Case

Mahasiswa pingsan/jatuh/sakit serius
↓
Teman membawa ke klinik
↓
Petugas membuka menu Emergency
↓
Cari NIM atau buat pasien sementara
↓
Pasien langsung ditangani
↓
Data dilengkapi setelah kondisi stabil

Catatan:

- emergency tidak memerlukan QR
- emergency memiliki prioritas tertinggi

---

# 2. User Flow Petugas Klinik

## 2.1 Login Petugas

Login Dashboard
↓
Masuk ke Dashboard Klinik

---

# 2.2 Melihat Antrean

Dashboard
↓
Lihat antrean aktif
↓
Lihat status pasien
↓
Lihat estimasi layanan

Status antrean:

- waiting
- called
- checked_in
- in_checkup
- completed
- cancelled
- emergency

---

# 2.3 QR Check-in

Dashboard Klinik
↓
Scan QR
↓
Data mahasiswa muncul
↓
Validasi data
↓
Status checked_in

Data yang tampil:

- nama
- NIM
- kelas
- keluhan
- riwayat penyakit
- alergi

---

# 2.4 Pemeriksaan Awal

Pilih pasien
↓
Input pemeriksaan awal
↓
Input kondisi pasien
↓
Input tindakan
↓
Simpan data

---

# 2.5 Membuat Surat Izin Sakit

Pilih pasien
↓
Buat surat izin
↓
Input lama izin
↓
Input keterangan
↓
Validasi admin klinik
↓
Kirim ke kemahasiswaan

---

# 2.6 Membuat Rekomendasi Lift

Pilih pasien
↓
Input alasan medis
↓
Input durasi rekomendasi
↓
Validasi admin klinik
↓
Kirim ke kemahasiswaan

Catatan:
Klinik hanya memberikan rekomendasi medis.
Keputusan akses lift berada pada pihak kampus.

---

# 3. User Flow Kemahasiswaan

## 3.1 Login

Login
↓
Masuk Dashboard Kemahasiswaan

---

# 3.2 Melihat Surat Masuk

Dashboard
↓
Lihat daftar surat izin sakit
↓
Lihat detail surat
↓
Arsip surat

---

# 3.3 Melihat Rekomendasi Lift

Dashboard
↓
Lihat rekomendasi lift
↓
Validasi internal kampus
↓
Arsip rekomendasi

---

# 4. System Flow

## Mobile App

Mahasiswa
↓
Flutter App
↓
Backend API
↓
Database MySQL

---

## Web Dashboard

Dashboard Klinik/Kemahasiswaan
↓
Backend API
↓
Database MySQL

---

# 5. Notes

- Semua data harus melalui Backend API
- Mobile dan Web tidak boleh langsung mengakses database
- Sistem menggunakan tema Eco Health Campus
- Data MVP menggunakan data dummy/CSV
- Sistem mendukung paperless administration
