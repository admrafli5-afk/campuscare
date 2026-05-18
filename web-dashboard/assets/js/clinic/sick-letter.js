const allowedClinicRoles = [
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "super_admin",
  ];
  
  const userNameElement = document.getElementById("userName");
  const logoutButton = document.getElementById("logoutButton");
  
  const sickLetterForm = document.getElementById("sickLetterForm");
  const queueSelect = document.getElementById("queueSelect");
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const diagnosisInput = document.getElementById("diagnosis");
  const notesInput = document.getElementById("notes");
  
  const saveButton = document.getElementById("saveButton");
  const previewButton = document.getElementById("previewButton");
  const refreshButton = document.getElementById("refreshButton");
  
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  
  const previewCard = document.getElementById("previewCard");
  const previewName = document.getElementById("previewName");
  const previewNim = document.getElementById("previewNim");
  const previewQueueNumber = document.getElementById("previewQueueNumber");
  const previewDiagnosis = document.getElementById("previewDiagnosis");
  const previewPeriod = document.getElementById("previewPeriod");
  const previewNotes = document.getElementById("previewNotes");
  const previewOfficerName = document.getElementById("previewOfficerName");
  
  const letterTableBody = document.getElementById("letterTableBody");
  
  let patientQueues = [];
  let currentUser = null;
  
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
  
      if (previewOfficerName) {
        previewOfficerName.textContent = user.name;
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
  
  function getSelectedQueue() {
    const selectedId = queueSelect.value;
  
    return patientQueues.find((queue) => String(getQueueId(queue)) === String(selectedId));
  }
  
  function formatDate(dateString) {
    if (!dateString) return "-";
  
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
  
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
  
  function renderQueueOptions() {
    queueSelect.innerHTML = "";
  
    if (patientQueues.length === 0) {
      queueSelect.innerHTML = `<option value="">Belum ada pasien untuk surat sakit</option>`;
      return;
    }
  
    queueSelect.innerHTML = `<option value="">Pilih pasien</option>`;
  
    patientQueues.forEach((queue) => {
      const option = document.createElement("option");
      option.value = getQueueId(queue);
      option.textContent = getQueueLabel(queue);
      queueSelect.appendChild(option);
    });
  }
  
  async function loadPatients() {
    hideMessages();
  
    queueSelect.innerHTML = `<option value="">Memuat pasien...</option>`;
  
    try {
      const result = await apiRequest("/queue/today", {
        method: "GET",
      });
  
      if (!result.success) {
        showError(result.message || "Gagal memuat pasien.");
        return;
      }
  
      const queues = normalizeQueueData(result.data);
  
      patientQueues = queues.filter((queue) => {
        return (
          queue.status === "checked_in" ||
          queue.status === "in_checkup" ||
          queue.status === "completed"
        );
      });
  
      renderQueueOptions();
    } catch (error) {
      showError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    }
  }
  
  function validateForm() {
    if (!queueSelect.value) {
      showError("Pilih pasien terlebih dahulu.");
      return false;
    }
  
    if (!startDateInput.value) {
      showError("Tanggal mulai izin wajib diisi.");
      return false;
    }
  
    if (!endDateInput.value) {
      showError("Tanggal selesai izin wajib diisi.");
      return false;
    }
  
    if (!diagnosisInput.value.trim()) {
      showError("Diagnosis atau keterangan sakit wajib diisi.");
      return false;
    }
  
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
  
    if (endDate < startDate) {
      showError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
      return false;
    }
  
    return true;
  }
  
  function renderPreview() {
    hideMessages();
  
    if (!validateForm()) {
      return;
    }
  
    const queue = getSelectedQueue();
  
    if (!queue) {
      showError("Data pasien tidak ditemukan.");
      return;
    }
  
    previewName.textContent =
      queue.student_name || queue.studentName || queue.name || "-";
  
    previewNim.textContent =
      queue.nim || "-";
  
    previewQueueNumber.textContent =
      queue.queue_number || queue.queueNumber || "-";
  
    previewDiagnosis.textContent =
      diagnosisInput.value.trim();
  
    previewPeriod.textContent =
      `${formatDate(startDateInput.value)} sampai ${formatDate(endDateInput.value)}`;
  
    previewNotes.textContent =
      notesInput.value.trim() || "-";
  
    previewOfficerName.textContent =
      currentUser ? currentUser.name : "Petugas Klinik";
  
    previewCard.style.display = "block";
  }
  
  function resetForm() {
    queueSelect.value = "";
    startDateInput.value = "";
    endDateInput.value = "";
    diagnosisInput.value = "";
    notesInput.value = "";
  }
  
  async function handleSubmit(event) {
    event.preventDefault();
    hideMessages();
  
    if (!validateForm()) {
      return;
    }
  
    const queue = getSelectedQueue();
  
    if (!queue) {
      showError("Data pasien tidak ditemukan.");
      return;
    }
  
    saveButton.disabled = true;
    saveButton.textContent = "Menyimpan...";
  
    try {
      const result = await apiRequest("/sick-letters", {
        method: "POST",
        body: JSON.stringify({
          queue_id: Number(queueSelect.value),
          start_date: startDateInput.value,
          end_date: endDateInput.value,
          diagnosis: diagnosisInput.value.trim(),
          notes: notesInput.value.trim(),
        }),
      });
  
      if (!result.success) {
        showError(
          result.message ||
            "Endpoint surat sakit belum tersedia dari backend. Preview tetap bisa digunakan."
        );
        renderPreview();
        return;
      }
  
      showSuccess("Surat sakit berhasil dibuat.");
      renderPreview();
      resetForm();
    } catch (error) {
      showError("Tidak dapat terhubung ke server. Preview tetap bisa digunakan.");
      renderPreview();
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Buat Surat Sakit";
    }
  }
  
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      removeToken();
      window.location.href = "./login.html";
    });
  }
  
  if (refreshButton) {
    refreshButton.addEventListener("click", loadPatients);
  }
  
  if (previewButton) {
    previewButton.addEventListener("click", renderPreview);
  }
  
  if (sickLetterForm) {
    sickLetterForm.addEventListener("submit", handleSubmit);
  }
  
  (async function initSickLetterPage() {
    const isAllowed = await protectClinicPage();
  
    if (isAllowed) {
      loadPatients();
    }
  })();