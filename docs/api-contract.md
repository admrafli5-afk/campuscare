Mantap, bos 🔥
Berarti **Checkpoint 1 untuk Role A sudah berhasil secara fungsi**.

Status kamu sekarang:

```text
✓ Backend Express jalan
✓ Database MySQL Laragon jalan
✓ Schema database berhasil dibuat
✓ Seed data dummy berhasil masuk
✓ Login multi-role berhasil
✓ JWT token berhasil keluar
✓ GET /api/auth/me berhasil
```

Sekarang tugas terakhir Role A untuk Checkpoint 1:

```text
1. Update docs/api-contract.md
2. Commit perubahan
3. Push ke GitHub
4. Berhenti dulu menunggu role lain
```

---

# 1. Update `docs/api-contract.md`

Buka file:

```text
D:\campuscare\docs\api-contract.md
```

Kalau belum ada, buat file baru.

Isi dengan ini:

````md
# CampusCare API Contract

Base URL:

```text
http://localhost:5000/api
````

## Standard Success Response

```json
{
  "success": true,
  "message": "Pesan berhasil",
  "data": {}
}
```

## Standard Error Response

```json
{
  "success": false,
  "message": "Pesan error",
  "errors": []
}
```

---

# Auth API

## POST /api/auth/login

Role access: public

### Request

```json
{
  "email": "rafli@student.campuscare.test",
  "password": "123456"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "Rafli Akbar",
      "email": "rafli@student.campuscare.test",
      "role": "student"
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Email atau password salah",
  "errors": []
}
```

---

## GET /api/auth/me

Role access: authenticated user

### Header

```text
Authorization: Bearer <token>
```

### Success Response

```json
{
  "success": true,
  "message": "Data user login berhasil diambil",
  "data": {
    "id": 1,
    "name": "Rafli Akbar",
    "email": "rafli@student.campuscare.test",
    "role": "student",
    "is_active": 1
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Token tidak ditemukan",
  "errors": []
}
```

---

## POST /api/auth/logout

Role access: authenticated user

### Header

```text
Authorization: Bearer <token>
```

### Success Response

```json
{
  "success": true,
  "message": "Logout berhasil. Hapus token dari client.",
  "data": null
}
```

---

# Dummy Accounts

Semua password dummy:

```text
123456
```

## Student

```text
email: rafli@student.campuscare.test
role : student
```

## Clinic Staff

```text
email: petugas@campuscare.test
role : clinic_staff
```

## Clinic Admin

```text
email: admin.klinik@campuscare.test
role : clinic_admin
```

## Supervisor / Dosen Penanggung Jawab

```text
email: supervisor@campuscare.test
role : supervisor
```

## Student Affairs / Kemahasiswaan

```text
email: kemahasiswaan@campuscare.test
role : student_affairs
```

## Super Admin

```text
email: superadmin@campuscare.test
role : super_admin
```

---

# Queue API

Status: Checkpoint 2. Belum dikerjakan.

---

# Health Check API

Status: Checkpoint 3. Belum dikerjakan.

---

# Sick Letter API

Status: Checkpoint 3. Belum dikerjakan.

---

# Emergency Case API

Status: Checkpoint 4. Belum dikerjakan.

---

# Facility Recommendation API

Status: Checkpoint 4. Belum dikerjakan.

````

---
