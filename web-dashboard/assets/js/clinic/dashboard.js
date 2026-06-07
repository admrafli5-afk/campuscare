const allowedClinicRoles = [
  "clinic_staff",
  "clinic_admin",
  "supervisor",
  "super_admin",
];

const userNameElement = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");

const todayDateElement = document.getElementById("todayDate");
const todayDayElement = document.getElementById("todayDay");

const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

const clinicStatusBadge = document.getElementById("clinicStatusBadge");
const toggleClinicStatusButton = document.getElementById("toggleClinicStatusButton");
const clinicOpenTimeInput = document.getElementById("clinicOpenTime");
const clinicCloseTimeInput = document.getElementById("clinicCloseTime");
const serverTimeDisplay = document.getElementById("serverTimeDisplay");
const saveClinicStatusButton = document.getElementById("saveClinicStatusButton");
const refreshButton = document.getElementById("refreshButton");

const totalPatientsToday = document.getElementById("totalPatientsToday");
const waitingQueues = document.getElementById("waitingQueues");
const checkedIn = document.getElementById("checkedIn");
const emergencyCases = document.getElementById("emergencyCases");
const healthChecksToday = document.getElementById("healthChecksToday");
const sickLettersToday = document.getElementById("sickLettersToday");
const waitingLetters = document.getElementById("waitingLetters");
const approvedLetters = document.getElementById("approvedLetters");

const recentQueueList = document.getElementById("recentQueueList");
const recentEmergencyList = document.getElementById("recentEmergencyList");

let currentUser = null;
let dashboardInterval = null;
let latestClinicStatus = null;

function showError(message) {
  if (!errorMessage) return;

  errorMessage.style.display = "block";
  errorMessage.textContent = message;

  if (successMessage) {
    successMessage.style.display = "none";
  }
}

function showSuccess(message) {
  if (!successMessage) return;

  successMessage.style.display = "inline-block";
  successMessage.textContent = message;

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

    return true;
  } catch (error) {
    removeToken();
    window.location.href = "./login.html";
    return false;
  }
}

function setText(element, value) {
  if (element) {
    element.textContent = value ?? 0;
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

function renderClinicStatus(status) {
  if (!status) return;

  latestClinicStatus = status;

  if (todayDateElement) {
    todayDateElement.textContent = status.local_date || "Hari Ini";
  }

  if (todayDayElement) {
    todayDayElement.textContent = status.local_day || "CampusCare";
  }

  if (serverTimeDisplay) {
    serverTimeDisplay.value = status.local_time || "-";
  }

  if (clinicOpenTimeInput) {
    clinicOpenTimeInput.value = status.open_time || "08:00";
  }

  if (clinicCloseTimeInput) {
    clinicCloseTimeInput.value = status.close_time || "16:00";
  }

  if (clinicStatusBadge) {
    clinicStatusBadge.classList.remove("open", "closed");
    clinicStatusBadge.classList.add(status.is_open ? "open" : "closed");

    clinicStatusBadge.innerHTML = `
      <i class="fa-solid fa-circle"></i>
      ${status.is_open ? "Klinik Buka" : "Klinik Tutup"}
      (${status.open_time || "08:00"} - ${status.close_time || "16:00"})
    `;
  }

  if (toggleClinicStatusButton) {
    toggleClinicStatusButton.classList.remove("toggle-open", "toggle-closed");

    if (status.is_open) {
      toggleClinicStatusButton.classList.add("toggle-closed");
      toggleClinicStatusButton.innerHTML = `
        <i class="fa-solid fa-power-off"></i>
        Tutup Klinik
      `;
    } else {
      toggleClinicStatusButton.classList.add("toggle-open");
      toggleClinicStatusButton.innerHTML = `
        <i class="fa-solid fa-power-off"></i>
        Buka Klinik
      `;
    }
  }
}

function renderStats(stats) {
  setText(totalPatientsToday, stats.total_patients_today || 0);
  setText(waitingQueues, stats.waiting_queues || 0);
  setText(checkedIn, stats.checked_in || 0);
  setText(emergencyCases, stats.total_emergency_today || 0);
  setText(healthChecksToday, stats.total_health_checks_today || 0);
  setText(sickLettersToday, stats.total_sick_letters_today || 0);
  setText(waitingLetters, stats.waiting_sick_letters || 0);
  setText(approvedLetters, stats.approved_sick_letters || 0);
}

function renderRecentQueues(items) {
  if (!recentQueueList) return;

  recentQueueList.innerHTML = "";

  if (!items || items.length === 0) {
    recentQueueList.innerHTML = `
      <p style="color: var(--muted);">Belum ada aktivitas antrean hari ini.</p>
    `;
    return;
  }

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "activity-item";

    div.innerHTML = `
      <div class="activity-dot"></div>
      <div>
        <div class="activity-title">
          ${item.queue_number || "-"} - ${item.student_name || "Tanpa Nama"}
        </div>
        <div class="activity-text">
          NIM: ${item.nim || "-"} • Status: ${mapQueueStatus(item.status)}
        </div>
        <div class="activity-time">
          ${formatTime(item.created_at)}
        </div>
      </div>
    `;

    recentQueueList.appendChild(div);
  });
}

