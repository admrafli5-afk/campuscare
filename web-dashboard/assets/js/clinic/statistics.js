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
const statisticsTable = document.getElementById("statisticsTable");
const statisticsTableBody = document.getElementById("statisticsTableBody");
const tableInfo = document.getElementById("tableInfo");

const totalVisits = document.getElementById("totalVisits");
const averageQueueTime = document.getElementById("averageQueueTime");
const totalSickLetters = document.getElementById("totalSickLetters");
const completedCheckups = document.getElementById("completedCheckups");

let statisticsData = [];
let filteredStatisticsData = [];

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
  if (!loadingState || !statisticsTable) return;
  loadingState.style.display = isLoading ? "block" : "none";
  statisticsTable.style.display = isLoading ? "none" : "table";
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

function mapStatisticStatus(status) {
  const statuses = {
    normal: "Normal",
    good: "Baik",
    warning: "Perlu Perhatian",
    danger: "Tinggi",
    empty: "Belum Ada Data",
  };

  return statuses[status] || status || "-";
}

function getStatusBadgeClass(status) {
  if (status === "good" || status === "normal") return "badge-success";
  if (status === "warning") return "badge-warning";
  if (status === "danger") return "badge-danger";
  return "badge-info";
}

function getCategory(item) {
  return item.category || item.name || item.label || "-";
}

function getValue(item) {
  return item.value ?? item.count ?? item.total ?? 0;
}

function getDescription(item) {
  return item.description || item.notes || item.caption || "-";
}

function getStatus(item) {
  return item.status || "normal";
}

function getNumberFromElement(element) {
  if (!element) return 0;

  const rawValue = String(element.textContent || "0").replace(/[^\d.-]/g, "");
  const value = Number(rawValue);

  return Number.isFinite(value) ? value : 0;
}

function getNumber(value) {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function buildFallbackStatistics() {
  return [
    {
      category: "Total Antrean Hari Ini",
      value: 0,
      description: "Jumlah antrean klinik yang terdaftar hari ini.",
      status: "empty",
    },
    {
      category: "Antrean Aktif",
      value: 0,
      description: "Jumlah antrean yang masih aktif atau belum selesai.",
      status: "empty",
    },
    {
      category: "Pemeriksaan Hari Ini",
      value: 0,
      description: "Jumlah pemeriksaan awal yang tersimpan hari ini.",
      status: "empty",
    },
    {
      category: "Surat Sakit Hari Ini",
      value: 0,
      description: "Jumlah surat sakit yang dibuat hari ini.",
      status: "empty",
    },
    {
      category: "Emergency Hari Ini",
      value: 0,
      description: "Jumlah kasus emergency yang tercatat hari ini.",
      status: "empty",
    },
    {
      category: "Total Mahasiswa",
      value: 0,
      description: "Jumlah mahasiswa yang terdaftar pada sistem.",
      status: "empty",
    },
  ];
}

function buildStatisticsRowsFromAnalytics(data) {
  return [
    {
      category: "Total Antrean Hari Ini",
      value: getNumber(data.queue_today),
      description: "Jumlah antrean klinik yang terdaftar hari ini.",
      status: getNumber(data.queue_today) > 0 ? "normal" : "empty",
    },
    {
      category: "Antrean Aktif",
      value: getNumber(data.active_queue_today),
      description: "Jumlah antrean yang masih aktif atau belum selesai.",
      status: getNumber(data.active_queue_today) > 0 ? "warning" : "good",
    },
    {
      category: "Pemeriksaan Hari Ini",
      value: getNumber(data.health_checks_today),
      description: "Jumlah pemeriksaan awal yang tersimpan hari ini.",
      status: getNumber(data.health_checks_today) > 0 ? "good" : "empty",
    },
    {
      category: "Total Surat Sakit",
      value: getNumber(data.sick_letters_total),
      description: "Total seluruh surat sakit yang sudah tercatat.",
      status: getNumber(data.sick_letters_total) > 0 ? "normal" : "empty",
    },
    {
      category: "Surat Sakit Hari Ini",
      value: getNumber(data.sick_letters_today),
      description: "Jumlah surat sakit yang dibuat hari ini.",
      status: getNumber(data.sick_letters_today) > 0 ? "normal" : "empty",
    },
    {
      category: "Emergency Hari Ini",
      value: getNumber(data.emergency_today),
      description: "Jumlah kasus emergency yang tercatat hari ini.",
      status: getNumber(data.emergency_today) > 0 ? "danger" : "good",
    },
    {
      category: "Total Mahasiswa",
      value: getNumber(data.students_total),
      description: "Jumlah mahasiswa yang terdaftar pada sistem.",
      status: getNumber(data.students_total) > 0 ? "good" : "empty",
    },
  ];
}

function renderCardsFromAnalytics(data) {
  if (totalVisits) {
    totalVisits.textContent = getNumber(data.queue_today);
  }

  if (averageQueueTime) {
    averageQueueTime.textContent = getNumber(data.active_queue_today);
  }

  if (totalSickLetters) {
    totalSickLetters.textContent = getNumber(data.sick_letters_today);
  }

  if (completedCheckups) {
    completedCheckups.textContent = getNumber(data.health_checks_today);
  }
}

function renderCardsFromRows(items) {
  const queueTodayRow = items.find((item) =>
    getCategory(item).toLowerCase().includes("total antrean")
  );

  const activeQueueRow = items.find((item) =>
    getCategory(item).toLowerCase().includes("aktif")
  );

  const sickLetterRow = items.find((item) =>
    getCategory(item).toLowerCase().includes("surat sakit hari ini")
  );

  const healthCheckRow = items.find((item) =>
    getCategory(item).toLowerCase().includes("pemeriksaan")
  );

  if (totalVisits) totalVisits.textContent = queueTodayRow ? getValue(queueTodayRow) : 0;
  if (averageQueueTime) averageQueueTime.textContent = activeQueueRow ? getValue(activeQueueRow) : 0;
  if (totalSickLetters) totalSickLetters.textContent = sickLetterRow ? getValue(sickLetterRow) : 0;
  if (completedCheckups) completedCheckups.textContent = healthCheckRow ? getValue(healthCheckRow) : 0;
}

function updateStatisticsGraph() {
  const visits = getNumberFromElement(totalVisits);
  const queue = getNumberFromElement(averageQueueTime);
  const letters = getNumberFromElement(totalSickLetters);
  const completed = getNumberFromElement(completedCheckups);

  const values = [visits, queue, letters, completed];
  const maxValue = Math.max(...values, 1);

  const heights = values.map((value) => {
    if (value <= 0) return 14;

    const percent = (value / maxValue) * 100;
    return Math.min(Math.max(percent, 18), 100);
  });

  const barElements = [
    document.getElementById("barVisits"),
    document.getElementById("barQueue"),
    document.getElementById("barLetters"),
    document.getElementById("barCompleted"),
  ];

  const valueElements = [
    document.getElementById("barValueVisits"),
    document.getElementById("barValueQueue"),
    document.getElementById("barValueLetters"),
    document.getElementById("barValueCompleted"),
  ];

  barElements.forEach((bar, index) => {
    if (!bar) return;
    bar.style.height = `${heights[index]}%`;
  });

  valueElements.forEach((element, index) => {
    if (!element) return;
    element.textContent = values[index];
  });

  const xPoints = [80, 240, 400, 560];
  const yPoints = heights.map((height) => 215 - (height / 100) * 145);

  const linePoints = xPoints
    .map((xPoint, index) => `${xPoint},${yPoints[index]}`)
    .join(" ");

  const line = document.getElementById("statisticsTrendLine");
  if (line) line.setAttribute("points", linePoints);

  const trendPoints = [
    document.getElementById("trendPoint1"),
    document.getElementById("trendPoint2"),
    document.getElementById("trendPoint3"),
    document.getElementById("trendPoint4"),
  ];

  trendPoints.forEach((point, index) => {
    if (!point) return;
    point.setAttribute("cx", xPoints[index]);
    point.setAttribute("cy", yPoints[index]);
  });
}

function renderTable(items) {
  if (!statisticsTableBody || !statisticsTable) return;

  statisticsTableBody.innerHTML = "";

  if (!items || items.length === 0) {
    statisticsTableBody.innerHTML = `
      <tr>
        <td colspan="4">Belum ada data statistik.</td>
      </tr>
    `;

    statisticsTable.style.display = "table";

    if (tableInfo) {
      tableInfo.textContent = "Belum ada data statistik.";
    }

    return;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");
    const status = getStatus(item);

    row.innerHTML = `
      <td>${getCategory(item)}</td>
      <td>${getValue(item)}</td>
      <td>${getDescription(item)}</td>
      <td>
        <span class="badge ${getStatusBadgeClass(status)}">
          ${mapStatisticStatus(status)}
        </span>
      </td>
    `;

    statisticsTableBody.appendChild(row);
  });

  statisticsTable.style.display = "table";

  if (tableInfo) {
    tableInfo.textContent = `Menampilkan ${items.length} data statistik`;
  }
}

