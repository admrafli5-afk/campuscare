const allowedClinicRoles = [
  "clinic_staff",
  "clinic_admin",
  "supervisor",
  "super_admin",
];

const userNameElement = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");
const refreshButton = document.getElementById("refreshButton");
const filterButton = document.getElementById("filterButton");
const searchInput = document.getElementById("searchInput");

const todayDateElement = document.getElementById("todayDate");
const todayDayElement = document.getElementById("todayDay");

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const emergencyTable = document.getElementById("emergencyTable");
const emergencyTableBody = document.getElementById("emergencyTableBody");
const tableInfo = document.getElementById("tableInfo");

const totalEmergency = document.getElementById("totalEmergency");
const highPriorityEmergency = document.getElementById("highPriorityEmergency");
const handlingEmergency = document.getElementById("handlingEmergency");
const completedEmergency = document.getElementById("completedEmergency");

const createEmergencyButton = document.getElementById("createEmergencyButton");

const emergencyModal = document.getElementById("emergencyModal");
const closeEmergencyModal = document.getElementById("closeEmergencyModal");
const cancelEmergencyModal = document.getElementById("cancelEmergencyModal");
const emergencyForm = document.getElementById("emergencyForm");
const saveEmergencyButton = document.getElementById("saveEmergencyButton");

const studentNimInput = document.getElementById("studentNim");
const temporaryPatientNameInput = document.getElementById(
  "temporaryPatientName"
);
const conditionTypeInput = document.getElementById("conditionType");
const locationInput = document.getElementById("locationInput");
const broughtByNameInput = document.getElementById("broughtByName");
const broughtByPhoneInput = document.getElementById("broughtByPhone");
const incidentTimeInput = document.getElementById("incidentTime");
const initialConditionInput = document.getElementById("initialCondition");

const identityModal = document.getElementById("identityModal");
const closeIdentityModal = document.getElementById("closeIdentityModal");
const cancelIdentityModal = document.getElementById("cancelIdentityModal");
const identityForm = document.getElementById("identityForm");
const identityEmergencyIdInput = document.getElementById("identityEmergencyId");
const identityNimInput = document.getElementById("identityNim");
const saveIdentityButton = document.getElementById("saveIdentityButton");

let emergencyData = [];
let filteredEmergencyData = [];

function showError(message) {
  if (!errorState) return;

  errorState.style.display = "block";
  errorState.textContent = message;
}

function hideError() {
  if (!errorState) return;

  errorState.style.display = "none";
  errorState.textContent = "";
}

function showInfo(message) {
  if (tableInfo) {
    tableInfo.textContent = message;
  }
}

function setLoading(isLoading) {
  if (!loadingState || !emergencyTable) return;

  loadingState.style.display = isLoading ? "block" : "none";
  emergencyTable.style.display = isLoading ? "none" : "table";
}

function openEmergencyModal() {
  if (!emergencyModal) return;

  emergencyModal.classList.add("show");
}

function closeEmergencyModalHandler() {
  if (!emergencyModal) return;

  emergencyModal.classList.remove("show");
}

function openIdentityModal(emergencyId) {
  if (!identityModal) return;

  identityEmergencyIdInput.value = emergencyId;
  identityNimInput.value = "";
  identityModal.classList.add("show");
}

function closeIdentityModalHandler() {
  if (!identityModal) return;

  identityModal.classList.remove("show");
}

function resetEmergencyForm() {
  if (!emergencyForm) return;

  emergencyForm.reset();

  if (incidentTimeInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    incidentTimeInput.value = now.toISOString().slice(0, 16);
  }
}

function formatTodayDate() {
  const today = new Date();

  if (todayDateElement) {
    todayDateElement.textContent = today.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (todayDayElement) {
    todayDayElement.textContent = today.toLocaleDateString("id-ID", {
      weekday: "long",
    });
  }
}

function formatTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
}

function mapPriority(priority) {
  const priorities = {
    low: "Rendah",
    medium: "Sedang",
    high: "Tinggi",
    critical: "Kritis",
    emergency: "Darurat",
  };

  return priorities[priority] || priority || "-";
}

function mapEmergencyStatus(status) {
  const statuses = {
    emergency: "Darurat",
    emergency_handled: "Ditangani",
    referred: "Dirujuk",
    stabilized: "Stabil",
    completed: "Selesai",
  };

  return statuses[status] || status || "-";
}