function renderRecentEmergencies(items) {
  if (!recentEmergencyList) return;

  recentEmergencyList.innerHTML = "";

  if (!items || items.length === 0) {
    recentEmergencyList.innerHTML = `
      <p style="color: var(--muted);">Belum ada emergency hari ini.</p>
    `;
    return;
  }

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "activity-item";

    const name =
      item.student_name ||
      item.temporary_patient_name ||
      "Pasien Darurat Sementara";

    div.innerHTML = `
      <div class="activity-dot red"></div>
      <div>
        <div class="activity-title">
          ${name}
        </div>
        <div class="activity-text">
          ${item.condition_type || "-"} • ${item.location || "-"} • ${mapEmergencyStatus(item.status)}
        </div>
        <div class="activity-time">
          ${formatTime(item.created_at)}
        </div>
      </div>
    `;

    recentEmergencyList.appendChild(div);
  });
}

async function loadDashboard({ silent = false } = {}) {
  if (!silent) {
    hideMessages();
  }

  try {
    const result = await apiRequest("/dashboard/clinic", {
      method: "GET",
    });

    if (!result.success) {
      showError(result.message || "Gagal memuat dashboard klinik.");
      return;
    }

    const data = result.data || {};

    renderClinicStatus(data.clinic_status);
    renderStats(data.stats || {});
    renderRecentQueues(data.recent?.queues || []);
    renderRecentEmergencies(data.recent?.emergencies || []);
  } catch (error) {
    showError("Tidak dapat memuat dashboard. Pastikan backend berjalan.");
  }
}

async function saveClinicStatus() {
  hideMessages();

  const payload = {
    is_open: latestClinicStatus ? latestClinicStatus.is_open : true,
    open_time: clinicOpenTimeInput.value || "08:00",
    close_time: clinicCloseTimeInput.value || "16:00",
  };

  saveClinicStatusButton.disabled = true;
  saveClinicStatusButton.textContent = "Menyimpan...";

  try {
    const result = await apiRequest("/dashboard/clinic/status", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (!result.success) {
      showError(result.message || "Gagal menyimpan jam operasional klinik.");
      return;
    }

    showSuccess("Jam operasional klinik berhasil disimpan.");
    await loadDashboard({ silent: true });
  } catch (error) {
    showError("Tidak dapat menyimpan jam operasional klinik.");
  } finally {
    saveClinicStatusButton.disabled = false;
    saveClinicStatusButton.innerHTML = `
      <i class="fa-solid fa-floppy-disk"></i>
      Simpan Jam Operasional
    `;
  }
}

async function toggleClinicStatus() {
  hideMessages();

  if (!latestClinicStatus) {
    showError("Status klinik belum dimuat.");
    return;
  }

  const nextStatus = !latestClinicStatus.is_open;

  const payload = {
    is_open: nextStatus,
    open_time: clinicOpenTimeInput.value || "08:00",
    close_time: clinicCloseTimeInput.value || "16:00",
  };

  toggleClinicStatusButton.disabled = true;
  toggleClinicStatusButton.textContent = "Memproses...";

  try {
    const result = await apiRequest("/dashboard/clinic/status", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (!result.success) {
      showError(result.message || "Gagal mengubah status klinik.");
      return;
    }

    showSuccess(nextStatus ? "Klinik berhasil dibuka." : "Klinik berhasil ditutup.");
    await loadDashboard({ silent: true });
  } catch (error) {
    showError("Tidak dapat mengubah status klinik.");
  } finally {
    toggleClinicStatusButton.disabled = false;
  }
}

if (logoutButton) {
  logoutButton.addEventListener("click", function () {
    removeToken();
    window.location.href = "./login.html";
  });
}

if (refreshButton) {
  refreshButton.addEventListener("click", function () {
    loadDashboard();
  });
}

if (saveClinicStatusButton) {
  saveClinicStatusButton.addEventListener("click", saveClinicStatus);
}

if (toggleClinicStatusButton) {
  toggleClinicStatusButton.addEventListener("click", toggleClinicStatus);
}

(async function initDashboardPage() {
  const isAllowed = await protectClinicPage();

  if (isAllowed) {
    await loadDashboard();

    dashboardInterval = setInterval(() => {
      loadDashboard({ silent: true });
    }, 10000);
  }
})();

window.addEventListener("beforeunload", function () {
  if (dashboardInterval) {
    clearInterval(dashboardInterval);
  }
});