function applySearchFilter() {
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

  if (!keyword) {
    filteredStatisticsData = [...statisticsData];
  } else {
    filteredStatisticsData = statisticsData.filter((item) => {
      const combinedText = [
        getCategory(item),
        getValue(item),
        getDescription(item),
        mapStatisticStatus(getStatus(item)),
      ]
        .join(" ")
        .toLowerCase();

      return combinedText.includes(keyword);
    });
  }

  renderCardsFromRows(filteredStatisticsData);
  renderTable(filteredStatisticsData);
  updateStatisticsGraph();
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

async function loadStatistics() {
  hideError();
  setLoading(true);

  try {
    const result = await apiRequest("/analytics/dashboard", {
      method: "GET",
    });

    if (!result.success) {
      statisticsData = buildFallbackStatistics();
      filteredStatisticsData = [...statisticsData];

      renderCardsFromRows(filteredStatisticsData);
      renderTable(filteredStatisticsData);
      updateStatisticsGraph();

      if (tableInfo) {
        tableInfo.textContent =
          "Belum ada data statistik atau data analytics belum tersedia.";
      }

      return;
    }

    const rawData = result.data || {};

    statisticsData = buildStatisticsRowsFromAnalytics(rawData);
    filteredStatisticsData = [...statisticsData];

    renderCardsFromAnalytics(rawData);
    renderTable(filteredStatisticsData);
    updateStatisticsGraph();
  } catch (error) {
    statisticsData = buildFallbackStatistics();
    filteredStatisticsData = [...statisticsData];

    hideError();
    renderCardsFromRows(filteredStatisticsData);
    renderTable(filteredStatisticsData);
    updateStatisticsGraph();

    if (tableInfo) {
      tableInfo.textContent =
        "Tidak dapat memuat analytics dashboard. Pastikan backend berjalan.";
    }
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
  refreshButton.addEventListener("click", loadStatistics);
}

if (filterButton) {
  filterButton.addEventListener("click", applySearchFilter);
}

if (searchInput) {
  searchInput.addEventListener("input", applySearchFilter);
}

(async function initStatisticsPage() {
  formatTodayDate();
  updateStatisticsGraph();

  const isAllowed = await protectClinicPage();

  if (isAllowed) {
    loadStatistics();
  }
})();
