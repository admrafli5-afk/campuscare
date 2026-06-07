const allowedClinicRoles = [
  "clinic_staff",
  "clinic_admin",
  "supervisor",
  "super_admin",
];

const userNameElement = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");

const sickLetterForm = document.getElementById("sickLetterForm");
const healthCheckSelect = document.getElementById("healthCheckSelect");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const permissionClassInput = document.getElementById("permissionClass");
const courseNameInput = document.getElementById("courseName");
const lecturerNameInput = document.getElementById("lecturerName");
const diagnosisInput = document.getElementById("diagnosis");
const notesInput = document.getElementById("notes");

const saveButton = document.getElementById("saveButton");
const previewButton = document.getElementById("previewButton");
const refreshButton = document.getElementById("refreshButton");

const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

const previewCard = document.getElementById("previewCard");
const previewLetterNumber = document.getElementById("previewLetterNumber");
const previewName = document.getElementById("previewName");
const previewNim = document.getElementById("previewNim");
const previewPermissionClass = document.getElementById("previewPermissionClass");
const previewCourseName = document.getElementById("previewCourseName");
const previewLecturerName = document.getElementById("previewLecturerName");
const previewDiagnosis = document.getElementById("previewDiagnosis");
const previewPeriod = document.getElementById("previewPeriod");
const previewNotes = document.getElementById("previewNotes");
const previewOfficerName = document.getElementById("previewOfficerName");

const letterTableBody = document.getElementById("letterTableBody");

let healthChecks = [];
let sickLetters = [];
let currentUser = null;

function showError(message) {
  if (window.CampusAlert) {
    CampusAlert.toastError(message);
  }

  if (errorMessage) {
    errorMessage.style.display = "block";
    errorMessage.textContent = message;
  }

  if (successMessage) {
    successMessage.style.display = "none";
  }
}

function showSuccess(message) {
  if (window.CampusAlert) {
    CampusAlert.toastSuccess(message);
  }

  if (successMessage) {
    successMessage.style.display = "inline-block";
    successMessage.textContent = message;
  }

  if (errorMessage) {
    errorMessage.style.display = "none";
  }
}

function hideMessages() {
  if (errorMessage) {
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
  }

  if (successMessage) {
    successMessage.style.display = "none";
    successMessage.textContent = "";
  }
}

async function confirmAction(title, message, confirmText = "Ya, lanjutkan") {
  if (window.CampusAlert) {
    return await CampusAlert.confirm(title, message, confirmText);
  }

  return window.confirm(message);
}

async function warningConfirm(title, message, confirmText = "Ya, lanjutkan") {
  if (window.CampusAlert) {
    const result = await Swal.fire({
      icon: "warning",
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Batal",
      confirmButtonColor: "#047857",
      cancelButtonColor: "#64748b",
      background: "#ffffff",
      color: "#0f172a",
      customClass: {
        popup: "campuscare-swal-popup",
        title: "campuscare-swal-title",
        confirmButton: "campuscare-swal-confirm",
        cancelButton: "campuscare-swal-cancel",
      },
    });

    return result.isConfirmed === true;
  }

  return window.confirm(message);
}

async function protectClinicPage() {
  const token = getToken();

  if (!token) {
    window.location.href = "./login.html";
    return false;
  }

  try {
    const result = await apiRequest("/auth/me", {
      method: "GET",
    });

    if (!result.success) {
      removeToken();
      window.location.href = "./login.html";
      return false;
    }

    const user = result.data;

    if (!allowedClinicRoles.includes(user.role)) {
      removeToken();
      window.location.href = "./login.html";
      return false;
    }

    currentUser = user;
    setUser(user);

    if (userNameElement) {
      userNameElement.textContent = user.name;
    }

    if (previewOfficerName) {
      previewOfficerName.textContent = user.name;
    }

    return true;
  } catch (error) {
    removeToken();
    window.location.href = "./login.html";
    return false;
  }
}

function normalizeHealthCheckData(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.health_checks)) return data.health_checks;
  if (data && Array.isArray(data.healthChecks)) return data.healthChecks;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

