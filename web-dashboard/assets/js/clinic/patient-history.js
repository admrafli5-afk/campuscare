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
const historyTable = document.getElementById("historyTable");
const historyTableBody = document.getElementById("historyTableBody");
const tableInfo = document.getElementById("tableInfo");

const totalHistory = document.getElementById("totalHistory");
const todayHistory = document.getElementById("todayHistory");
const checkupHistory = document.getElementById("checkupHistory");
const letterHistory = document.getElementById("letterHistory");

let historyData = [];
let filteredHistoryData = [];

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

function setLoading(isLoading) {
  if (!loadingState || !historyTable) return;

  loadingState.style.display = isLoading ? "block" : "none";
  historyTable.style.display = isLoading ? "none" : "table";
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

function isToday(value) {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function mapHistoryStatus(status) {
  const statuses = {
    waiting: "Menunggu",
    called: "Dipanggil",
    on_the_way: "Menuju Klinik",
    checked_in: "Hadir",
    in_checkup: "Sedang Diperiksa",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    health_check: "Pemeriksaan",
    sick_letter: "Surat Sakit",
  };

  return statuses[status] || status || "-";
}

function getStatusBadgeClass(status) {
  if (
    status === "completed" ||
    status === "health_check" ||
    status === "sick_letter"
  ) {
    return "badge-success";
  }

  if (status === "checked_in" || status === "in_checkup") {
    return "badge-info";
  }

  if (status === "waiting") {
    return "badge-warning";
  }

  if (status === "cancelled") {
    return "badge-danger";
  }

  return "badge-info";
}

function normalizeHistoryData(data) {
  if (Array.isArray(data)) return data;

  if (data && Array.isArray(data.histories)) return data.histories;
  if (data && Array.isArray(data.history)) return data.history;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.health_checks)) return data.health_checks;
  if (data && Array.isArray(data.healthChecks)) return data.healthChecks;
  if (data && Array.isArray(data.checks)) return data.checks;

  return [];
}

function getStudentName(item) {
  return (
    item.student_name ||
    item.studentName ||
    item.name ||
    item.full_name ||
    item.fullName ||
    item.student?.name ||
    item.student?.full_name ||
    "-"
  );
}

function getStudentNim(item) {
  return (
    item.nim ||
    item.student_nim ||
    item.studentNim ||
    item.student?.nim ||
    "-"
  );
}

function getComplaint(item) {
  return (
    item.complaint ||
    item.chief_complaint ||
    item.chiefComplaint ||
    item.symptoms ||
    item.queue?.complaint ||
    "-"
  );
}

function getDiagnosisOrNotes(item) {
  return (
    item.diagnosis ||
    item.notes ||
    item.medical_notes ||
    item.medicalNotes ||
    item.summary ||
    "-"
  );
}

function getActionTaken(item) {
  return (
    item.action_taken ||
    item.actionTaken ||
    item.treatment ||
    item.recommendation ||
    item.plan ||
    "-"
  );
}

function getHistoryDate(item) {
  return (
    item.created_at ||
    item.createdAt ||
    item.checkup_date ||
    item.checkupDate ||
    item.date ||
    item.updated_at ||
    item.updatedAt
  );
}

function normalizeItemType(item) {
  if (item.type) return item.type;
  if (item.status === "sick_letter" || item.letter_id || item.sick_letter_id) {
    return "sick_letter";
  }
  return "health_check";
}

function renderStats(items) {
  if (totalHistory) {
    totalHistory.textContent = items.length;
  }

  if (todayHistory) {
    todayHistory.textContent = items.filter((item) => {
      return isToday(getHistoryDate(item));
    }).length;
  }

  if (checkupHistory) {
    checkupHistory.textContent = items.filter((item) => {
      return (
        normalizeItemType(item) === "health_check" ||
        item.status === "health_check" ||
        item.chief_complaint ||
        item.chiefComplaint
      );
    }).length;
  }

  if (letterHistory) {
    letterHistory.textContent = items.filter((item) => {
      return (
        normalizeItemType(item) === "sick_letter" ||
        item.status === "sick_letter" ||
        item.letter_id ||
        item.sick_letter_id
      );
    }).length;
  }
}

