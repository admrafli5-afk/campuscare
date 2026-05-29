# CampusCare Test Case

## Persiapan

Pastikan:
- Laragon/MySQL aktif
- database `campuscare_db` ada
- backend berjalan di port 5000
- data dummy sudah tersedia
- token login tersedia

Jalankan backend:

```powershell
cd D:\campuscare\backend
npm.cmd run dev
```

Base URL:

```text
http://localhost:5000/api
```

Password dummy:

```text
123456
```

---

## TC-01 Login Petugas

Endpoint:

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "petugas@campuscare.test",
  "password": "123456"
}
```

Expected:
- success true
- token tersedia
- role sesuai

---

## TC-02 Login Mahasiswa

Endpoint:

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "rafli@student.campuscare.test",
  "password": "123456"
}
```

Expected:
- success true
- token tersedia
- role student

---

## TC-03 Status Antrean Publik

Endpoint:

```http
GET /api/queue/public-status
```

Expected:
- bisa diakses tanpa token
- data status antrean tampil

---

## TC-04 Mahasiswa Ambil Antrean

Endpoint:

```http
POST /api/queue/register
```

Header:

```text
Authorization: Bearer TOKEN_MAHASISWA
```

Body:

```json
{
  "complaint": "Demam dan pusing",
  "service_type": "Pemeriksaan Umum"
}
```

Expected:
- queue_number ada
- qr_token ada
- status valid

---

## TC-05 Petugas Melihat Antrean Hari Ini

Endpoint:

```http
GET /api/queue/today
```

Header:

```text
Authorization: Bearer TOKEN_PETUGAS
```

Expected:
- antrean hari ini tampil

---

## TC-06 QR Check-in

Endpoint:

```http
POST /api/queue/check-in
```

Body:

```json
{
  "qr_token": "ISI_QR_TOKEN"
}
```

Expected:
- status berubah menjadi checked_in

---

## TC-07 Health Check

Endpoint:

```http
POST /api/health-checks
```

Body:

```json
{
  "queue_id": 1,
  "student_id": 1,
  "temperature": 37.8,
  "blood_pressure": "120/80",
  "pulse": 86,
  "weight": 49,
  "height": 164,
  "complaint": "Demam dan pusing",
  "condition_status": "light_sick",
  "recommendation": "Istirahat dan minum obat",
  "notes": "Disarankan istirahat 2 hari"
}
```

Expected:
- health check dibuat
- response memiliki id

---

## TC-08 Medical Record SOAP

Endpoint:

```http
POST /api/medical-records
```

Body:

```json
{
  "student_id": 1,
  "subjective": "Mahasiswa mengeluh demam dan pusing sejak pagi.",
  "objective": "Suhu 38°C, tekanan darah 120/80, nadi 90x/menit.",
  "assessment": "Demam ringan.",
  "plan": "Istirahat cukup dan konsumsi obat sesuai resep.",
  "diagnosis": "Febris ringan",
  "treatment": "Paracetamol 500mg",
  "doctor_notes": "Disarankan istirahat 2 hari.",
  "status": "final"
}
```

Expected:
- medical record dibuat
- status final

---

## TC-09 Tambah Obat

Endpoint:

```http
POST /api/medicines
```

Body:

```json
{
  "name": "Paracetamol 500mg",
  "category": "Analgesik",
  "unit": "tablet",
  "stock": 50,
  "minimum_stock": 10,
  "expired_date": "2027-12-31",
  "description": "Obat penurun demam dan pereda nyeri"
}
```

Expected:
- obat dibuat
- medicine_code otomatis
- stok awal masuk log

---

## TC-10 Membuat Resep

Endpoint:

```http
POST /api/prescriptions
```

Body:

```json
{
  "student_id": 1,
  "notes": "Resep untuk demam dan pusing",
  "items": [
    {
      "medicine_id": 1,
      "dosage": "500mg",
      "frequency": "3x sehari",
      "duration": "2 hari",
      "quantity": 6,
      "usage_instruction": "Diminum setelah makan"
    }
  ]
}
```

Expected:
- resep dibuat
- stok obat berkurang
- log stok bertambah

---

## TC-11 Mahasiswa Melihat Resep

Endpoint:

```http
GET /api/prescriptions/me
```

Header:

```text
Authorization: Bearer TOKEN_MAHASISWA
```

Expected:
- resep milik mahasiswa tampil

---

## TC-12 Surat Sakit

Endpoint:

```http
POST /api/sick-letters
```

Expected:
- surat dibuat sebagai draft
- nomor surat otomatis

---

## TC-13 Emergency Case

Endpoint:

```http
POST /api/emergency-cases
```

Expected:
- emergency case dibuat
- status awal emergency

---

## TC-14 Analytics Dashboard

Endpoint:

```http
GET /api/analytics/dashboard
```

Expected:
- data statistik dashboard tampil

---

## TC-15 Medical History

Endpoint mahasiswa:

```http
GET /api/students/me/medical-history
```

Endpoint dashboard klinik:

```http
GET /api/students/1/medical-history
```

Expected:
- riwayat kesehatan tampil
- data list tidak error walaupun kosong
