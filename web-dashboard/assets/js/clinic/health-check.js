const allowedClinicRoles = [
  "clinic_staff",
  "clinic_admin",
  "supervisor",
  "super_admin",
];

const userNameElement = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");

const healthCheckForm = document.getElementById("healthCheckForm");
const queueSelect = document.getElementById("queueSelect");
const refreshButton = document.getElementById("refreshButton");
const saveButton = document.getElementById("saveButton");

const temperatureInput = document.getElementById("temperature");
const bloodPressureInput = document.getElementById("bloodPressure");
const pulseInput = document.getElementById("pulse");
const respirationInput = document.getElementById("respiration");
const chiefComplaintInput = document.getElementById("chiefComplaint");
const notesInput = document.getElementById("notes");
const actionTakenInput = document.getElementById("actionTaken");

const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const patientTableBody = document.getElementById("patientTableBody");

let checkedInQueues = [];

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

function showWarning(message) {
  if (window.CampusAlert) {
    CampusAlert.toastWarning(message);
  } else {
    showError(message);
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

function mapQueueStatus(status) {
  const statuses = {
    waiting: "Menunggu",
    called: "Dipanggil",
    on_the_way: "Menuju Klinik",
    checked_in: "Hadir",
    in_checkup: "Sedang Diperiksa",
    completed: "Selesai",
    missed: "Terlewat",
    cancelled: "Dibatalkan",
    emergency: "Darurat",
  };

  return statuses[status] || status || "-";
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

    setUser(user);

    if (userNameElement) {
      userNameElement.textContent = user.name;
    }

    return true;
  } catch (error) {
    removeToken();
    window.location.href = "./login.html";
    return false;
  }
}

function normalizeQueueData(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.queues)) return data.queues;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

function getQueueId(queue) {
  return queue.id || queue.queue_id || queue.queueId;
}

function getStudentId(queue) {
  return (
    queue.student_id ||
    queue.studentId ||
    queue.student?.id ||
    queue.student?.student_id ||
    queue.student?.studentId ||
    null
  );
}

function getQueueLabel(queue) {
  const number = queue.queue_number || queue.queueNumber || "-";
  const name =
    queue.student_name ||
    queue.studentName ||
    queue.name ||
    queue.student?.name ||
    "Tanpa Nama";
  const nim = queue.nim || queue.student?.nim || "-";

  return `${number} - ${name} (${nim})`;
}

function renderQueueOptions() {
  if (!queueSelect) return;

  queueSelect.innerHTML = "";

  if (checkedInQueues.length === 0) {
    queueSelect.innerHTML = `<option value="">Belum ada pasien check-in</option>`;
    return;
  }

  queueSelect.innerHTML = `<option value="">Pilih pasien</option>`;

  checkedInQueues.forEach((queue) => {
    const option = document.createElement("option");
    option.value = getQueueId(queue);
    option.textContent = getQueueLabel(queue);
    queueSelect.appendChild(option);
  });
}

