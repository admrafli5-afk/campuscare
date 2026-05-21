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
    if (status === "good" || status === "normal") {
      return "badge-success";
    }
  
    if (status === "warning") {
      return "badge-warning";
    }
  
    if (status === "danger") {
      return "badge-danger";
    }
  
    return "badge-info";
  }
  
  function normalizeStatisticsData(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.statistics)) return data.statistics;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  }
  
  function buildFallbackStatistics() {
    return [
      {
        category: "Total Kunjungan",
        value: 0,
        description: "Jumlah kunjungan mahasiswa ke klinik pada periode ini.",
        status: "empty",
      },
      {
        category: "Rata-rata Waktu Antrean",
        value: 0,
        description: "Rata-rata estimasi waktu antrean dalam satuan menit.",
        status: "empty",
      },
      {
        category: "Surat Sakit",
        value: 0,
        description: "Jumlah surat izin sakit yang dibuat oleh klinik.",
        status: "empty",
      },
      {
        category: "Pemeriksaan Selesai",
        value: 0,
        description: "Jumlah pemeriksaan pasien yang sudah selesai.",
        status: "empty",
      },
    ];
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
  
  function renderCardsFromSummary(summary) {
    if (totalVisits) {
      totalVisits.textContent =
        summary.total_visits ??
        summary.totalVisits ??
        summary.total_patients ??
        summary.totalPatients ??
        0;
    }
  
    if (averageQueueTime) {
      averageQueueTime.textContent =
        summary.average_queue_time ??
        summary.averageQueueTime ??
        summary.avg_queue_minutes ??
        summary.avgQueueMinutes ??
        0;
    }
  
    if (totalSickLetters) {
      totalSickLetters.textContent =
        summary.total_sick_letters ??
        summary.totalSickLetters ??
        summary.sick_letters ??
        summary.sickLetters ??
        0;
    }
  
    if (completedCheckups) {
      completedCheckups.textContent =
        summary.completed_checkups ??
        summary.completedCheckups ??
        summary.completed ??
        0;
    }
  }
  
  function renderCardsFromRows(items) {
    const totalVisitRow = items.find((item) => {
      return getCategory(item).toLowerCase().includes("kunjungan");
    });
  
    const queueTimeRow = items.find((item) => {
      return getCategory(item).toLowerCase().includes("antrean");
    });
  
    const sickLetterRow = items.find((item) => {
      return getCategory(item).toLowerCase().includes("surat");
    });
  
    const completedRow = items.find((item) => {
      return getCategory(item).toLowerCase().includes("selesai");
    });
  
    if (totalVisits) {
      totalVisits.textContent = totalVisitRow ? getValue(totalVisitRow) : 0;
    }
  
    if (averageQueueTime) {
      averageQueueTime.textContent = queueTimeRow ? getValue(queueTimeRow) : 0;
    }
  
    if (totalSickLetters) {
      totalSickLetters.textContent = sickLetterRow ? getValue(sickLetterRow) : 0;
    }
  
    if (completedCheckups) {
      completedCheckups.textContent = completedRow ? getValue(completedRow) : 0;
    }
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
    const yPoints = heights.map((height) => {
      return 215 - (height / 100) * 145;
    });
  
    const linePoints = xPoints
      .map((xPoint, index) => `${xPoint},${yPoints[index]}`)
      .join(" ");
  
    const line = document.getElementById("statisticsTrendLine");
  
    if (line) {
      line.setAttribute("points", linePoints);
    }
  
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
        tableInfo.textContent =
          "Belum ada data statistik atau endpoint backend belum tersedia.";
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
  
        hideError();
        renderCardsFromRows(filteredStatisticsData);
        renderTable(filteredStatisticsData);
        updateStatisticsGraph();
  
        if (tableInfo) {
          tableInfo.textContent =
            "Belum ada data statistik atau endpoint backend belum tersedia.";
        }
  
        return;
      }
  
      const rawData = result.data || {};
      const rows = normalizeStatisticsData(rawData);
  
      statisticsData = rows.length > 0 ? rows : buildFallbackStatistics();
      filteredStatisticsData = [...statisticsData];
  
      renderCardsFromSummary(rawData);
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
          "Belum ada data statistik atau endpoint backend belum tersedia.";
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