function normalizeSickLetterData(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.sick_letters)) return data.sick_letters;
  if (data && Array.isArray(data.sickLetters)) return data.sickLetters;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

function getHealthCheckId(item) {
  return item.id || item.health_check_id || item.healthCheckId;
}

function getStudentId(item) {
  return item.student_id || item.studentId || item.student?.id;
}

function getStudentName(item) {
  return (
    item.student_name ||
    item.studentName ||
    item.name ||
    item.student?.name ||
    "-"
  );
}

function getStudentNim(item) {
  return item.nim || item.student_nim || item.student?.nim || "-";
}

function getDiagnosis(item) {
  return (
    item.diagnosis_summary ||
    item.diagnosis ||
    item.chief_complaint ||
    item.complaint ||
    item.notes ||
    "-"
  );
}

function getSelectedHealthCheck() {
  const selectedId = healthCheckSelect.value;

  return healthChecks.find((item) => {
    return String(getHealthCheckId(item)) === String(selectedId);
  });
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function calculateRestDays(startDateValue, endDateValue) {
  const startDate = new Date(startDateValue);
  const endDate = new Date(endDateValue);

  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return diffDays;
}

function mapLetterStatus(status) {
  const statuses = {
    draft: "Draft",
    waiting_validation: "Menunggu Validasi",
    approved: "Disetujui",
    rejected: "Ditolak",
    sent_to_student_affairs: "Dikirim ke Kemahasiswaan",
    printed: "Dicetak",
    cancelled: "Dibatalkan",
  };

  return statuses[status] || status || "-";
}

function getStatusBadgeClass(status) {
  if (status === "approved" || status === "sent_to_student_affairs") {
    return "badge-success";
  }

  if (status === "waiting_validation") {
    return "badge-warning";
  }

  if (status === "rejected" || status === "cancelled") {
    return "badge-danger";
  }

  return "badge-info";
}

function canValidateLetter() {
  if (!currentUser) return false;

  return ["clinic_staff", "clinic_admin", "supervisor", "super_admin"].includes(
    currentUser.role
  );
}

function buildReasonText() {
  const permissionClass = permissionClassInput.value.trim();
  const courseName = courseNameInput.value.trim();
  const lecturerName = lecturerNameInput.value.trim();
  const notes = notesInput.value.trim();

  const lines = [];

  if (permissionClass) {
    lines.push(`Kelas Izin: ${permissionClass}`);
  }

  if (courseName) {
    lines.push(`Mata Kuliah: ${courseName}`);
  }

  if (lecturerName) {
    lines.push(`Dosen/Keterangan: ${lecturerName}`);
  }

  if (notes) {
    lines.push(`Catatan: ${notes}`);
  }

  if (lines.length === 0) {
    return "Surat izin sakit berdasarkan hasil pemeriksaan klinik.";
  }

  return lines.join("\n");
}

function parseReasonText(reason) {
  const result = {
    permissionClass: "-",
    courseName: "-",
    lecturerName: "-",
    notes: "-",
    raw: reason || "-",
  };

  if (!reason) {
    return result;
  }

  const lines = String(reason).split(/\r?\n/);

  lines.forEach((line) => {
    const clean = line.trim();

    if (clean.startsWith("Kelas Izin:")) {
      result.permissionClass = clean.replace("Kelas Izin:", "").trim() || "-";
    } else if (clean.startsWith("Mata Kuliah:")) {
      result.courseName = clean.replace("Mata Kuliah:", "").trim() || "-";
    } else if (clean.startsWith("Dosen/Keterangan:")) {
      result.lecturerName =
        clean.replace("Dosen/Keterangan:", "").trim() || "-";
    } else if (clean.startsWith("Catatan:")) {
      result.notes = clean.replace("Catatan:", "").trim() || "-";
    }
  });

  return result;
}

function renderHealthCheckOptions() {
  healthCheckSelect.innerHTML = "";

  if (healthChecks.length === 0) {
    healthCheckSelect.innerHTML = `<option value="">Belum ada data pemeriksaan</option>`;
    return;
  }

  healthCheckSelect.innerHTML = `<option value="">Pilih data pemeriksaan</option>`;

  healthChecks.forEach((item) => {
    const option = document.createElement("option");
    option.value = getHealthCheckId(item);
    option.textContent = `${getStudentName(item)} (${getStudentNim(
      item
    )}) - ${getDiagnosis(item)}`;
    healthCheckSelect.appendChild(option);
  });
}

async function loadHealthChecks() {
  try {
    const result = await apiRequest("/health-checks", {
      method: "GET",
    });

    if (!result.success) {
      healthChecks = [];
      renderHealthCheckOptions();
      showError(result.message || "Gagal memuat data pemeriksaan.");
      return;
    }

    const items = normalizeHealthCheckData(result.data);

    healthChecks = items.filter((item) => {
      return getStudentId(item) && getHealthCheckId(item);
    });

    renderHealthCheckOptions();
  } catch (error) {
    healthChecks = [];
    renderHealthCheckOptions();
    showError("Tidak dapat memuat data pemeriksaan.");
  }
}

async function loadSickLetters() {
  try {
    const result = await apiRequest("/sick-letters", {
      method: "GET",
    });

    if (!result.success) {
      sickLetters = [];
      renderLetterTable();
      return;
    }

    sickLetters = normalizeSickLetterData(result.data);
    renderLetterTable();
  } catch (error) {
    sickLetters = [];
    renderLetterTable();
  }
}

async function loadPageData() {
  hideMessages();
  healthCheckSelect.innerHTML = `<option value="">Memuat data pemeriksaan...</option>`;

  await loadHealthChecks();
  await loadSickLetters();
}

function validateForm() {
  if (!healthCheckSelect.value) {
    showError("Pilih data pemeriksaan terlebih dahulu.");
    return false;
  }

  if (!startDateInput.value) {
    showError("Tanggal mulai izin wajib diisi.");
    return false;
  }

  if (!endDateInput.value) {
    showError("Tanggal selesai izin wajib diisi.");
    return false;
  }

  if (!diagnosisInput.value.trim()) {
    showError("Diagnosis atau keterangan sakit wajib diisi.");
    return false;
  }

  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);

  if (endDate < startDate) {
    showError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
    return false;
  }

  return true;
}

