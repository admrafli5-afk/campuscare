# CampusCare API Contract

Base URL lokal:

```text
http://localhost:5000/api
```

Jika dari HP fisik dalam WiFi yang sama:

```text
http://IP_LAPTOP:5000/api
```

Header untuk endpoint login-required:

```text
Authorization: Bearer <TOKEN_LOGIN>
Content-Type: application/json
```

---

## 1. Auth API

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| POST | `/auth/login` | Login multi-role | Public |
| GET | `/auth/me` | Ambil data user login | Semua user login |
| POST | `/auth/logout` | Logout client-side | Semua user login |

Contoh login:

```json
{
  "email": "petugas@campuscare.test",
  "password": "123456"
}
```

---

## 2. Queue API

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| GET | `/queue/public-status` | Status antrean publik | Public |
| POST | `/queue/register` | Mahasiswa ambil antrean + QR token | Student |
| GET | `/queue/my-current` | Antrean aktif mahasiswa | Student |
| GET | `/queue/today` | Daftar antrean hari ini | Clinic Staff/Admin/Supervisor |
| POST | `/queue/check-in` | QR check-in oleh petugas | Clinic Staff/Admin/Supervisor |
| PATCH | `/queue/:id/status` | Update status antrean | Clinic Staff/Admin/Supervisor |

Status antrean valid:

```text
waiting
called
on_the_way
checked_in
in_checkup
completed
missed
cancelled
```

---

## 3. Health Check API

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| POST | `/health-checks` | Simpan pemeriksaan awal | Clinic Staff/Admin/Supervisor |
| GET | `/health-checks/:id` | Detail pemeriksaan awal | Clinic Staff/Admin/Supervisor |

Status kondisi valid:

```text
healthy
light_sick
medium_sick
injury
emergency
need_referral
```

---

## 4. Sick Letter API

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| POST | `/sick-letters` | Membuat draft surat sakit | Clinic Staff/Admin/Supervisor |
| PATCH | `/sick-letters/:id/submit-validation` | Ajukan validasi surat | Clinic Staff/Admin/Supervisor |
| PATCH | `/sick-letters/:id/approve` | Approve surat sakit | Clinic Admin/Supervisor |
| PATCH | `/sick-letters/:id/reject` | Reject surat sakit | Clinic Admin/Supervisor |
| GET | `/sick-letters/me` | Mahasiswa lihat surat sakit miliknya | Student |
| GET | `/sick-letters/:id` | Detail surat sakit | Student/Clinic |

Catatan: Web kemahasiswaan dibatalkan. Surat sakit tetap dibuat dari dashboard klinik dan ditujukan ke kemahasiswaan sebagai dokumen administratif.

---

## 5. Emergency Case API

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| POST | `/emergency-cases` | Membuat kasus darurat | Clinic Staff/Admin/Supervisor |
| GET | `/emergency-cases/today` | Emergency hari ini | Clinic Staff/Admin/Supervisor |
| GET | `/emergency-cases/:id` | Detail emergency | Clinic Staff/Admin/Supervisor |
| PATCH | `/emergency-cases/:id/status` | Update status emergency | Clinic Staff/Admin/Supervisor |

Status emergency valid:

```text
emergency
emergency_handled
referred
stabilized
completed
```

---

## 6. Medical History API

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| GET | `/students/me/medical-history` | Mahasiswa lihat riwayat kesehatannya sendiri | Student |
| GET | `/students/:id/medical-history` | Klinik lihat riwayat mahasiswa tertentu | Clinic Staff/Admin/Supervisor |

Endpoint resmi mobile history:

```text
GET /api/students/me/medical-history
```

Jangan gunakan:

```text
/api/medical-records/my-history
/api/history/my
/api/medical-history
/api/medical-records/me
/api/health-records/my-history
```

---

## 7. Analytics API

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| GET | `/analytics/dashboard` | Statistik dashboard klinik | Clinic Staff/Admin/Supervisor |

Response berisi:
- queue_today
- active_queue_today
- health_checks_today
- sick_letters_total
- sick_letters_today
- emergency_today
- students_total
- dominant_conditions
- queue_status_today

Endpoint statistik resmi:

```text
GET /api/analytics/dashboard
```

Jangan gunakan:

```text
GET /api/statistics/clinic
```

---

## 8. Medicine Inventory API

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| GET | `/medicines` | Daftar obat | Clinic Staff/Admin/Supervisor |
| POST | `/medicines` | Tambah obat | Clinic Admin/Supervisor |
| GET | `/medicines/low-stock` | Obat stok menipis | Clinic Staff/Admin/Supervisor |
| GET | `/medicines/:id` | Detail obat | Clinic Staff/Admin/Supervisor |
| PATCH | `/medicines/:id` | Edit obat | Clinic Admin/Supervisor |
| PATCH | `/medicines/:id/stock` | Update stok obat | Clinic Admin/Supervisor |
| GET | `/medicines/:id/logs` | Log perubahan stok obat | Clinic Staff/Admin/Supervisor |

Tipe stok valid:

```text
in
out
adjust
```

---

## 9. Prescription API

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| POST | `/prescriptions` | Membuat resep obat dan mengurangi stok | Clinic Staff/Admin/Supervisor |
| GET | `/prescriptions/me` | Mahasiswa melihat resepnya | Student |
| GET | `/prescriptions/student/:student_id` | Klinik melihat resep mahasiswa tertentu | Clinic Staff/Admin/Supervisor |
| GET | `/prescriptions/:id` | Detail resep | Student/Clinic |
| PATCH | `/prescriptions/:id/cancel` | Membatalkan resep | Clinic Admin/Supervisor |

Catatan: cancel prescription belum otomatis mengembalikan stok obat.

---

## 10. Medical Record SOAP API

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| POST | `/medical-records` | Membuat rekam medis SOAP | Clinic Staff/Admin/Supervisor |
| GET | `/medical-records/:id` | Detail medical record | Clinic Staff/Admin/Supervisor |
| GET | `/medical-records/student/:student_id` | Medical record mahasiswa tertentu | Clinic Staff/Admin/Supervisor |
| PATCH | `/medical-records/:id` | Update medical record | Clinic Staff/Admin/Supervisor |

Status medical record valid:

```text
draft
final
cancelled
```

---

## Endpoint yang Belum Dibuat

### Lift Recommendation Full

Rencana:

```text
POST /lift-recommendations
PATCH /lift-recommendations/:id/submit
PATCH /lift-recommendations/:id/approve
PATCH /lift-recommendations/:id/reject
GET /lift-recommendations/:id
GET /lift-recommendations/student/:student_id
```

### Firebase FCM Token

Rencana:

```text
POST /devices/fcm-token
DELETE /devices/fcm-token
```

### Notification API

Rencana:

```text
GET /notifications/me
PATCH /notifications/:id/read
```

### Audit Log API

Rencana:

```text
GET /audit-logs
```

### Report Export API

Rencana:

```text
GET /reports/monthly
GET /reports/sick-letters
GET /reports/emergency
GET /reports/medicine-stock
```
