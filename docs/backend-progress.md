# CampusCare Backend Progress

## Status Umum

Backend CampusCare sudah berkembang dari MVP antrean menjadi backend mini clinic management system untuk kampus.

## Stack

```text
Node.js
Express.js
MySQL
JWT Authentication
Laragon Local Development
Firebase planned for Auth/FCM only
```

## Progress

### Point 1 — Auth & Role

Status: selesai.

Endpoint:
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Point 2 — Queue + QR Check-in

Status: selesai.

Endpoint:
- `GET /api/queue/public-status`
- `POST /api/queue/register`
- `GET /api/queue/my-current`
- `GET /api/queue/today`
- `POST /api/queue/check-in`
- `PATCH /api/queue/:id/status`

### Point 3 — Health Check + Sick Letter

Status: selesai.

Endpoint:
- `POST /api/health-checks`
- `GET /api/health-checks/:id`
- `POST /api/sick-letters`
- `PATCH /api/sick-letters/:id/submit-validation`
- `PATCH /api/sick-letters/:id/approve`
- `PATCH /api/sick-letters/:id/reject`
- `GET /api/sick-letters/me`
- `GET /api/sick-letters/:id`

### Point 4 — Emergency Case

Status: selesai.

Endpoint:
- `POST /api/emergency-cases`
- `GET /api/emergency-cases/today`
- `GET /api/emergency-cases/:id`
- `PATCH /api/emergency-cases/:id/status`

### Point 5 — Medical History + Analytics

Status: selesai.

Endpoint:
- `GET /api/students/me/medical-history`
- `GET /api/students/:id/medical-history`
- `GET /api/analytics/dashboard`

### Point 6A — Medicine Inventory

Status: selesai jika semua endpoint sudah dites.

Endpoint:
- `GET /api/medicines`
- `POST /api/medicines`
- `GET /api/medicines/low-stock`
- `GET /api/medicines/:id`
- `PATCH /api/medicines/:id`
- `PATCH /api/medicines/:id/stock`
- `GET /api/medicines/:id/logs`

### Point 6B — Prescription

Status: selesai jika semua endpoint sudah dites.

Endpoint:
- `POST /api/prescriptions`
- `GET /api/prescriptions/me`
- `GET /api/prescriptions/student/:student_id`
- `GET /api/prescriptions/:id`
- `PATCH /api/prescriptions/:id/cancel`

### Point 6C — Medical Record SOAP

Status: selesai jika semua endpoint sudah dites.

Endpoint:
- `POST /api/medical-records`
- `GET /api/medical-records/:id`
- `GET /api/medical-records/student/:student_id`
- `PATCH /api/medical-records/:id`

## Belum Dibuat

- Lift Recommendation Full
- Firebase FCM Token
- Notification API
- Audit Log API
- Report Export API

## Prioritas Selanjutnya

1. Commit dan push Point 6A/6B/6C.
2. Sinkronkan endpoint dengan Flutter dan Web Dashboard.
3. Jalankan test case end-to-end.
4. Buat audit log dasar.
5. Tambahkan Firebase FCM foundation.
6. Lanjut Lift Recommendation Full.