function renderPreview(letterData = null) {
  hideMessages();

  if (!validateForm()) {
    return;
  }

  const healthCheck = getSelectedHealthCheck();

  if (!healthCheck) {
    showError("Data pemeriksaan tidak ditemukan.");
    return;
  }

  previewLetterNumber.textContent = letterData?.letter_number || "Draft";
  previewName.textContent = getStudentName(healthCheck);
  previewNim.textContent = getStudentNim(healthCheck);
  previewPermissionClass.textContent = permissionClassInput.value.trim() || "-";
  previewCourseName.textContent = courseNameInput.value.trim() || "-";
  previewLecturerName.textContent = lecturerNameInput.value.trim() || "-";
  previewDiagnosis.textContent = diagnosisInput.value.trim();
  previewPeriod.textContent = `${formatDate(startDateInput.value)} sampai ${formatDate(
    endDateInput.value
  )}`;
  previewNotes.textContent = notesInput.value.trim() || "-";
  previewOfficerName.textContent = currentUser ? currentUser.name : "Petugas Klinik";

  previewCard.style.display = "block";
}

function resetForm() {
  healthCheckSelect.value = "";
  startDateInput.value = "";
  endDateInput.value = "";
  permissionClassInput.value = "";
  courseNameInput.value = "";
  lecturerNameInput.value = "";
  diagnosisInput.value = "";
  notesInput.value = "";
}

