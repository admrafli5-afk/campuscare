# CampusCare Backend README

## Deskripsi

Backend CampusCare adalah REST API untuk Smart Clinic & Wellness Hub klinik kampus. Backend ini menghubungkan Flutter Mobile App dan Web Dashboard Klinik dengan database MySQL.

---

## Tech Stack

```text
Node.js
Express.js
MySQL
JWT Authentication
Laragon
```

---

## Setup

Masuk folder backend:

```powershell
cd D:\campuscare\backend
```

Install dependency:

```powershell
npm.cmd install
```

Jalankan backend:

```powershell
npm.cmd run dev
```

Seed data dummy:

```powershell
npm.cmd run seed
```

---

## Environment

File `.env` harus berada di:

```text
backend/.env
```

Contoh:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=campuscare_db
DB_PORT=3306

JWT_SECRET=campuscare_dev_secret
JWT_EXPIRES_IN=1d
```

---

## Script NPM

```text
npm.cmd start     -> node src/app.js
npm.cmd run dev   -> nodemon src/app.js
npm.cmd run seed  -> node scripts/seed.js
```

---

## Modul Backend

- Auth
- Queue
- QR Check-in
- Health Check
- Sick Letter
- Emergency Case
- Medical History
- Analytics
- Medicine Inventory
- Prescription
- Medical Record SOAP

---

## Endpoint Base

```text
http://localhost:5000/api
```

Modul endpoint:
- `/auth`
- `/queue`
- `/health-checks`
- `/sick-letters`
- `/emergency-cases`
- `/students`
- `/analytics`
- `/medicines`
- `/prescriptions`
- `/medical-records`

---

## Troubleshooting

### `Access denied for user ''@'localhost'`

Penyebab:
- `.env` tidak terbaca
- `DB_USER` kosong
- `.env` salah lokasi

Solusi:
- pastikan `backend/.env` ada
- pastikan `DB_USER=root`
- restart backend

### `Unknown database 'campuscare_db'`

Solusi:
Import schema utama:

```powershell
cmd /c "D:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe -u root < D:\campuscare\database\campuscare_schema.sql"
```

### `ECONNREFUSED 127.0.0.1:3306`

Solusi:
- Laragon → Start All
- pastikan MySQL aktif
- cek `DB_PORT`

---

## Status

Backend sudah sampai:
- Point 1 Auth & Role
- Point 2 Queue + QR
- Point 3 Health Check + Sick Letter
- Point 4 Emergency Case
- Point 5 Medical History + Analytics
- Point 6A Medicine Inventory
- Point 6B Prescription
- Point 6C Medical Record SOAP
