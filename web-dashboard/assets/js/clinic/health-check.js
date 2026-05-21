const allowedClinicRoles = [
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "super_admin",
  ];
  
  const userNameElement = document.getElementById("userName");
  const logoutButton = document.getElementById("logoutButton");
  
  const healthCheckForm = document.getElementById("healthCheckForm");
  const queueSelect = document.getElementById("queueSelect");
  const refreshButton = document.getElementById("refreshButton");
  const saveButton = document.getElementById("saveButton");
  
  const temperatureInput = document.getElementById("temperature");
  const bloodPressureInput = document.getElementById("bloodPressure");
  const pulseInput = document.getElementById("pulse");
  const respirationInput = document.getElementById("respiration");
  const chiefComplaintInput = document.getElementById("chiefComplaint");
  const notesInput = document.getElementById("notes");
  const actionTakenInput = document.getElementById("actionTaken");
  
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  const patientTableBody = document.getElementById("patientTableBody");
  
  let checkedInQueues = [];
  
  function showError(message) {
    errorMessage.style.display = "block";
    errorMessage.textContent = message;
    successMessage.style.display = "none";
  }
  
  function showSuccess(message) {
    successMessage.style.display = "inline-block";
    successMessage.textContent = message;
    errorMessage.style.display = "none";
  }
  
  function hideMessages() {
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
    successMessage.style.display = "none";
    successMessage.textContent = "";
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
  
  function normalizeQueueData(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.queues)) return data.queues;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  }
  
  function getQueueId(queue) {
    return queue.id || queue.queue_id || queue.queueId;
  }
  
  function getQueueLabel(queue) {
    const number = queue.queue_number || queue.queueNumber || "-";
    const name = queue.student_name || queue.studentName || queue.name || "Tanpa Nama";
    const nim = queue.nim || "-";
  
    return `${number} - ${name} (${nim})`;
  }
  
  function renderQueueOptions() {
    queueSelect.innerHTML = "";
  
    if (checkedInQueues.length === 0) {
      queueSelect.innerHTML = `<option value="">Belum ada pasien check-in</option>`;
      return;
    }
  
    queueSelect.innerHTML = `<option value="">Pilih pasien</option>`;
  
    checkedInQueues.forEach((queue) => {
      const option = document.createElement("option");
      option.value = getQueueId(queue);
      option.textContent = getQueueLabel(queue);
      queueSelect.appendChild(option);
    });
  }
  
  function renderPatientTable() {
    patientTableBody.innerHTML = "";
  
    if (checkedInQueues.length === 0) {
      patientTableBody.innerHTML = `
        <tr>
          <td colspan="5">Belum ada pasien yang sudah check-in.</td>
        </tr>
      `;
      return;
    }
  
    checkedInQueues.forEach((queue) => {
      const row = document.createElement("tr");
  
      row.innerHTML = `
        <td>${queue.queue_number || queue.queueNumber || "-"}</td>
        <td>${queue.student_name || queue.studentName || queue.name || "-"}</td>
        <td>${queue.nim || "-"}</td>
        <td>${queue.complaint || queue.symptoms || queue.chief_complaint || "-"}</td>
        <td>${mapQueueStatus(queue.status)}</td>
      `;
  
      patientTableBody.appendChild(row);
    });
  }
  
  async function loadCheckedInPatients() {
    hideMessages();
  
    queueSelect.innerHTML = `<option value="">Memuat pasien...</option>`;
    patientTableBody.innerHTML = `
      <tr>
        <td colspan="5">Memuat data pasien...</td>
      </tr>
    `;
  
    try {
      const result = await apiRequest("/queue/today", {
        method: "GET",
      });
  
      if (!result.success) {
        showError(result.message || "Gagal memuat data pasien.");
        return;
      }
  
      const queues = normalizeQueueData(result.data);
  
      checkedInQueues = queues.filter((queue) => {
        return queue.status === "checked_in" || queue.status === "in_checkup";
      });
  
      renderQueueOptions();
      renderPatientTable();
    } catch (error) {
      showError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    }
  }
  
  function resetFormFields() {
    queueSelect.value = "";
    temperatureInput.value = "";
    bloodPressureInput.value = "";
    pulseInput.value = "";
    respirationInput.value = "";
    chiefComplaintInput.value = "";
    notesInput.value = "";
    actionTakenInput.value = "";
  }
  
  async function handleSubmit(event) {
    event.preventDefault();
    hideMessages();
  
    const queueId = queueSelect.value;
  
    if (!queueId) {
      showError("Pilih pasien terlebih dahulu.");
      return;
    }
  
    if (!chiefComplaintInput.value.trim()) {
      showError("Keluhan utama wajib diisi.");
      return;
    }
  
    saveButton.disabled = true;
    saveButton.textContent = "Menyimpan...";
  
    try {
      const result = await apiRequest("/health-checks", {
        method: "POST",
        body: JSON.stringify({
          queue_id: Number(queueId),
          temperature: temperatureInput.value ? Number(temperatureInput.value) : null,
          blood_pressure: bloodPressureInput.value.trim(),
          pulse: pulseInput.value ? Number(pulseInput.value) : null,
          respiration: respirationInput.value ? Number(respirationInput.value) : null,
          chief_complaint: chiefComplaintInput.value.trim(),
          notes: notesInput.value.trim(),
          action_taken: actionTakenInput.value.trim(),
        }),
      });
  
      if (!result.success) {
        showError(result.message || "Gagal menyimpan pemeriksaan.");
        return;
      }
  
      showSuccess("Pemeriksaan awal berhasil disimpan.");
      resetFormFields();
      await loadCheckedInPatients();
    } catch (error) {
      showError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Simpan Pemeriksaan";
    }
  }
  
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      removeToken();
      window.location.href = "./login.html";
    });
  }
  
  if (refreshButton) {
    refreshButton.addEventListener("click", loadCheckedInPatients);
  }
  
  if (healthCheckForm) {
    healthCheckForm.addEventListener("submit", handleSubmit);
  }
  
  (async function initHealthCheckPage() {
    const isAllowed = await protectClinicPage();
  
    if (isAllowed) {
      loadCheckedInPatients();
    }
  })();