function buildLetterActions(letter) {
  const id = letter.id;

  if (!id) return "-";

  const buttons = [];

  if (letter.status === "draft") {
    buttons.push(`
      <button class="btn-sm btn-info" onclick="submitLetterValidation(${id})">
        Ajukan
      </button>
    `);
  }

  if (letter.status === "waiting_validation" && canValidateLetter()) {
    buttons.push(`
      <button class="btn-sm btn-success" onclick="approveLetter(${id})">
        Setujui
      </button>
    `);

    buttons.push(`
      <button class="btn-sm btn-danger" onclick="rejectLetter(${id})">
        Tolak
      </button>
    `);
  }

  if (
    letter.status === "draft" ||
    letter.status === "waiting_validation" ||
    letter.status === "approved"
  ) {
    buttons.push(`
      <button class="btn-sm btn-info" onclick="printLetter(${id})">
        Cetak PDF
      </button>
    `);
  }

  if (buttons.length === 0) {
    return `<span style="color: var(--muted);">Tidak ada aksi</span>`;
  }

  return `<div class="action-group">${buttons.join("")}</div>`;
}

function renderLetterTable() {
  if (!letterTableBody) return;

  letterTableBody.innerHTML = "";

  if (!sickLetters || sickLetters.length === 0) {
    letterTableBody.innerHTML = `
      <tr>
        <td colspan="7">Belum ada data surat sakit.</td>
      </tr>
    `;
    return;
  }

  sickLetters.forEach((letter) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${letter.letter_number || "-"}</td>
      <td>${letter.student_name || "-"}</td>
      <td>${letter.nim || "-"}</td>
      <td>${formatDate(letter.start_date)} - ${formatDate(letter.end_date)}</td>
      <td>${letter.diagnosis_summary || "-"}</td>
      <td>
        <span class="badge ${getStatusBadgeClass(letter.status)}">
          ${mapLetterStatus(letter.status)}
        </span>
      </td>
      <td>${buildLetterActions(letter)}</td>
    `;

    letterTableBody.appendChild(row);
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  hideMessages();

  if (!validateForm()) {
    return;
  }

  const healthCheck = getSelectedHealthCheck();

  if (!healthCheck) {
    showError("Data pemeriksaan tidak ditemukan.");
    return;
  }

  const confirmCreate = await confirmAction(
    "Buat Surat Sakit?",
    "Surat sakit akan dibuat dan langsung diajukan untuk validasi.",
    "Ya, buat surat"
  );

  if (!confirmCreate) {
    return;
  }

  const studentId = getStudentId(healthCheck);
  const healthCheckId = getHealthCheckId(healthCheck);
  const restDays = calculateRestDays(startDateInput.value, endDateInput.value);

  saveButton.disabled = true;
  saveButton.textContent = "Menyimpan...";

  try {
    const result = await apiRequest("/sick-letters", {
      method: "POST",
      body: JSON.stringify({
        student_id: Number(studentId),
        health_check_id: Number(healthCheckId),
        reason: buildReasonText(),
        diagnosis_summary: diagnosisInput.value.trim(),
        rest_days: restDays,
        start_date: startDateInput.value,
        end_date: endDateInput.value,
      }),
    });

    if (!result.success) {
      showError(result.message || "Gagal membuat surat sakit.");
      renderPreview();
      return;
    }

    const createdLetter = result.data;

    if (createdLetter?.id) {
      await apiRequest(`/sick-letters/${createdLetter.id}/submit-validation`, {
        method: "PATCH",
      });
    }

    if (window.CampusAlert) {
      await CampusAlert.success(
        "Surat Sakit Berhasil Dibuat",
        "Surat sakit berhasil dibuat dan diajukan untuk validasi."
      );
    } else {
      showSuccess("Surat sakit berhasil dibuat dan diajukan untuk validasi.");
    }

    renderPreview(createdLetter);
    resetForm();

    await loadSickLetters();
  } catch (error) {
    showError("Tidak dapat membuat surat sakit. Pastikan backend berjalan.");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Buat Surat Sakit";
  }
}

async function submitLetterValidation(id) {
  hideMessages();

  const isConfirmed = await confirmAction(
    "Ajukan Validasi?",
    "Surat ini akan diajukan untuk proses validasi.",
    "Ya, ajukan"
  );

  if (!isConfirmed) {
    return;
  }

  try {
    const result = await apiRequest(`/sick-letters/${id}/submit-validation`, {
      method: "PATCH",
    });

    if (!result.success) {
      showError(result.message || "Gagal mengajukan validasi.");
      return;
    }

    showSuccess("Surat berhasil diajukan untuk validasi.");
    await loadSickLetters();
  } catch (error) {
    showError("Tidak dapat mengajukan validasi surat.");
  }
}

async function approveLetter(id) {
  hideMessages();

  const isConfirmed = await confirmAction(
    "Setujui Surat Sakit?",
    "Surat izin sakit akan disetujui dan dapat digunakan mahasiswa.",
    "Ya, setujui"
  );

  if (!isConfirmed) {
    return;
  }

  try {
    const result = await apiRequest(`/sick-letters/${id}/approve`, {
      method: "PATCH",
    });

    if (!result.success) {
      showError(result.message || "Gagal menyetujui surat.");
      return;
    }

    if (window.CampusAlert) {
      await CampusAlert.success(
        "Surat Disetujui",
        "Surat izin sakit berhasil disetujui."
      );
    } else {
      showSuccess("Surat izin sakit berhasil disetujui.");
    }

    await loadSickLetters();
  } catch (error) {
    showError("Tidak dapat menyetujui surat.");
  }
}

async function rejectLetter(id) {
  hideMessages();

  const isConfirmed = await warningConfirm(
    "Tolak Surat Sakit?",
    "Surat izin sakit akan ditolak. Pastikan keputusan sudah sesuai.",
    "Ya, tolak"
  );

  if (!isConfirmed) {
    return;
  }

  try {
    const result = await apiRequest(`/sick-letters/${id}/reject`, {
      method: "PATCH",
    });

    if (!result.success) {
      showError(result.message || "Gagal menolak surat.");
      return;
    }

    if (window.CampusAlert) {
      await CampusAlert.warning(
        "Surat Ditolak",
        "Surat izin sakit berhasil ditolak."
      );
    } else {
      showSuccess("Surat izin sakit berhasil ditolak.");
    }

    await loadSickLetters();
  } catch (error) {
    showError("Tidak dapat menolak surat.");
  }
}

async function printLetter(id) {
  hideMessages();

  try {
    const result = await apiRequest(`/sick-letters/${id}`, {
      method: "GET",
    });

    if (!result.success) {
      showError(result.message || "Gagal mengambil detail surat.");
      return;
    }

    const letter = result.data;
    const reasonData = parseReasonText(letter.reason);

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      if (window.CampusAlert) {
        await CampusAlert.warning(
          "Popup Diblokir",
          "Izinkan popup pada browser untuk mencetak surat sakit."
        );
      } else {
        showError("Popup diblokir browser. Izinkan popup untuk mencetak surat.");
      }
      return;
    }

    const letterNumber = letter.letter_number || "-";
    const studentName = letter.student_name || "-";
    const nim = letter.nim || "-";
    const diagnosis = letter.diagnosis_summary || "-";
    const restDays = letter.rest_days || "-";
    const startDate = formatDate(letter.start_date);
    const endDate = formatDate(letter.end_date);
    const createdBy = letter.created_by_name || "Petugas Klinik";
    const validatedBy = letter.validated_by_name || "-";
    const status = mapLetterStatus(letter.status);
    const verificationToken = letter.verification_token || "-";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Surat Izin Sakit - ${letterNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            padding: 40px;
            line-height: 1.6;
          }

          .kop {
            text-align: center;
            border-bottom: 3px solid #111827;
            padding-bottom: 14px;
            margin-bottom: 28px;
          }

          .kop h2 {
            margin: 0;
            font-size: 22px;
            text-transform: uppercase;
          }

          .kop p {
            margin: 4px 0;
            font-size: 14px;
          }

          .title {
            text-align: center;
            margin-bottom: 26px;
          }

          .title h3 {
            margin: 0;
            text-decoration: underline;
            font-size: 18px;
          }

          .title p {
            margin: 4px 0 0;
            font-size: 14px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 18px 0;
          }

          td {
            padding: 6px 4px;
            vertical-align: top;
          }

          td:first-child {
            width: 190px;
            font-weight: bold;
          }

          .paragraph {
            margin-top: 20px;
            text-align: justify;
          }

          .signature {
            margin-top: 50px;
            display: flex;
            justify-content: flex-end;
          }

          .signature-box {
            width: 280px;
            text-align: center;
          }

          .stamp {
            margin-top: 8px;
            font-size: 12px;
            color: #6b7280;
          }

          .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #d1d5db;
            padding-top: 10px;
          }

          @media print {
            button {
              display: none;
            }

            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>Klinik Kesehatan Kampus</h2>
          <p>Satya Terra Bhinneka</p>
          <p>CampusCare - Smart Clinic & Wellness Hub</p>
        </div>

        <div class="title">
          <h3>Surat Izin Sakit</h3>
          <p>Nomor: ${letterNumber}</p>
        </div>

        <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>

        <table>
          <tr>
            <td>Nama</td>
            <td>: ${studentName}</td>
          </tr>
          <tr>
            <td>NIM</td>
            <td>: ${nim}</td>
          </tr>
          <tr>
            <td>Kelas Izin</td>
            <td>: ${reasonData.permissionClass}</td>
          </tr>
          <tr>
            <td>Mata Kuliah</td>
            <td>: ${reasonData.courseName}</td>
          </tr>
          <tr>
            <td>Dosen / Keterangan</td>
            <td>: ${reasonData.lecturerName}</td>
          </tr>
          <tr>
            <td>Diagnosis</td>
            <td>: ${diagnosis}</td>
          </tr>
          <tr>
            <td>Lama Istirahat</td>
            <td>: ${restDays} hari</td>
          </tr>
          <tr>
            <td>Periode Izin</td>
            <td>: ${startDate} sampai ${endDate}</td>
          </tr>
          <tr>
            <td>Catatan</td>
            <td>: ${reasonData.notes}</td>
          </tr>
          <tr>
            <td>Status Surat</td>
            <td>: ${status}</td>
          </tr>
        </table>

        <p class="paragraph">
          Berdasarkan hasil pemeriksaan di Klinik Kampus, mahasiswa tersebut
          disarankan untuk beristirahat dan tidak mengikuti aktivitas akademik
          selama periode yang telah disebutkan di atas.
        </p>

        <p class="paragraph">
          Demikian surat keterangan ini dibuat agar dapat digunakan sebagaimana mestinya.
        </p>

        <div class="signature">
          <div class="signature-box">
            <p>Petugas/Validator Klinik,</p>
            <br /><br /><br />
            <p><strong>${validatedBy !== "-" ? validatedBy : createdBy}</strong></p>
            <p class="stamp">Stempel Klinik diperlukan jika surat dicetak.</p>
          </div>
        </div>

        <div class="footer">
          <p>Surat ini diterbitkan melalui sistem CampusCare.</p>
          <p>Token Verifikasi: ${verificationToken}</p>
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();

    showSuccess("Surat siap dicetak.");
  } catch (error) {
    showError("Tidak dapat mencetak surat. Pastikan backend berjalan.");
  }
}

window.submitLetterValidation = submitLetterValidation;
window.approveLetter = approveLetter;
window.rejectLetter = rejectLetter;
window.printLetter = printLetter;

if (logoutButton) {
  logoutButton.addEventListener("click", async function () {
    const isConfirmed = await confirmAction(
      "Keluar dari akun?",
      "Anda perlu login kembali untuk mengakses dashboard klinik.",
      "Ya, logout"
    );

    if (!isConfirmed) {
      return;
    }

    removeToken();
    window.location.href = "./login.html";
  });
}

if (refreshButton) {
  refreshButton.addEventListener("click", loadPageData);
}

if (previewButton) {
  previewButton.addEventListener("click", renderPreview);
}

if (sickLetterForm) {
  sickLetterForm.addEventListener("submit", handleSubmit);
}

(async function initSickLetterPage() {
  const isAllowed = await protectClinicPage();

  if (isAllowed) {
    await loadPageData();
  }
})();