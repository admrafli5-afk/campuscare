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
const liftTable = document.getElementById("liftTable");
const liftTableBody = document.getElementById("liftTableBody");
const tableInfo = document.getElementById("tableInfo");

const totalLift = document.getElementById("totalLift");
const pendingLift = document.getElementById("pendingLift");
const activeLift = document.getElementById("activeLift");
const completedLift = document.getElementById("completedLift");

let liftData = [];
let filteredLiftData = [];

function showError(message) {
  if (window.CampusAlert) {
    CampusAlert.toastError(message);
  }

  if (!errorState) return;

  errorState.style.display = "block";
  errorState.textContent = message;
}

function showSuccess(message) {
  if (window.CampusAlert) {
    CampusAlert.toastSuccess(message);
  }
}

function hideError() {
  if (!errorState) return;

  errorState.style.display = "none";
  errorState.textContent = "";
}

async function confirmAction(title, message, confirmText = "Ya, lanjutkan") {
  if (window.CampusAlert) {
    return await CampusAlert.confirm(title, message, confirmText);
  }

  return window.confirm(message);
}

async function warningConfirm(title, message, confirmText = "Ya, lanjutkan") {
  if (window.CampusAlert && window.Swal) {
    const result = await Swal.fire({
      icon: "warning",
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
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

  if (window.CampusAlert) {
    return await CampusAlert.confirm(title, message, confirmText);
  }

  return window.confirm(message);
}

function setLoading(isLoading) {
  if (!loadingState || !liftTable) return;

  loadingState.style.display = isLoading ? "block" : "none";
  liftTable.style.display = isLoading ? "none" : "table";
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

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatPeriod(item) {
  const start =
    item.start_date ||
    item.startDate ||
    item.valid_from ||
    item.validFrom;

  const end =
    item.end_date ||
    item.endDate ||
    item.valid_until ||
    item.validUntil;

  if (!start && !end) {
    return "-";
  }

  if (start && end) {
    return `${formatDate(start)} - ${formatDate(end)}`;
  }

  return start ? `Mulai ${formatDate(start)}` : `Sampai ${formatDate(end)}`;
}

function mapLiftStatus(status) {
  const statuses = {
    pending: "Menunggu",
    approved: "Disetujui",
    active: "Aktif",
    completed: "Selesai",
    rejected: "Ditolak",
    cancelled: "Dibatalkan",
    expired: "Berakhir",
  };

  return statuses[status] || status || "-";
}

function getStatusBadgeClass(status) {
  if (status === "completed" || status === "approved" || status === "active") {
    return "badge-success";
  }

  if (status === "pending") {
    return "badge-warning";
  }

  if (status === "rejected" || status === "cancelled" || status === "expired") {
    return "badge-danger";
  }

  return "badge-info";
}

function normalizeLiftData(data) {
  if (Array.isArray(data)) return data;

  if (data && Array.isArray(data.lift_recommendations)) {
    return data.lift_recommendations;
  }

  if (data && Array.isArray(data.liftRecommendations)) {
    return data.liftRecommendations;
  }

  if (data && Array.isArray(data.items)) return data.items;

  return [];
}

function getLiftId(item) {
  return item.id || item.lift_id || item.liftId || item.recommendation_id;
}

function getStudentName(item) {
  return (
    item.student_name ||
    item.studentName ||
    item.name ||
    item.full_name ||
    "-"
  );
}

function getStudentNim(item) {
  return item.nim || item.student_nim || "-";
}

function getMedicalReason(item) {
  return (
    item.medical_reason ||
    item.medicalReason ||
    item.reason ||
    item.diagnosis ||
    item.notes ||
    "-"
  );
}

function getBuilding(item) {
  return item.building || item.building_name || item.location || item.room || "-";
}

function renderStats(items) {
  if (totalLift) {
    totalLift.textContent = items.length;
  }

  if (pendingLift) {
    pendingLift.textContent = items.filter((item) => {
      return item.status === "pending";
    }).length;
  }

  if (activeLift) {
    activeLift.textContent = items.filter((item) => {
      return item.status === "active" || item.status === "approved";
    }).length;
  }

  if (completedLift) {
    completedLift.textContent = items.filter((item) => {
      return item.status === "completed" || item.status === "expired";
    }).length;
  }
}

function buildActionButtons(item) {
  const liftId = getLiftId(item);
  const status = item.status;

  if (!liftId) {
    return `<span style="color: var(--muted);">ID tidak ada</span>`;
  }

  const buttons = [];

  if (status === "pending") {
    buttons.push(`
      <button class="btn btn-sm btn-success" onclick="updateLiftStatus(${liftId}, 'approved')">
        Setujui
      </button>
    `);

    buttons.push(`
      <button class="btn btn-sm btn-danger" onclick="updateLiftStatus(${liftId}, 'rejected')">
        Tolak
      </button>
    `);
  }

  if (status === "approved") {
    buttons.push(`
      <button class="btn btn-sm btn-info" onclick="updateLiftStatus(${liftId}, 'active')">
        Aktifkan
      </button>
    `);
  }

  if (status === "active") {
    buttons.push(`
      <button class="btn btn-sm btn-success" onclick="updateLiftStatus(${liftId}, 'completed')">
        Selesai
      </button>
    `);
  }

  if (
    status !== "completed" &&
    status !== "cancelled" &&
    status !== "rejected" &&
    status !== "expired"
  ) {
    buttons.push(`
      <button class="btn btn-sm btn-danger" onclick="updateLiftStatus(${liftId}, 'cancelled')">
        Batalkan
      </button>
    `);
  }

  if (buttons.length === 0) {
    return `<span style="color: var(--muted);">Tidak ada aksi</span>`;
  }

  return `<div class="action-group">${buttons.join("")}</div>`;
}

function renderTable(items) {
  if (!liftTableBody || !liftTable) return;

  liftTableBody.innerHTML = "";

  if (!items || items.length === 0) {
    liftTableBody.innerHTML = `
      <tr>
        <td colspan="7">Belum ada rekomendasi lift.</td>
      </tr>
    `;

    liftTable.style.display = "table";

    if (tableInfo) {
      tableInfo.textContent =
        "Belum ada data rekomendasi lift atau endpoint backend belum tersedia.";
    }

    return;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${getStudentName(item)}</td>
      <td>${getStudentNim(item)}</td>
      <td>${getMedicalReason(item)}</td>
      <td>${getBuilding(item)}</td>
      <td>${formatPeriod(item)}</td>
      <td>
        <span class="badge ${getStatusBadgeClass(item.status)}">
          ${mapLiftStatus(item.status)}
        </span>
      </td>
      <td>${buildActionButtons(item)}</td>
    `;

    liftTableBody.appendChild(row);
  });

  liftTable.style.display = "table";

  if (tableInfo) {
    tableInfo.textContent = `Menampilkan ${items.length} rekomendasi lift`;
  }
}

function applySearchFilter() {
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

  if (!keyword) {
    filteredLiftData = [...liftData];
  } else {
    filteredLiftData = liftData.filter((item) => {
      const combinedText = [
        getStudentName(item),
        getStudentNim(item),
        getMedicalReason(item),
        getBuilding(item),
        mapLiftStatus(item.status),
      ]
        .join(" ")
        .toLowerCase();

      return combinedText.includes(keyword);
    });
  }

  renderStats(filteredLiftData);
  renderTable(filteredLiftData);
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

async function loadLiftRecommendations({ silent = false } = {}) {
  hideError();

  if (!silent) {
    setLoading(true);
  }

  try {
    const result = await apiRequest("/lift-recommendations/today", {
      method: "GET",
    });

    if (!result.success) {
      liftData = [];
      filteredLiftData = [];

      renderStats([]);
      renderTable([]);

      const message =
        result.message ||
        "Belum ada data rekomendasi lift atau endpoint backend belum tersedia.";

      if (tableInfo) {
        tableInfo.textContent = message;
      }

      showError(message);
      return;
    }

    liftData = normalizeLiftData(result.data);
    filteredLiftData = [...liftData];

    renderStats(filteredLiftData);
    renderTable(filteredLiftData);

    if (!silent) {
      showSuccess("Data rekomendasi lift berhasil dimuat.");
    }
  } catch (error) {
    liftData = [];
    filteredLiftData = [];

    renderStats([]);
    renderTable([]);

    const message =
      "Belum ada data rekomendasi lift atau endpoint backend belum tersedia.";

    if (tableInfo) {
      tableInfo.textContent = message;
    }

    showError(message);
  } finally {
    setLoading(false);
  }
}

async function updateLiftStatus(liftId, status) {
  hideError();

  const label = mapLiftStatus(status);

  let confirmation = false;

  if (status === "rejected" || status === "cancelled") {
    confirmation = await warningConfirm(
      "Konfirmasi Rekomendasi Lift",
      `Status rekomendasi lift akan diubah menjadi "${label}".`,
      "Ya, ubah status"
    );
  } else {
    confirmation = await confirmAction(
      "Konfirmasi Rekomendasi Lift",
      `Status rekomendasi lift akan diubah menjadi "${label}".`,
      "Ya, ubah status"
    );
  }

  if (!confirmation) {
    return;
  }

  try {
    const result = await apiRequest(`/lift-recommendations/${liftId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    });

    if (!result.success) {
      showError(
        result.message ||
          "Endpoint update status rekomendasi lift belum tersedia dari backend."
      );
      return;
    }

    if (window.CampusAlert) {
      await CampusAlert.success(
        "Status Berhasil Diperbarui",
        `Rekomendasi lift berhasil diubah menjadi "${label}".`
      );
    } else {
      showSuccess(`Status rekomendasi lift berhasil diubah menjadi ${label}.`);
    }

    await loadLiftRecommendations({ silent: true });
  } catch (error) {
    showError(
      "Tidak dapat mengubah status rekomendasi lift. Pastikan endpoint backend tersedia."
    );
  }
}

window.updateLiftStatus = updateLiftStatus;

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
    loadLiftRecommendations();
  });
}

if (filterButton) {
  filterButton.addEventListener("click", applySearchFilter);
}

if (searchInput) {
  searchInput.addEventListener("input", applySearchFilter);
}

(async function initLiftRecommendationPage() {
  formatTodayDate();

  const isAllowed = await protectClinicPage();

  if (isAllowed) {
    loadLiftRecommendations({ silent: true });
  }
})();