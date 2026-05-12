# CampusCare Role Access

## Overview

CampusCare menggunakan sistem multi-role access untuk membatasi hak akses setiap pengguna sesuai tugasnya.

Role utama:

1. Mahasiswa
2. Petugas Klinik
3. Admin Klinik
4. Kemahasiswaan
5. Super Admin

---

# 1. Mahasiswa

## Access

Mahasiswa dapat:

- login mobile app
- melihat antrean klinik
- daftar antrean
- melihat estimasi pemeriksaan
- mendapatkan QR check-in
- melihat status antrean
- melihat riwayat kesehatan
- melihat surat izin sakit
- melihat rekomendasi lift
- mengelola profil kesehatan pribadi

---

## Restrictions

Mahasiswa tidak dapat:

- mengakses dashboard klinik
- mengubah data pemeriksaan
- memvalidasi surat
- mengakses data mahasiswa lain
- mengakses analytics sistem

---

# 2. Petugas Klinik

## Access

Petugas Klinik dapat:

- login dashboard klinik
- melihat antrean aktif
- scan QR mahasiswa
- melakukan check-in
- melihat data kesehatan mahasiswa
- membuat emergency case
- melakukan pemeriksaan awal
- membuat draft surat izin sakit
- membuat draft rekomendasi lift

---

## Restrictions

Petugas Klinik tidak dapat:

- menghapus data mahasiswa
- mengakses pengaturan sistem
- memvalidasi final surat
- mengakses dashboard kemahasiswaan

---

# 3. Admin Klinik

## Access

Admin Klinik dapat:

- semua akses Petugas Klinik
- validasi surat izin sakit
- validasi rekomendasi lift
- melihat laporan klinik
- melihat statistik layanan
- mengelola data pemeriksaan
- mengelola status layanan

---

## Restrictions

Admin Klinik tidak dapat:

- mengakses pengaturan super admin
- menghapus seluruh database
- mengubah role sistem utama

---

# 4. Kemahasiswaan

## Access

Kemahasiswaan dapat:

- login dashboard kemahasiswaan
- melihat surat izin sakit masuk
- melihat rekomendasi lift
- mengarsipkan surat
- mencetak surat
- melihat riwayat surat mahasiswa

---

## Restrictions

Kemahasiswaan tidak dapat:

- mengakses pemeriksaan medis detail
- mengubah hasil pemeriksaan
- mengakses dashboard teknis klinik
- mengubah data kesehatan mahasiswa

---

# 5. Super Admin

## Access

Super Admin dapat:

- mengakses seluruh sistem
- mengelola role
- mengelola user
- mengelola konfigurasi sistem
- melihat seluruh dashboard
- mengelola database sistem
- mengelola maintenance sistem

---

# 6. Access Matrix

| Feature                 | Mahasiswa | Petugas Klinik | Admin Klinik | Kemahasiswaan | Super Admin |
| ----------------------- | --------- | -------------- | ------------ | ------------- | ----------- |
| Login                   | ✅        | ✅             | ✅           | ✅            | ✅          |
| Daftar Antrean          | ✅        | ❌             | ❌           | ❌            | ✅          |
| QR Check-in             | ❌        | ✅             | ✅           | ❌            | ✅          |
| Pemeriksaan Awal        | ❌        | ✅             | ✅           | ❌            | ✅          |
| Emergency Case          | ❌        | ✅             | ✅           | ❌            | ✅          |
| Surat Izin Sakit        | View      | Draft          | Validate     | View          | Full        |
| Rekomendasi Lift        | View      | Draft          | Validate     | View          | Full        |
| Riwayat Kesehatan       | Self      | Limited        | Limited      | ❌            | Full        |
| Dashboard Klinik        | ❌        | ✅             | ✅           | ❌            | ✅          |
| Dashboard Kemahasiswaan | ❌        | ❌             | ❌           | ✅            | ✅          |
| Analytics               | ❌        | Limited        | ✅           | Limited       | Full        |
| System Settings         | ❌        | ❌             | ❌           | ❌            | ✅          |

---

# 7. Security Rules

- Semua endpoint menggunakan authentication
- Semua role menggunakan JWT token
- Password disimpan menggunakan hashing
- Data sensitif dibatasi berdasarkan role
- Aktivitas penting dicatat dalam audit log

---

# 8. Important Notes

- Klinik hanya membuat rekomendasi medis
- Persetujuan akses lift berada pada pihak kampus
- Mobile dan web wajib menggunakan Backend API
- Role access tidak boleh diubah tanpa validasi Super Admin
