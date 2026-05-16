const allowedClinicRoles = [
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "super_admin",
  ];
  
  const userNameElement = document.getElementById("userName");
  const logoutButton = document.getElementById("logoutButton");
  const refreshButton = document.getElementById("refreshButton");
  
  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");
  const queueTable = document.getElementById("queueTable");
  const queueTableBody = document.getElementById("queueTableBody");
  
  const totalQueue = document.getElementById("totalQueue");
  const waitingQueue = document.getElementById("waitingQueue");
  const checkedInQueue = document.getElementById("checkedInQueue");
  const completedQueue = document.getElementById("completedQueue");
  
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
  
  function getStatusBadgeClass(status) {
    if (status === "completed") return "badge-success";
    if (status === "checked_in" || status === "in_checkup") return "badge-info";
    if (status === "waiting" || status === "called" || status === "on_the_way") return "badge-warning";
    if (status === "missed" || status === "cancelled" || status === "emergency") return "badge-danger";
  
    return "badge-info";
  }
  
  function showError(message) {
    errorState.style.display = "block";
    errorState.textContent = message;
  }
  
  function hideError() {
    errorState.style.display = "none";
    errorState.textContent = "";
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
  
  function renderQueueStats(queues) {
    totalQueue.textContent = queues.length;
    waitingQueue.textContent = queues.filter((item) => item.status === "waiting").length;
    checkedInQueue.textContent = queues.filter((item) => item.status === "checked_in").length;
    completedQueue.textContent = queues.filter((item) => item.status === "completed").length;
  }
  
  function renderQueueTable(queues) {
    queueTableBody.innerHTML = "";
  
    if (!queues || queues.length === 0) {
      queueTableBody.innerHTML = `
        <tr>
          <td colspan="6">Belum ada antrean hari ini.</td>
        </tr>
      `;
      queueTable.style.display = "table";
      return;
    }
  
    queues.forEach((queue) => {
      const row = document.createElement("tr");
  
      row.innerHTML = `
        <td>${queue.queue_number || queue.queueNumber || "-"}</td>
        <td>${queue.student_name || queue.studentName || queue.name || "-"}</td>
        <td>${queue.nim || "-"}</td>
        <td>${queue.complaint || queue.symptoms || queue.chief_complaint || "-"}</td>
        <td>${queue.estimated_minutes || queue.estimatedMinutes ? `${queue.estimated_minutes || queue.estimatedMinutes} menit` : "-"}</td>
        <td>
          <span class="badge ${getStatusBadgeClass(queue.status)}">
            ${mapQueueStatus(queue.status)}
          </span>
        </td>
      `;
  
      queueTableBody.appendChild(row);
    });
  
    queueTable.style.display = "table";
  }
  
  async function loadTodayQueue() {
    hideError();
    loadingState.style.display = "block";
    queueTable.style.display = "none";
  
    try {
      const result = await apiRequest("/queue/today", {
        method: "GET",
      });
  
      if (!result.success) {
        showError(result.message || "Gagal memuat antrean.");
        return;
      }
  
      const queues = normalizeQueueData(result.data);
  
      renderQueueStats(queues);
      renderQueueTable(queues);
    } catch (error) {
      showError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      loadingState.style.display = "none";
    }
  }
  
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      removeToken();
      window.location.href = "./login.html";
    });
  }
  
  if (refreshButton) {
    refreshButton.addEventListener("click", loadTodayQueue);
  }
  
  (async function initQueuePage() {
    const isAllowed = await protectClinicPage();
  
    if (isAllowed) {
      loadTodayQueue();
    }
  })();