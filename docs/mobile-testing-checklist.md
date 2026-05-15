# Mobile Testing Checklist — Role B

## Project
CampusCare — Smart Clinic & Wellness Hub

## Role
B — Flutter Mobile App

## Status
Checkpoint 1 selesai.  
Persiapan UI dummy Checkpoint 2 selesai.

---

## 1. Environment Test

| No | Test | Expected Result | Status |
|---|---|---|---|
| 1 | Backend berjalan | `CampusCare backend running on port 5000` | ☐ |
| 2 | MySQL Laragon aktif | Database `campuscare_db` bisa diakses | ☐ |
| 3 | HP dan laptop satu jaringan | HP bisa akses backend laptop | ☐ |
| 4 | API base URL benar | Flutter memakai IP laptop untuk HP fisik | ☐ |
| 5 | `flutter pub get` berhasil | Tidak ada dependency error | ☐ |

---

## 2. Login Test

| No | Test | Expected Result | Status |
|---|---|---|---|
| 1 | Login Rafli | Masuk home dan tampil `Halo, Rafli Akbar` | ☐ |
| 2 | Login Siti | Masuk home dan tampil `Halo, Siti Aisyah` | ☐ |
| 3 | Login email kosong | Muncul pesan validasi | ☐ |
| 4 | Login password kosong | Muncul pesan validasi | ☐ |
| 5 | Login password salah | Muncul pesan gagal login | ☐ |
| 6 | Login akun petugas klinik | Ditolak karena bukan akun mahasiswa | ☐ |

Akun mahasiswa:

rafli@student.campuscare.test / 123456
siti@student.campuscare.test / 123456

Akun petugas:
petugas@campuscare.test / 123456

| No | Test                      | Expected Result                      | Status |
| -- | ------------------------- | ------------------------------------ | ------ |
| 1  | Login berhasil            | Token tersimpan                      | ☐      |
| 2  | Tutup lalu buka aplikasi  | Otomatis masuk home jika token valid | ☐      |
| 3  | Logout                    | Token terhapus dan kembali ke login  | ☐      |
| 4  | Buka ulang setelah logout | Tetap berada di login                | ☐      |


| No | Test                       | Expected Result                            | Status |
| -- | -------------------------- | ------------------------------------------ | ------ |
| 1  | Home tampil setelah login  | Greeting sesuai nama user                  | ☐      |
| 2  | Status klinik dummy tampil | Menampilkan klinik buka dan estimasi dummy | ☐      |
| 3  | Menu layanan tampil        | Semua menu utama terlihat                  | ☐      |
| 4  | Tombol logout kanan atas   | Muncul dialog konfirmasi                   | ☐      |

5.queue dummy test
| No | Test                    | Expected Result                     | Status |
| -- | ----------------------- | ----------------------------------- | ------ |
| 1  | Klik Cek Antrean Klinik | Halaman antrean dummy tampil        | ☐      |
| 2  | Klik Daftar Antrean     | Form antrean tampil                 | ☐      |
| 3  | Submit tanpa keluhan    | Muncul validasi keluhan wajib diisi | ☐      |
| 4  | Submit dengan keluhan   | Masuk ke halaman QR dummy           | ☐      |
| 5  | Klik QR Antrean         | QR dummy tampil                     | ☐      |
| 6  | Klik Tracking Antrean   | Timeline antrean dummy tampil       | ☐      |

fitur dummy
- Antrean
- QR antrean
- Tracking antrean
- Profil kesehatan
- Riwayat kesehatan
- Surat izin sakit
- Rekomendasi lift

fitur yang uda konek database
- Login mahasiswa
- Validasi role student
- Token login
- Auto-login
- Logout

cara run
cd D:\campus_care\campuscare\mobile
flutter pub get
flutter run

cara run backend
cd D:\campus_care\campuscare\backend
npm.cmd run dev

kalau pake hp fisik
wajib ganti ip4v dulu
caranya ipconfig
static const String baseUrl = 'http://192.168.1.7:5000/api';

diubah 'http://sesuai ip laptopnya:5000/api';
ubah dibagian api_constant

HP dan laptop berada di jaringan yang sama.
Backend berjalan di laptop.
Firewall tidak memblokir port 5000.
AndroidManifest.xml mengizinkan cleartext HTTP.