function renderTable(items) {
  if (!historyTableBody || !historyTable) return;

  historyTableBody.innerHTML = "";

  if (!items || items.length === 0) {
    historyTableBody.innerHTML = `
      <tr>
        <td colspan="7">Belum ada data riwayat pasien.</td>
      </tr>
    `;

    historyTable.style.display = "table";

    if (tableInfo) {
      tableInfo.textContent = "Menampilkan 0 riwayat pasien";
    }

    return;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");
    const type = normalizeItemType(item);
    const status = item.status || type || "health_check";

    row.innerHTML = `
      <td>${formatDate(getHistoryDate(item))}</td>
      <td>${getStudentName(item)}</td>
      <td>${getStudentNim(item)}</td>
      <td>${getComplaint(item)}</td>
      <td>${getDiagnosisOrNotes(item)}</td>
      <td>${getActionTaken(item)}</td>
      <td>
        <span class="badge ${getStatusBadgeClass(status)}">
          ${mapHistoryStatus(status)}
        </span>
      </td>
    `;

    historyTableBody.appendChild(row);
  });

  historyTable.style.display = "table";

  if (tableInfo) {
    tableInfo.textContent = `Menampilkan ${items.length} riwayat pasien`;
  }
}

function applySearchFilter() {
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

  if (!keyword) {
    filteredHistoryData = [...historyData];
  } else {
    filteredHistoryData = historyData.filter((item) => {
      const combinedText = [
        getStudentName(item),
        getStudentNim(item),
        getComplaint(item),
        getDiagnosisOrNotes(item),
        getActionTaken(item),
        mapHistoryStatus(item.status || normalizeItemType(item)),
      ]
        .join(" ")
        .toLowerCase();

      return combinedText.includes(keyword);
    });
  }

  renderStats(filteredHistoryData);
  renderTable(filteredHistoryData);
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

async function loadFromEndpoint(endpoint) {
  try {
    const result = await apiRequest(endpoint, {
      method: "GET",
    });

    if (result && result.success) {
      return result;
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function loadPatientHistory() {
  hideError();
  setLoading(true);

  try {
    let result = null;

    result = await loadFromEndpoint("/health-checks/history");

    if (!result) {
      result = await loadFromEndpoint("/health-checks");
    }

    if (!result) {
      result = await loadFromEndpoint("/patient-history");
    }

    if (!result) {
      result = await loadFromEndpoint("/medical-history");
    }

    if (!result) {
      historyData = [];
      filteredHistoryData = [];

      showError(
        "Data riwayat pasien belum tersedia. Pastikan backend memiliki endpoint GET /health-checks atau GET /health-checks/history."
      );

      renderStats([]);
      renderTable([]);
      return;
    }

    historyData = normalizeHistoryData(result.data);
    filteredHistoryData = [...historyData];

    renderStats(filteredHistoryData);
    renderTable(filteredHistoryData);
  } catch (error) {
    historyData = [];
    filteredHistoryData = [];

    showError(
      "Tidak dapat memuat riwayat pasien. Pastikan backend berjalan."
    );

    renderStats([]);
    renderTable([]);
  } finally {
    setLoading(false);
  }
}

if (logoutButton) {
  logoutButton.addEventListener("click", function () {
    removeToken();
    window.location.href = "./login.html";
  });
}

if (refreshButton) {
  refreshButton.addEventListener("click", loadPatientHistory);
}

if (filterButton) {
  filterButton.addEventListener("click", applySearchFilter);
}

if (searchInput) {
  searchInput.addEventListener("input", applySearchFilter);
}

(async function initPatientHistoryPage() {
  formatTodayDate();

  const isAllowed = await protectClinicPage();

  if (isAllowed) {
    loadPatientHistory();
  }
})();