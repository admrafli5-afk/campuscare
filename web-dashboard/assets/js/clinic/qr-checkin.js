const allowedClinicRoles = [
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "super_admin",
  ];
  
  const userNameElement = document.getElementById("userName");
  const logoutButton = document.getElementById("logoutButton");
  
  const qrTokenInput = document.getElementById("qrTokenInput");
  const checkInButton = document.getElementById("checkInButton");
  const errorMessage = document.getElementById("errorMessage");
  
  const resultCard = document.getElementById("resultCard");
  const resultQueueNumber = document.getElementById("resultQueueNumber");
  const resultName = document.getElementById("resultName");
  const resultNim = document.getElementById("resultNim");
  const resultComplaint = document.getElementById("resultComplaint");
  const resultStatus = document.getElementById("resultStatus");
  
  function showError(message) {
    errorMessage.style.display = "block";
    errorMessage.textContent = message;
  }
  
  function hideError() {
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
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
  
  function normalizeQueueResult(data) {
    if (!data) return {};
  
    if (data.queue) return data.queue;
    if (data.data && data.data.queue) return data.data.queue;
  
    return data;
  }
  
  function renderCheckInResult(data) {
    const queue = normalizeQueueResult(data);
  
    resultQueueNumber.textContent =
      queue.queue_number || queue.queueNumber || "-";
  
    resultName.textContent =
      queue.student_name || queue.studentName || queue.name || "-";
  
    resultNim.textContent =
      queue.nim || "-";
  
    resultComplaint.textContent =
      queue.complaint || queue.symptoms || queue.chief_complaint || "-";
  
    resultStatus.textContent =
      mapQueueStatus(queue.status);
  
    resultCard.style.display = "block";
  }
  
  async function handleCheckIn() {
    hideError();
  
    const qrToken = qrTokenInput.value.trim();
  
    if (!qrToken) {
      showError("QR token wajib diisi.");
      return;
    }
  
    checkInButton.disabled = true;
    checkInButton.textContent = "Memproses...";
  
    try {
      const result = await apiRequest("/queue/check-in", {
        method: "POST",
        body: JSON.stringify({
          qr_token: qrToken,
        }),
      });
  
      if (!result.success) {
        showError(result.message || "QR token tidak valid.");
        return;
      }
  
      renderCheckInResult(result.data);
  
      qrTokenInput.value = "";
      qrTokenInput.focus();
    } catch (error) {
      showError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      checkInButton.disabled = false;
      checkInButton.textContent = "Check-in Pasien";
    }
  }
  
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      removeToken();
      window.location.href = "./login.html";
    });
  }
  
  if (checkInButton) {
    checkInButton.addEventListener("click", handleCheckIn);
  }
  
  if (qrTokenInput) {
    qrTokenInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleCheckIn();
      }
    });
  }
  
  (async function initQrCheckInPage() {
    const isAllowed = await protectClinicPage();
  
    if (isAllowed && qrTokenInput) {
      qrTokenInput.focus();
    }
  })();