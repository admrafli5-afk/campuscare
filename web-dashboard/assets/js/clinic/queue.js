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

let currentQueues = [];

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

function getQueueId(queue) {
  return queue.id || queue.queue_id || queue.queueId;
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

function buildActionButtons(queue) {
  const queueId = getQueueId(queue);
  const status = queue.status;

  if (!queueId) {
    return `<span style="color: var(--text-gray);">ID tidak ada</span>`;
  }

  const buttons = [];

  if (status === "waiting") {
    buttons.push(`
      <button class="btn btn-sm btn-info" onclick="updateQueueStatus(${queueId}, 'called')">
        Panggil
      </button>
    `);
  }

  if (status === "waiting" || status === "called" || status === "on_the_way") {
    buttons.push(`
      <button class="btn btn-sm btn-success" onclick="updateQueueStatus(${queueId}, 'checked_in')">
        Hadir
      </button>
    `);
  }

  if (status === "checked_in") {
    buttons.push(`
      <button class="btn btn-sm btn-warning" onclick="updateQueueStatus(${queueId}, 'in_checkup')">
        Mulai Pemeriksaan
      </button>
    `);
  }

  if (status === "in_checkup") {
    buttons.push(`
      <button class="btn btn-sm btn-success" onclick="updateQueueStatus(${queueId}, 'completed')">
        Selesai
      </button>
    `);
  }

  if (
    status !== "completed" &&
    status !== "cancelled" &&
    status !== "missed"
  ) {
    buttons.push(`
      <button class="btn btn-sm btn-danger" onclick="updateQueueStatus(${queueId}, 'cancelled')">
        Batalkan
      </button>
    `);
  }

  if (buttons.length === 0) {
    return `<span style="color: var(--text-gray);">Tidak ada aksi</span>`;
  }

  return `<div class="action-group">${buttons.join("")}</div>`;
}

function renderQueueTable(queues) {
  queueTableBody.innerHTML = "";

  if (!queues || queues.length === 0) {
    queueTableBody.innerHTML = `
      <tr>
        <td colspan="7">Belum ada antrean hari ini.</td>
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
      <td>
        ${buildActionButtons(queue)}
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
    currentQueues = queues;

    renderQueueStats(queues);
    renderQueueTable(queues);
  } catch (error) {
    showError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
  } finally {
    loadingState.style.display = "none";
  }
}

async function updateQueueStatus(queueId, status) {
  hideError();

  const confirmation = confirm(
    `Ubah status antrean menjadi "${mapQueueStatus(status)}"?`
  );

  if (!confirmation) {
    return;
  }

  try {
    const result = await apiRequest(`/queue/${queueId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    });

    if (!result.success) {
      showError(result.message || "Gagal mengubah status antrean.");
      return;
    }

    await loadTodayQueue();
  } catch (error) {
    showError("Tidak dapat mengubah status. Pastikan backend berjalan.");
  }
}

window.updateQueueStatus = updateQueueStatus;

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