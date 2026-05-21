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
  
  function setLoading(isLoading) {
    if (!loadingState || !emergencyTable) return;
  
    loadingState.style.display = isLoading ? "block" : "none";
    emergencyTable.style.display = isLoading ? "none" : "table";
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
    };
  
    return priorities[priority] || priority || "-";
  }
  
  function mapEmergencyStatus(status) {
    const statuses = {
      reported: "Dilaporkan",
      waiting: "Menunggu",
      handling: "Ditangani",
      referred: "Dirujuk",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
  
    return statuses[status] || status || "-";
  }
  
  function getPriorityBadgeClass(priority) {
    if (priority === "critical" || priority === "high") {
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
  
    if (status === "handling" || status === "referred") {
      return "badge-info";
    }
  
    if (status === "reported" || status === "waiting") {
      return "badge-warning";
    }
  
    if (status === "cancelled") {
      return "badge-danger";
    }
  
    return "badge-info";
  }
  
  function normalizeEmergencyData(data) {
    if (Array.isArray(data)) return data;
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
      item.name ||
      item.full_name ||
      "-"
    );
  }
  
  function getStudentNim(item) {
    return item.nim || item.student_nim || "-";
  }
  
  function getEmergencyLocation(item) {
    return item.location || item.room || item.building || "-";
  }
  
  function getEmergencyDescription(item) {
    return item.description || item.complaint || item.notes || "-";
  }
  
  function renderStats(items) {
    if (totalEmergency) {
      totalEmergency.textContent = items.length;
    }
  
    if (highPriorityEmergency) {
      highPriorityEmergency.textContent = items.filter((item) => {
        return item.priority === "high" || item.priority === "critical";
      }).length;
    }
  
    if (handlingEmergency) {
      handlingEmergency.textContent = items.filter((item) => {
        return item.status === "handling" || item.status === "referred";
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
  
    if (status === "reported" || status === "waiting") {
      buttons.push(`
        <button class="btn btn-sm btn-info" onclick="updateEmergencyStatus(${emergencyId}, 'handling')">
          Tangani
        </button>
      `);
    }
  
    if (status === "handling") {
      buttons.push(`
        <button class="btn btn-sm btn-warning" onclick="updateEmergencyStatus(${emergencyId}, 'referred')">
          Rujuk
        </button>
      `);
  
      buttons.push(`
        <button class="btn btn-sm btn-success" onclick="updateEmergencyStatus(${emergencyId}, 'completed')">
          Selesai
        </button>
      `);
    }
  
    if (status !== "completed" && status !== "cancelled") {
      buttons.push(`
        <button class="btn btn-sm btn-danger" onclick="updateEmergencyStatus(${emergencyId}, 'cancelled')">
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
    if (!emergencyTableBody || !emergencyTable) return;
  
    emergencyTableBody.innerHTML = "";
  
    if (!items || items.length === 0) {
      emergencyTableBody.innerHTML = `
        <tr>
          <td colspan="8">Belum ada laporan emergency hari ini.</td>
        </tr>
      `;
  
      emergencyTable.style.display = "table";
  
      if (tableInfo) {
        tableInfo.textContent =
          "Belum ada data emergency atau endpoint backend belum tersedia.";
      }
  
      return;
    }
  
    items.forEach((item) => {
      const row = document.createElement("tr");
  
      row.innerHTML = `
        <td>${formatTime(item.created_at || item.createdAt || item.time)}</td>
        <td>${getStudentName(item)}</td>
        <td>${getStudentNim(item)}</td>
        <td>${getEmergencyLocation(item)}</td>
        <td>${getEmergencyDescription(item)}</td>
        <td>
          <span class="badge ${getPriorityBadgeClass(item.priority)}">
            ${mapPriority(item.priority)}
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
  
    if (tableInfo) {
      tableInfo.textContent = `Menampilkan ${items.length} data emergency`;
    }
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
          mapPriority(item.priority),
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
      const result = await apiRequest("/emergency/today", {
        method: "GET",
      });
  
      if (!result.success) {
        emergencyData = [];
        filteredEmergencyData = [];
  
        hideError();
        renderStats([]);
        renderTable([]);
  
        if (tableInfo) {
          tableInfo.textContent =
            "Belum ada data emergency atau endpoint backend belum tersedia.";
        }
  
        return;
      }
  
      emergencyData = normalizeEmergencyData(result.data);
      filteredEmergencyData = [...emergencyData];
  
      renderStats(filteredEmergencyData);
      renderTable(filteredEmergencyData);
    } catch (error) {
      emergencyData = [];
      filteredEmergencyData = [];
  
      hideError();
      renderStats([]);
      renderTable([]);
  
      if (tableInfo) {
        tableInfo.textContent =
          "Belum ada data emergency atau endpoint backend belum tersedia.";
      }
    } finally {
      setLoading(false);
    }
  }
  
  async function updateEmergencyStatus(emergencyId, status) {
    hideError();
  
    const confirmation = confirm(
      `Ubah status emergency menjadi "${mapEmergencyStatus(status)}"?`
    );
  
    if (!confirmation) {
      return;
    }
  
    try {
      const result = await apiRequest(`/emergency/${emergencyId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
        }),
      });
  
      if (!result.success) {
        showError(
          result.message ||
            "Endpoint update status emergency belum tersedia dari backend."
        );
        return;
      }
  
      await loadEmergencyData();
    } catch (error) {
      showError(
        "Tidak dapat mengubah status emergency. Pastikan endpoint backend tersedia."
      );
    }
  }
  
  window.updateEmergencyStatus = updateEmergencyStatus;
  
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
  
  (async function initEmergencyPage() {
    formatTodayDate();
  
    const isAllowed = await protectClinicPage();
  
    if (isAllowed) {
      loadEmergencyData();
    }
  })();