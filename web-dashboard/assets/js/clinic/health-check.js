document.addEventListener('DOMContentLoaded', () => {
  const queueSelect = document.getElementById('queueSelect');
  const patientTableBody = document.getElementById('patientTableBody');
  const healthCheckForm = document.getElementById('healthCheckForm');

  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  const temperatureInput = document.getElementById('temperature');
  const bloodPressureInput = document.getElementById('bloodPressure');
  const pulseInput = document.getElementById('pulse');
  const respirationInput = document.getElementById('respiration');
  const chiefComplaintInput = document.getElementById('chiefComplaint');
  const notesInput = document.getElementById('notes');
  const actionTakenInput = document.getElementById('actionTaken');

  const refreshButton = document.getElementById('refreshButton');
  const saveButton = document.getElementById('saveButton');
  const logoutButton = document.getElementById('logoutButton');

  const HC_API_BASE_URL =
    typeof API_BASE_URL !== 'undefined'
      ? API_BASE_URL
      : 'http://localhost:5000/api';

  function getHealthCheckToken() {
    return (
      localStorage.getItem('campuscare_web_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken') ||
      ''
    );
  }

  function showError(message) {
    if (!errorMessage) return;

    errorMessage.style.display = 'block';
    errorMessage.textContent = message;

    if (successMessage) {
      successMessage.style.display = 'none';
      successMessage.textContent = '';
    }
  }

  function showSuccess(message) {
    if (!successMessage) return;

    successMessage.style.display = 'inline-block';
    successMessage.textContent = message;

    if (errorMessage) {
      errorMessage.style.display = 'none';
      errorMessage.textContent = '';
    }
  }

  function clearMessage() {
    if (errorMessage) {
      errorMessage.style.display = 'none';
      errorMessage.textContent = '';
    }

    if (successMessage) {
      successMessage.style.display = 'none';
      successMessage.textContent = '';
    }
  }

  async function requestHealthCheckApi(path, options = {}) {
    const token = getHealthCheckToken();

    if (!token) {
      throw new Error(
        'Token tidak ditemukan. Silakan logout lalu login ulang sebagai petugas klinik.'
      );
    }

    const response = await fetch(`${HC_API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Terjadi kesalahan pada server');
    }

    return data;
  }

  function getResponseArray(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data?.queues)) return response.data.queues;
    if (Array.isArray(response.data?.items)) return response.data.items;
    if (Array.isArray(response.queues)) return response.queues;

    return [];
  }

  function normalizeQueue(queue) {
    return {
      id: queue.id,
      student_id:
        queue.student_id ||
        queue.studentId ||
        queue.student?.id ||
        queue.student?.student_id ||
        '',
      queue_number:
        queue.queue_number ||
        queue.queueNumber ||
        '-',
      student_name:
        queue.student_name ||
        queue.studentName ||
        queue.name ||
        queue.student?.name ||
        '-',
      nim:
        queue.nim ||
        queue.student_nim ||
        queue.studentNim ||
        queue.student?.nim ||
        '-',
      complaint:
        queue.complaint ||
        queue.keluhan ||
        queue.description ||
        '-',
      status: queue.status || '-',
    };
  }

  function isReadyForHealthCheck(status) {
    return ['checked_in', 'in_checkup', 'called'].includes(status);
  }

  function renderQueueSelect(queues) {
    if (!queueSelect) return;

    if (queues.length === 0) {
      queueSelect.innerHTML = `
        <option value="">Belum ada pasien check-in</option>
      `;
      return;
    }

    queueSelect.innerHTML = queues
      .map((queue) => {
        return `
          <option
            value="${queue.id}"
            data-queue-id="${queue.id}"
            data-student-id="${queue.student_id}"
          >
            ${queue.queue_number} - ${queue.student_name} (${queue.nim})
          </option>
        `;
      })
      .join('');
  }

  function renderPatientTable(queues) {
    if (!patientTableBody) return;

    if (queues.length === 0) {
      patientTableBody.innerHTML = `
        <tr>
          <td colspan="5">Belum ada pasien yang siap diperiksa.</td>
        </tr>
      `;
      return;
    }

    patientTableBody.innerHTML = queues
      .map((queue) => {
        return `
          <tr>
            <td>${queue.queue_number}</td>
            <td>${queue.student_name}</td>
            <td>${queue.nim}</td>
            <td>${queue.complaint}</td>
            <td>${queue.status}</td>
          </tr>
        `;
      })
      .join('');
  }

  async function loadCheckedInPatients() {
    clearMessage();

    if (queueSelect) {
      queueSelect.innerHTML = `
        <option value="">Memuat pasien...</option>
      `;
    }

    if (patientTableBody) {
      patientTableBody.innerHTML = `
        <tr>
          <td colspan="5">Memuat data pasien...</td>
        </tr>
      `;
    }

    try {
      console.log('Mengambil data antrean dari:', `${HC_API_BASE_URL}/queue/today`);

      const response = await requestHealthCheckApi('/queue/today', {
        method: 'GET',
      });

      console.log('Response queue today:', response);

      const rawQueues = getResponseArray(response);

      const queues = rawQueues
        .map(normalizeQueue)
        .filter((queue) => isReadyForHealthCheck(queue.status));

      console.log('Pasien siap diperiksa:', queues);

      renderQueueSelect(queues);
      renderPatientTable(queues);
    } catch (error) {
      console.error(error);
      showError(error.message);

      if (queueSelect) {
        queueSelect.innerHTML = `
          <option value="">Gagal memuat pasien</option>
        `;
      }

      if (patientTableBody) {
        patientTableBody.innerHTML = `
          <tr>
            <td colspan="5">Gagal memuat data pasien.</td>
          </tr>
        `;
      }
    }
  }

  async function updateQueueToInCheckup(queueId) {
    if (!queueId) return;

    try {
      await requestHealthCheckApi(`/queue/${queueId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'in_checkup',
        }),
      });

      console.log('Status antrean berhasil diubah ke in_checkup');
    } catch (error) {
      console.warn(
        'Pemeriksaan tersimpan, tapi status antrean gagal diubah:',
        error.message
      );
    }
  }

  async function submitHealthCheck(event) {
    event.preventDefault();
    clearMessage();

    const selectedOption = queueSelect.options[queueSelect.selectedIndex];

    if (!selectedOption || !selectedOption.value) {
      showError('Pilih pasien terlebih dahulu.');
      return;
    }

    const studentId = Number(selectedOption.dataset.studentId);
    const queueId = Number(selectedOption.dataset.queueId || selectedOption.value);

    if (!studentId) {
      showError('student_id wajib diisi. Data antrean belum membawa student_id.');
      return;
    }

    const payload = {
      student_id: studentId,
      queue_id: queueId || null,
      temperature: temperatureInput.value ? Number(temperatureInput.value) : null,
      blood_pressure: bloodPressureInput.value.trim(),
      pulse: pulseInput.value ? Number(pulseInput.value) : null,
      respiration: respirationInput.value ? Number(respirationInput.value) : null,
      chief_complaint: chiefComplaintInput.value.trim(),
      notes: notesInput.value.trim(),
      action_taken: actionTakenInput.value.trim(),
    };

    console.log('Payload health check:', payload);

    try {
      saveButton.disabled = true;
      saveButton.textContent = 'Menyimpan...';

      await requestHealthCheckApi('/health-checks', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await updateQueueToInCheckup(queueId);

      showSuccess(
        'Pemeriksaan berhasil disimpan. Status pasien berubah menjadi sedang diperiksa.'
      );

      healthCheckForm.reset();

      await loadCheckedInPatients();
    } catch (error) {
      console.error(error);
      showError(error.message);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Simpan Pemeriksaan';
    }
  }

  if (healthCheckForm) {
    healthCheckForm.addEventListener('submit', submitHealthCheck);
  }

  if (refreshButton) {
    refreshButton.addEventListener('click', loadCheckedInPatients);
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('campuscare_web_token');
      localStorage.removeItem('campuscare_web_user');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('accessToken');

      window.location.href = '../auth/login.html';
    });
  }

  loadCheckedInPatients();
});