function getPriorityBadgeClass(priority) {
  if (
    priority === "critical" ||
    priority === "high" ||
    priority === "emergency"
  ) {
    return "badge-danger";
  }

  if (priority === "medium") {
    return "badge-warning";
  }

  return "badge-info";
}

function getStatusBadgeClass(status) {
  if (status === "completed") {
    return "badge-success";
  }

  if (
    status === "emergency_handled" ||
    status === "referred" ||
    status === "stabilized"
  ) {
    return "badge-info";
  }

  if (status === "emergency") {
    return "badge-danger";
  }

  return "badge-info";
}

function normalizeEmergencyData(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.emergency_cases)) return data.emergency_cases;
  if (data && Array.isArray(data.emergencyCases)) return data.emergencyCases;
  if (data && Array.isArray(data.emergencies)) return data.emergencies;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

function getEmergencyId(item) {
  return item.id || item.emergency_id || item.emergencyId;
}

function getStudentName(item) {
  return (
    item.student_name ||
    item.studentName ||
    item.temporary_patient_name ||
    item.temporaryPatientName ||
    item.name ||
    item.full_name ||
    "Pasien Sementara"
  );
}

function getStudentNim(item) {
  if (item.identity_status === "identity_pending") {
    return "Belum diverifikasi";
  }

  return item.nim || item.student_nim || "-";
}

function getEmergencyLocation(item) {
  return item.location || item.room || item.building || "-";
}

function getEmergencyDescription(item) {
  const condition = item.condition_type || item.conditionType || "";
  const initialCondition =
    item.initial_condition || item.initialCondition || "";
  const notes = item.description || item.complaint || item.notes || "";

  const combined = [condition, initialCondition, notes]
    .filter(Boolean)
    .join(" - ");

  return combined || "-";
}

function getEmergencyPriority(item) {
  return (
    item.priority_level ||
    item.priorityLevel ||
    item.priority ||
    "emergency"
  );
}

function renderStats(items) {
  if (totalEmergency) {
    totalEmergency.textContent = items.length;
  }

  if (highPriorityEmergency) {
    highPriorityEmergency.textContent = items.filter((item) => {
      const priority = getEmergencyPriority(item);

      return (
        priority === "high" ||
        priority === "critical" ||
        priority === "emergency"
      );
    }).length;
  }

  if (handlingEmergency) {
    handlingEmergency.textContent = items.filter((item) => {
      return (
        item.status === "emergency" ||
        item.status === "emergency_handled" ||
        item.status === "referred" ||
        item.status === "stabilized"
      );
    }).length;
  }

  if (completedEmergency) {
    completedEmergency.textContent = items.filter((item) => {
      return item.status === "completed";
    }).length;
  }
}

function buildActionButtons(item) {
  const emergencyId = getEmergencyId(item);
  const status = item.status;

  if (!emergencyId) {
    return `<span style="color: var(--muted);">ID tidak ada</span>`;
  }

  const buttons = [];

  if (item.identity_status === "identity_pending") {
    buttons.push(`
      <button class="btn btn-sm btn-warning" onclick="openIdentityModal(${emergencyId})">
        Lengkapi Identitas
      </button>
    `);
  }

  if (status === "emergency") {
    buttons.push(`
      <button class="btn btn-sm btn-info" onclick="updateEmergencyStatus(${emergencyId}, 'emergency_handled')">
        Tangani
      </button>
    `);
  }

  if (status === "emergency_handled") {
    buttons.push(`
      <button class="btn btn-sm btn-warning" onclick="updateEmergencyStatus(${emergencyId}, 'referred')">
        Rujuk
      </button>
    `);

    buttons.push(`
      <button class="btn btn-sm btn-info" onclick="updateEmergencyStatus(${emergencyId}, 'stabilized')">
        Stabil
      </button>
    `);
  }

  if (
    status === "emergency_handled" ||
    status === "referred" ||
    status === "stabilized"
  ) {
    buttons.push(`
      <button class="btn btn-sm btn-success" onclick="updateEmergencyStatus(${emergencyId}, 'completed')">
        Selesai
      </button>
    `);
  }

  if (buttons.length === 0) {
    return `<span style="color: var(--muted);">Tidak ada aksi</span>`;
  }

  return `<div class="action-group">${buttons.join("")}</div>`;
}

