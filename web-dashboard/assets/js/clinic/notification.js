function getToastContainer() {
  let container = document.getElementById("toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  return container;
}

function getToastIcon(type) {
  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-xmark",
    warning: "fa-triangle-exclamation",
    info: "fa-circle-info",
  };

  return icons[type] || icons.info;
}

function getToastTitle(type) {
  const titles = {
    success: "Berhasil",
    error: "Terjadi Kesalahan",
    warning: "Perhatian",
    info: "Informasi",
  };

  return titles[type] || titles.info;
}

function showToast(message, type = "info", title = null, duration = 3200) {
  const container = getToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast-pop toast-${type}`;

  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fa-solid ${getToastIcon(type)}"></i>
    </div>

    <div class="toast-content">
      <strong>${title || getToastTitle(type)}</strong>
      <p>${message}</p>
    </div>

    <button class="toast-close" type="button" aria-label="Tutup notifikasi">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);

  const closeButton = toast.querySelector(".toast-close");

  function closeToast() {
    toast.classList.add("toast-hide");

    setTimeout(() => {
      toast.remove();
    }, 260);
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeToast);
  }

  setTimeout(closeToast, duration);
}

function showConfirmDialog(message, options = {}) {
  const {
    title = "Konfirmasi Aksi",
    confirmText = "Ya, lanjutkan",
    cancelText = "Batal",
    type = "warning",
  } = options;

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";

    overlay.innerHTML = `
      <div class="confirm-pop">
        <div class="confirm-icon confirm-${type}">
          <i class="fa-solid ${getToastIcon(type)}"></i>
        </div>

        <div class="confirm-content">
          <h3>${title}</h3>
          <p>${message}</p>
        </div>

        <div class="confirm-actions">
          <button class="confirm-cancel" type="button">${cancelText}</button>
          <button class="confirm-ok" type="button">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const cancelButton = overlay.querySelector(".confirm-cancel");
    const okButton = overlay.querySelector(".confirm-ok");

    function close(result) {
      overlay.classList.add("confirm-hide");

      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 220);
    }

    cancelButton.addEventListener("click", () => close(false));
    okButton.addEventListener("click", () => close(true));

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        close(false);
      }
    });
  });
}

window.showToast = showToast;
window.showConfirmDialog = showConfirmDialog;

window.alert = function (message) {
  showToast(String(message), "info");
};
