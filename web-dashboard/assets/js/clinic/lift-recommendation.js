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

// === ELEMEN MODAL BUAT REKOMENDASI ===
const createLiftBtn = document.getElementById("createLiftBtn");
const liftModal = document.getElementById("liftModal");
const closeLiftModal = document.getElementById("closeLiftModal");
const cancelLiftModal = document.getElementById("cancelLiftModal");
const liftForm = document.getElementById("liftForm");
const saveLiftBtn = document.getElementById("saveLiftBtn");

let liftData = [];
let filteredLiftData = [];

function showError(message) {
  if (window.CampusAlert) {
    CampusAlert.toastError(message);
  } else {
    alert("Error: " + message);
  }

  if (!errorState) return;
  errorState.style.display = "block";
  errorState.textContent = message;
}

function showSuccess(message) {
  if (window.CampusAlert) {
    CampusAlert.toastSuccess(message);
  } else {
    alert("Sukses: " + message);
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

function setLoading(isLoading) {
  if (!loadingState || !liftTable) return;
  loadingState.style.display = isLoading ? "block" : "none";
  liftTable.style.display = isLoading ? "none" : "table";
}

function formatTodayDate() {
  const today = new Date();
  if (todayDateElement) {
    todayDateElement.textContent = today.toLocaleDateString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
    });
  }
  if (todayDayElement) {
    todayDayElement.textContent = today.toLocaleDateString("id-ID", { weekday: "long" });
  }
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function formatPeriod(item) {
  const start = item.start_date || item.startDate || item.valid_from;
  const end = item.end_date || item.endDate || item.valid_until;

  if (!start && !end) return "-";
  if (start && end) return `${formatDate(start)} - ${formatDate(end)}`;
  return start ? `Mulai ${formatDate(start)}` : `Sampai ${formatDate(end)}`;
}

function mapLiftStatus(status) {
  const statuses = {
    draft: "Draft",
    waiting_validation: "Menunggu",
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
  if (status === "completed" || status === "approved" || status === "active") return "badge-success";
  if (status === "waiting_validation" || status === "pending") return "badge-warning";
  if (status === "rejected" || status === "cancelled" || status === "expired") return "badge-danger";
  return "badge-info";
}

function normalizeLiftData(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.lift_recommendations)) return data.lift_recommendations;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

function getLiftId(item) {
  return item.id || item.lift_id || item.recommendation_id;
}

function getStudentName(item) {
  return item.student_name || item.name || item.full_name || "-";
}

function getStudentNim(item) {
  return item.nim || item.student_nim || "-";
}

function getMedicalReason(item) {
  return item.medical_reason || item.reason || item.diagnosis || "-";
}

function getBuilding(item) {
  return item.room || item.building || item.location || "-";
}

function renderStats(items) {
  if (totalLift) totalLift.textContent = items.length;
  if (pendingLift) pendingLift.textContent = items.filter(i => i.status === "waiting_validation" || i.status === "pending").length;
  if (activeLift) activeLift.textContent = items.filter(i => i.status === "active" || i.status === "approved").length;
  if (completedLift) completedLift.textContent = items.filter(i => i.status === "completed" || i.status === "expired").length;
}

function buildActionButtons(item) {
  const liftId = getLiftId(item);
  const status = item.status;

  if (!liftId) return `<span style="color: var(--muted);">ID tidak ada</span>`;

  const buttons = [];

  // Jika masih menunggu validasi
  if (status === "waiting_validation" || status === "pending") {
    buttons.push(`<button class="btn btn-sm btn-success" onclick="updateLiftStatus(${liftId}, 'approved')">Setujui</button>`);
    buttons.push(`<button class="btn btn-sm btn-danger" onclick="updateLiftStatus(${liftId}, 'rejected')">Tolak</button>`);
  }

  // Jika sudah disetujui, bisa diaktifkan
  if (status === "approved") {
    buttons.push(`<button class="btn btn-sm btn-info" onclick="updateLiftStatus(${liftId}, 'active')">Aktifkan</button>`);
  }

  // Jika sedang aktif, bisa diselesaikan
  if (status === "active") {
    buttons.push(`<button class="btn btn-sm btn-success" onclick="updateLiftStatus(${liftId}, 'completed')">Selesai</button>`);
  }

  // Semua yang belum selesai bisa dibatalkan
  if (status !== "completed" && status !== "cancelled" && status !== "rejected" && status !== "expired") {
    buttons.push(`<button class="btn btn-sm btn-danger" onclick="updateLiftStatus(${liftId}, 'cancelled')">Batalkan</button>`);
  }

  if (buttons.length === 0) return `<span style="color: var(--muted);">Tidak ada aksi</span>`;
  return `<div class="action-group">${buttons.join("")}</div>`;
}

function renderTable(items) {
  if (!liftTableBody || !liftTable) return;
  liftTableBody.innerHTML = "";

  if (!items || items.length === 0) {
    liftTableBody.innerHTML = `<tr><td colspan="7">Belum ada rekomendasi lift.</td></tr>`;
    liftTable.style.display = "table";
    if (tableInfo) tableInfo.textContent = "Belum ada data rekomendasi lift.";
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
      <td><span class="badge ${getStatusBadgeClass(item.status)}">${mapLiftStatus(item.status)}</span></td>
      <td>${buildActionButtons(item)}</td>
    `;
    liftTableBody.appendChild(row);
  });

  liftTable.style.display = "table";
  if (tableInfo) tableInfo.textContent = `Menampilkan ${items.length} rekomendasi lift`;
}

function applySearchFilter() {
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

  if (!keyword) {
    filteredLiftData = [...liftData];
  } else {
    filteredLiftData = liftData.filter((item) => {
      const combinedText = [
        getStudentName(item), getStudentNim(item), getMedicalReason(item), getBuilding(item), mapLiftStatus(item.status)
      ].join(" ").toLowerCase();
      return combinedText.includes(keyword);
    });
  }

  renderStats(filteredLiftData);
  renderTable(filteredLiftData);
}

// === FUNGSI MENGAMBIL DATA DARI BACKEND ===
async function loadLiftRecommendations({ silent = false } = {}) {
  hideError();
  if (!silent) setLoading(true);

  try {
    // Kita arahkan ke /lift-recommendations/ (rute root yang baru dibuat)
    const result = await apiRequest("/lift-recommendations", { method: "GET" });

    if (!result.success) throw new Error(result.message);

    liftData = normalizeLiftData(result.data);
    filteredLiftData = [...liftData];

    renderStats(filteredLiftData);
    renderTable(filteredLiftData);

    if (!silent) showSuccess("Data rekomendasi lift berhasil dimuat.");
  } catch (error) {
    liftData = [];
    filteredLiftData = [];
    renderStats([]);
    renderTable([]);
    const msg = "Belum ada data rekomendasi lift atau backend belum merespons.";
    if (tableInfo) tableInfo.textContent = msg;
    if (!silent) showError(msg);
  } finally {
    setLoading(false);
  }
}

// === FUNGSI UPDATE STATUS (Approve/Reject/Active) ===
async function updateLiftStatus(liftId, status) {
  hideError();
  const label = mapLiftStatus(status);
  
  const confirmation = await confirmAction(
    "Konfirmasi Aksi",
    `Status rekomendasi lift akan diubah menjadi "${label}". Lanjutkan?`,
    "Ya, ubah status"
  );

  if (!confirmation) return;

  try {
    const result = await apiRequest(`/lift-recommendations/${liftId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    if (!result.success) throw new Error(result.message);

    showSuccess(`Status berhasil diubah menjadi ${label}.`);
    await loadLiftRecommendations({ silent: true }); // Reload data
  } catch (error) {
    showError("Gagal mengubah status: " + error.message);
  }
}

// === FUNGSI SUBMIT FORM BUAT REKOMENDASI LIFT ===
async function handleCreateLift(event) {
  event.preventDefault();
  hideError();

  const nim = document.getElementById('liftNim').value.trim();
  const reason = document.getElementById('liftReason').value.trim();
  const condition = document.getElementById('liftCondition').value;
  const start = document.getElementById('liftStart').value;
  const end = document.getElementById('liftEnd').value;

  saveLiftBtn.disabled = true;
  saveLiftBtn.innerHTML = "Menyimpan...";

  try {
    const payload = {
      nim: nim,
      reason: reason,
      medical_condition: condition,
      start_date: start || null,
      end_date: end || null,
      status: 'approved' // Jika dibuat oleh admin, langsung otomatis disetujui
    };

    const result = await apiRequest("/lift-recommendations", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!result.success) throw new Error(result.message);

    showSuccess("Rekomendasi Lift berhasil dibuat!");
    closeLiftModalHandler();
    await loadLiftRecommendations({ silent: true }); // Reload data
  } catch (error) {
    showError("Gagal membuat rekomendasi: " + error.message);
  } finally {
    saveLiftBtn.disabled = false;
    saveLiftBtn.innerHTML = "Simpan & Aktifkan";
  }
}

// Modal Handlers
function openLiftModalHandler() {
  if (liftModal) {
    liftForm.reset();
    liftModal.style.display = "flex";
  }
}
function closeLiftModalHandler() {
  if (liftModal) liftModal.style.display = "none";
}

// Global scope agar bisa dipanggil dari HTML onclick
window.updateLiftStatus = updateLiftStatus;

// === EVENT LISTENERS ===
if (refreshButton) refreshButton.addEventListener("click", () => loadLiftRecommendations());
if (filterButton) filterButton.addEventListener("click", applySearchFilter);
if (searchInput) searchInput.addEventListener("input", applySearchFilter);

if (createLiftBtn) createLiftBtn.addEventListener("click", openLiftModalHandler);
if (closeLiftModal) closeLiftModal.addEventListener("click", closeLiftModalHandler);
if (cancelLiftModal) cancelLiftModal.addEventListener("click", closeLiftModalHandler);
if (liftForm) liftForm.addEventListener("submit", handleCreateLift);

if (logoutButton) {
  logoutButton.addEventListener("click", async function () {
    const isConfirmed = await confirmAction("Keluar?", "Anda perlu login kembali nanti.", "Ya, logout");
    if (!isConfirmed) return;
    removeToken();
    window.location.href = "./login.html";
  });
}

// Initialize Page
(async function init() {
  formatTodayDate();
  loadLiftRecommendations({ silent: true });
})();