function renderTable(items) {
  if (!emergencyTableBody || !emergencyTable) return;

  emergencyTableBody.innerHTML = "";

  if (!items || items.length === 0) {
    emergencyTableBody.innerHTML = `
      <tr>
        <td colspan="8">Belum ada laporan emergency hari ini.</td>
      </tr>
    `;

    emergencyTable.style.display = "table";
    showInfo("Menampilkan 0 data emergency");

    return;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");
    const priority = getEmergencyPriority(item);

    row.innerHTML = `
      <td>${formatTime(
      item.created_at ||
      item.createdAt ||
      item.incident_time ||
      item.incidentTime
    )}</td>
      <td>${getStudentName(item)}</td>
      <td>${getStudentNim(item)}</td>
      <td>${getEmergencyLocation(item)}</td>
      <td>${getEmergencyDescription(item)}</td>
      <td>
        <span class="badge ${getPriorityBadgeClass(priority)}">
          ${mapPriority(priority)}
        </span>
      </td>
      <td>
        <span class="badge ${getStatusBadgeClass(item.status)}">
          ${mapEmergencyStatus(item.status)}
        </span>
      </td>
      <td>${buildActionButtons(item)}</td>
    `;

    emergencyTableBody.appendChild(row);
  });

  emergencyTable.style.display = "table";
  showInfo(`Menampilkan ${items.length} data emergency`);
}

