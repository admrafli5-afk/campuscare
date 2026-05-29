# CampusCare Demo Script

## Tujuan Demo

Menunjukkan flow CampusCare dari mahasiswa mengambil antrean sampai petugas menyelesaikan pemeriksaan, membuat resep, dan melihat statistik.

---

## Narasi Pembuka

CampusCare adalah Smart Clinic & Wellness Hub untuk klinik kampus. Sistem ini membantu mengurangi antrean manual, mempercepat administrasi klinik, mengurangi penggunaan kertas, dan mendukung Green Campus.

---

## Flow Demo

### 1. Login Mahasiswa

Endpoint:

```text
POST /api/auth/login
```

Tunjukkan:
- login berhasil
- role student
- masuk home mahasiswa

### 2. Lihat Status Antrean

Endpoint:

```text
GET /api/queue/public-status
```

Tunjukkan:
- jumlah antrean aktif
- estimasi antrean
- status klinik

### 3. Mahasiswa Mengambil Antrean

Endpoint:

```text
POST /api/queue/register
```

Tunjukkan:
- queue_number
- qr_token
- status antrean

### 4. Petugas QR Check-in

Endpoint:

```text
POST /api/queue/check-in
```

Tunjukkan:
- QR valid
- status menjadi checked_in

### 5. Dashboard Melihat Antrean

Endpoint:

```text
GET /api/queue/today
```

Tunjukkan:
- daftar antrean
- status pasien
- prioritas

### 6. Health Check

Endpoint:

```text
POST /api/health-checks
```

Tunjukkan:
- suhu
- tekanan darah
- nadi
- keluhan
- rekomendasi

### 7. Medical Record SOAP

Endpoint:

```text
POST /api/medical-records
```

Tunjukkan SOAP:
- Subjective
- Objective
- Assessment
- Plan

### 8. Resep Obat

Endpoint:

```text
POST /api/prescriptions
```

Tunjukkan:
- nomor resep
- item obat
- stok obat berkurang

### 9. Stok Obat

Endpoint:

```text
GET /api/medicines
GET /api/medicines/:id/logs
```

Tunjukkan:
- daftar obat
- stok terbaru
- log stok keluar

### 10. Surat Sakit

Endpoint:

```text
POST /api/sick-letters
PATCH /api/sick-letters/:id/submit-validation
PATCH /api/sick-letters/:id/approve
```

Tunjukkan:
- nomor surat
- status validasi
- surat approved

### 11. Emergency Case

Endpoint:

```text
POST /api/emergency-cases
GET /api/emergency-cases/today
```

Tunjukkan:
- emergency tercatat
- status bisa dipantau

### 12. Medical History

Endpoint mahasiswa:

```text
GET /api/students/me/medical-history
```

Endpoint petugas:

```text
GET /api/students/:id/medical-history
```

Tunjukkan:
- antrean
- pemeriksaan
- surat sakit
- emergency

### 13. Analytics Dashboard

Endpoint:

```text
GET /api/analytics/dashboard
```

Tunjukkan:
- antrean hari ini
- pemeriksaan hari ini
- emergency
- total mahasiswa

---

## Catatan Demo Lokal

Jika memakai HP fisik, backend harus memakai IP laptop:

```text
http://IP_LAPTOP:5000/api
```

HP dan laptop harus satu WiFi.
