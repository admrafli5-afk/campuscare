# CampusCare Team Sync Guide

## Role Tim

### Role A — Backend & Database

Fokus:
- Express API
- MySQL schema
- Auth & role
- Queue, QR, health check
- Sick letter, emergency
- Medical history, analytics
- Medicine, prescription, medical record
- API contract
- Migration SQL

### Role B — Flutter Mobile App

Fokus:
- Login mahasiswa
- Antrean digital
- QR display
- Medical history
- Sick letter
- Prescription history
- Profile

Endpoint wajib Role B:

```text
POST /api/auth/login
GET /api/auth/me
GET /api/queue/public-status
POST /api/queue/register
GET /api/queue/my-current
GET /api/students/me/medical-history
GET /api/sick-letters/me
GET /api/prescriptions/me
```

### Role C — Web Dashboard Klinik

Fokus:
- Login dashboard
- Dashboard statistik
- Antrean
- QR check-in
- Health check
- Emergency
- Sick letter
- Patient history
- Medicine inventory
- Prescription
- Medical record SOAP

Endpoint statistik resmi:

```text
GET /api/analytics/dashboard
```

Jangan gunakan:

```text
GET /api/statistics/clinic
```

### Role D — UI/UX + QA + Dokumentasi

Fokus:
- Design system
- Test case
- Bug report
- Demo script
- Dokumentasi
- Presentasi

---

## Perubahan Terbaru

Dashboard web kemahasiswaan dibatalkan.

Artinya:
- Jangan buat `web-dashboard/pages/student-affairs/`
- Tidak perlu dashboard kemahasiswaan khusus
- Surat izin sakit dibuat dari dashboard klinik
- Surat rekomendasi lift dibuat dari dashboard klinik
- Kemahasiswaan hanya sebagai penerima/tujuan dokumen administratif

---

## Struktur Web Dashboard

```text
web-dashboard/
├── index.html
├── pages/
│   └── clinic/
│       ├── login.html
│       ├── dashboard.html
│       ├── queue.html
│       ├── qr-checkin.html
│       ├── health-check.html
│       ├── emergency.html
│       ├── sick-letter.html
│       ├── lift-recommendation.html
│       ├── patient-history.html
│       └── statistics.html
├── components/
│   └── clinic/
│       ├── sidebar.html
│       └── navbar.html
└── assets/
    ├── css/
    │   ├── variables.css
    │   ├── global.css
    │   └── clinic.css
    └── js/
        ├── config.js
        ├── api.js
        └── clinic/
            ├── auth.js
            ├── dashboard.js
            ├── queue.js
            ├── qr-checkin.js
            ├── health-check.js
            ├── emergency.js
            ├── sick-letter.js
            ├── lift-recommendation.js
            ├── patient-history.js
            └── statistics.js
```

---

## Aturan Sinkronisasi

1. Jangan ubah endpoint tanpa koordinasi.
2. Frontend wajib mengikuti `docs/api-contract.md`.
3. Endpoint baru wajib masuk API contract.
4. Tabel baru wajib punya migration SQL.
5. Jangan merge branch teman jika hanya mau ambil folder.
6. Jangan push ke branch teman tanpa izin.
7. Jika conflict, jangan asal accept all.
8. Gunakan branch `backendd` sebagai branch integrasi terbaru jika sudah disepakati.

---

## Cara Aman Mengambil Folder Web dari Branch Role C

```bash
git fetch origin
git checkout backendd
git checkout origin/role-c-web-dashboard -- web-dashboard/
git status
git add web-dashboard/
git commit -m "Replace web dashboard with role C version"
git push origin backendd
```

Perintah ini tidak mengubah branch teman.