function applySearchFilter() {
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

  if (!keyword) {
    filteredEmergencyData = [...emergencyData];
  } else {
    filteredEmergencyData = emergencyData.filter((item) => {
      const combinedText = [
        getStudentName(item),
        getStudentNim(item),
        getEmergencyLocation(item),
        getEmergencyDescription(item),
        mapPriority(getEmergencyPriority(item)),
        mapEmergencyStatus(item.status),
      ]
        .join(" ")
        .toLowerCase();

      return combinedText.includes(keyword);
    });
  }

  renderStats(filteredEmergencyData);
  renderTable(filteredEmergencyData);
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

async function loadEmergencyData() {
  hideError();
  setLoading(true);

  try {
    const result = await apiRequest("/emergency-cases/today", {
      method: "GET",
    });

    if (!result.success) {
      emergencyData = [];
      filteredEmergencyData = [];

      showError(result.message || "Gagal mengambil data emergency.");
      renderStats([]);
      renderTable([]);
      return;
    }

    emergencyData = normalizeEmergencyData(result.data);
    filteredEmergencyData = [...emergencyData];

    renderStats(filteredEmergencyData);
    renderTable(filteredEmergencyData);
  } catch (error) {
    emergencyData = [];
    filteredEmergencyData = [];

    showError(
      "Tidak dapat memuat data emergency. Pastikan backend berjalan dan endpoint /emergency-cases/today tersedia."
    );

    renderStats([]);
    renderTable([]);
  } finally {
    setLoading(false);
  }
}

async function handleCreateEmergency(event) {
  event.preventDefault();
  hideError();

  const conditionType = conditionTypeInput.value.trim();
  const initialCondition = initialConditionInput.value.trim();

  if (!conditionType) {
    showError("Kondisi darurat wajib dipilih.");
    return;
  }

  if (!initialCondition) {
    showError("Kondisi awal wajib diisi.");
    return;
  }

  const studentNimValue = studentNimInput.value.trim();
  const temporaryNameValue = temporaryPatientNameInput.value.trim();

  const payload = {
    nim: studentNimValue || null,
    temporary_patient_name:
      temporaryNameValue || "Pasien Darurat Sementara",
    condition_type: conditionType,
    location: locationInput.value.trim() || null,
    brought_by_name: broughtByNameInput.value.trim() || null,
    brought_by_phone: broughtByPhoneInput.value.trim() || null,
    incident_time: incidentTimeInput.value || null,
    initial_condition: initialCondition,
  };

  saveEmergencyButton.disabled = true;
  saveEmergencyButton.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Menyimpan...
  `;

  try {
    const result = await apiRequest("/emergency-cases", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!result.success) {
      showError(result.message || "Gagal membuat kasus emergency.");
      return;
    }

    closeEmergencyModalHandler();
    resetEmergencyForm();
    await loadEmergencyData();
  } catch (error) {
    showError("Tidak dapat membuat kasus emergency. Pastikan backend berjalan.");
  } finally {
    saveEmergencyButton.disabled = false;
    saveEmergencyButton.innerHTML = `
      <i class="fa-solid fa-floppy-disk"></i>
      Simpan Emergency
    `;
  }
}

async function handleUpdateIdentity(event) {
  event.preventDefault();
  hideError();

  const emergencyId = identityEmergencyIdInput.value;
  const nim = identityNimInput.value.trim();

  if (!emergencyId) {
    showError("ID emergency tidak ditemukan.");
    return;
  }

  if (!nim) {
    showError("NIM mahasiswa wajib diisi.");
    return;
  }

  saveIdentityButton.disabled = true;
  saveIdentityButton.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Menyimpan...
  `;

  try {
    const result = await apiRequest(`/emergency-cases/${emergencyId}/identity`, {
      method: "PATCH",
      body: JSON.stringify({
        nim,
      }),
    });

    if (!result.success) {
      showError(result.message || "Gagal melengkapi identitas emergency.");
      return;
    }

    closeIdentityModalHandler();
    await loadEmergencyData();
  } catch (error) {
    showError("Tidak dapat melengkapi identitas emergency.");
  } finally {
    saveIdentityButton.disabled = false;
    saveIdentityButton.innerHTML = `
      <i class="fa-solid fa-floppy-disk"></i>
      Simpan Identitas
    `;
  }
}

async function updateEmergencyStatus(emergencyId, status) {
  hideError();

  let confirmation = true;

  if (typeof showConfirmDialog === "function") {
    confirmation = await showConfirmDialog(
      `Ubah status emergency menjadi "${mapEmergencyStatus(status)}"?`,
      {
        title: "Konfirmasi Status Emergency",
        confirmText: "Ya, ubah status",
        cancelText: "Batal",
        type: "warning",
      }
    );
  } else {
    confirmation = window.confirm(
      `Ubah status emergency menjadi "${mapEmergencyStatus(status)}"?`
    );
  }

  if (!confirmation) {
    return;
  }

  try {
    const result = await apiRequest(`/emergency-cases/${emergencyId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    });

    if (!result.success) {
      showError(result.message || "Gagal mengubah status emergency.");
      return;
    }

    await loadEmergencyData();
  } catch (error) {
    showError(
      "Tidak dapat mengubah status emergency. Pastikan backend berjalan."
    );
  }
}

window.updateEmergencyStatus = updateEmergencyStatus;
window.openIdentityModal = openIdentityModal;

if (logoutButton) {
  logoutButton.addEventListener("click", function () {
    removeToken();
    window.location.href = "./login.html";
  });
}

if (refreshButton) {
  refreshButton.addEventListener("click", loadEmergencyData);
}

if (filterButton) {
  filterButton.addEventListener("click", applySearchFilter);
}

if (searchInput) {
  searchInput.addEventListener("input", applySearchFilter);
}

if (createEmergencyButton) {
  createEmergencyButton.addEventListener("click", function () {
    resetEmergencyForm();
    openEmergencyModal();
  });
}

if (closeEmergencyModal) {
  closeEmergencyModal.addEventListener("click", closeEmergencyModalHandler);
}

if (cancelEmergencyModal) {
  cancelEmergencyModal.addEventListener("click", closeEmergencyModalHandler);
}

if (emergencyModal) {
  emergencyModal.addEventListener("click", function (event) {
    if (event.target === emergencyModal) {
      closeEmergencyModalHandler();
    }
  });
}

if (emergencyForm) {
  emergencyForm.addEventListener("submit", handleCreateEmergency);
}

if (closeIdentityModal) {
  closeIdentityModal.addEventListener("click", closeIdentityModalHandler);
}

if (cancelIdentityModal) {
  cancelIdentityModal.addEventListener("click", closeIdentityModalHandler);
}

if (identityModal) {
  identityModal.addEventListener("click", function (event) {
    if (event.target === identityModal) {
      closeIdentityModalHandler();
    }
  });
}

if (identityForm) {
  identityForm.addEventListener("submit", handleUpdateIdentity);
}

(async function initEmergencyPage() {
  formatTodayDate();
  resetEmergencyForm();

  const isAllowed = await protectClinicPage();

  if (isAllowed) {
    loadEmergencyData();
  }
})();