function renderPatientTable() {
  if (!patientTableBody) return;

  patientTableBody.innerHTML = "";

  if (checkedInQueues.length === 0) {
    patientTableBody.innerHTML = `
      <tr>
        <td colspan="5">Belum ada pasien yang sudah check-in.</td>
      </tr>
    `;
    return;
  }

  checkedInQueues.forEach((queue) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${queue.queue_number || queue.queueNumber || "-"}</td>
      <td>${
        queue.student_name ||
        queue.studentName ||
        queue.name ||
        queue.student?.name ||
        "-"
      }</td>
      <td>${queue.nim || queue.student?.nim || "-"}</td>
      <td>${queue.complaint || queue.symptoms || queue.chief_complaint || "-"}</td>
      <td>${mapQueueStatus(queue.status)}</td>
    `;

    patientTableBody.appendChild(row);
  });
}

async function loadCheckedInPatients({ silent = false } = {}) {
  hideMessages();

  if (queueSelect) {
    queueSelect.innerHTML = `<option value="">Memuat pasien...</option>`;
  }

  if (patientTableBody) {
    patientTableBody.innerHTML = `
      <tr>
        <td colspan="5">Memuat data pasien...</td>
      </tr>
    `;
  }

  try {
    const result = await apiRequest("/queue/today", {
      method: "GET",
    });

    if (!result.success) {
      showError(result.message || "Gagal memuat data pasien.");
      return;
    }

    const queues = normalizeQueueData(result.data);

    checkedInQueues = queues.filter((queue) => {
      return queue.status === "checked_in" || queue.status === "in_checkup";
    });

    renderQueueOptions();
    renderPatientTable();

    if (!silent) {
      showSuccess("Data pasien berhasil dimuat.");
    }
  } catch (error) {
    showError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
  }
}

function resetFormFields() {
  if (queueSelect) queueSelect.value = "";
  if (temperatureInput) temperatureInput.value = "";
  if (bloodPressureInput) bloodPressureInput.value = "";
  if (pulseInput) pulseInput.value = "";
  if (respirationInput) respirationInput.value = "";
  if (chiefComplaintInput) chiefComplaintInput.value = "";
  if (notesInput) notesInput.value = "";
  if (actionTakenInput) actionTakenInput.value = "";
}

async function handleSubmit(event) {
  event.preventDefault();
  hideMessages();

  const queueId = queueSelect ? queueSelect.value : "";

  if (!queueId) {
    showWarning("Pilih pasien terlebih dahulu.");
    return;
  }

  const selectedQueue = checkedInQueues.find((queue) => {
    return Number(getQueueId(queue)) === Number(queueId);
  });

  if (!selectedQueue) {
    showError("Data pasien tidak ditemukan. Silakan refresh pasien.");
    return;
  }

  const studentId = getStudentId(selectedQueue);

  if (!studentId) {
    console.log("Selected queue tidak memiliki student_id:", selectedQueue);
    showError(
      "student_id tidak ditemukan dari pasien yang dipilih. Backend perlu mengirim student_id pada /queue/today."
    );
    return;
  }

  if (!chiefComplaintInput.value.trim()) {
    showWarning("Keluhan utama wajib diisi.");
    return;
  }

  const patientName =
    selectedQueue.student_name ||
    selectedQueue.studentName ||
    selectedQueue.name ||
    selectedQueue.student?.name ||
    "pasien";

  const isConfirmed = await confirmAction(
    "Simpan Pemeriksaan?",
    `Pemeriksaan awal untuk ${patientName} akan disimpan.`,
    "Ya, simpan"
  );

  if (!isConfirmed) {
    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = "Menyimpan...";

  try {
    const payload = {
      queue_id: Number(queueId),
      student_id: Number(studentId),
      temperature: temperatureInput.value
        ? Number(temperatureInput.value)
        : null,
      blood_pressure: bloodPressureInput.value.trim(),
      pulse: pulseInput.value ? Number(pulseInput.value) : null,
      respiration: respirationInput.value ? Number(respirationInput.value) : null,
      chief_complaint: chiefComplaintInput.value.trim(),
      notes: notesInput.value.trim(),
      action_taken: actionTakenInput.value.trim(),
    };

    console.log("Payload health-checks:", payload);

    const result = await apiRequest("/health-checks", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!result.success) {
      showError(result.message || "Gagal menyimpan pemeriksaan.");
      return;
    }

    if (window.CampusAlert) {
      await CampusAlert.success(
        "Pemeriksaan Berhasil Disimpan",
        "Data pemeriksaan awal berhasil disimpan dan masuk ke riwayat pasien."
      );
    } else {
      showSuccess("Pemeriksaan awal berhasil disimpan.");
    }

    resetFormFields();
    await loadCheckedInPatients({ silent: true });
  } catch (error) {
    showError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Simpan Pemeriksaan";
  }
}

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
  refreshButton.addEventListener("click", function () {
    loadCheckedInPatients();
  });
}

if (healthCheckForm) {
  healthCheckForm.addEventListener("submit", handleSubmit);
}

(async function initHealthCheckPage() {
  const isAllowed = await protectClinicPage();

  if (isAllowed) {
    loadCheckedInPatients({ silent: true });
  }
})();