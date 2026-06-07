(function () {
  const SWEET_ALERT_CDN =
    "https://cdn.jsdelivr.net/npm/sweetalert2@11";

  function loadSweetAlert() {
    return new Promise((resolve, reject) => {
      if (window.Swal) {
        resolve(window.Swal);
        return;
      }

      const existingScript = document.querySelector(
        `script[src="${SWEET_ALERT_CDN}"]`
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.Swal));
        existingScript.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.src = SWEET_ALERT_CDN;
      script.async = true;

      script.onload = () => resolve(window.Swal);
      script.onerror = () => reject(new Error("Gagal memuat SweetAlert2"));

      document.head.appendChild(script);
    });
  }

  function getThemeColor(type) {
    const colors = {
      success: "#047857",
      error: "#dc2626",
      warning: "#f59e0b",
      info: "#2563eb",
      question: "#047857",
    };

    return colors[type] || "#047857";
  }

  function cleanMessage(message) {
    if (!message) return "Terjadi kesalahan. Silakan coba lagi.";

    return String(message)
      .replace("Error:", "")
      .replace("Exception:", "")
      .trim();
  }

  async function fireAlert({
    icon = "info",
    title = "Informasi",
    text = "",
    html = "",
    confirmButtonText = "OK",
    showCancelButton = false,
    cancelButtonText = "Batal",
    confirmButtonColor,
    cancelButtonColor = "#64748b",
    timer = null,
    timerProgressBar = false,
  }) {
    try {
      const Swal = await loadSweetAlert();

      return Swal.fire({
        icon,
        title,
        text: html ? undefined : cleanMessage(text),
        html: html || undefined,
        confirmButtonText,
        showCancelButton,
        cancelButtonText,
        confirmButtonColor: confirmButtonColor || getThemeColor(icon),
        cancelButtonColor,
        timer,
        timerProgressBar,
        background: "#ffffff",
        color: "#0f172a",
        customClass: {
          popup: "campuscare-swal-popup",
          title: "campuscare-swal-title",
          confirmButton: "campuscare-swal-confirm",
          cancelButton: "campuscare-swal-cancel",
        },
      });
    } catch (error) {
      window.alert(cleanMessage(text || title));
      return { isConfirmed: true };
    }
  }

  async function showToast({
    icon = "success",
    title = "Berhasil",
    timer = 2200,
    position = "top-end",
  }) {
    try {
      const Swal = await loadSweetAlert();

      const Toast = Swal.mixin({
        toast: true,
        position,
        showConfirmButton: false,
        timer,
        timerProgressBar: true,
        background: "#ffffff",
        color: "#0f172a",
        iconColor: getThemeColor(icon),
        customClass: {
          popup: "campuscare-swal-toast",
        },
      });

      return Toast.fire({
        icon,
        title: cleanMessage(title),
      });
    } catch (error) {
      console.log(cleanMessage(title));
    }
  }

  window.CampusAlert = {
    async success(title = "Berhasil", text = "Proses berhasil dilakukan.") {
      return fireAlert({
        icon: "success",
        title,
        text,
        confirmButtonText: "Mengerti",
      });
    },

    async error(title = "Gagal", text = "Terjadi kesalahan.") {
      return fireAlert({
        icon: "error",
        title,
        text,
        confirmButtonText: "Coba Lagi",
      });
    },

    async warning(title = "Perhatian", text = "Periksa kembali data Anda.") {
      return fireAlert({
        icon: "warning",
        title,
        text,
        confirmButtonText: "Mengerti",
      });
    },

    async info(title = "Informasi", text = "") {
      return fireAlert({
        icon: "info",
        title,
        text,
        confirmButtonText: "OK",
      });
    },

    async confirm(
      title = "Apakah Anda yakin?",
      text = "Aksi ini akan diproses.",
      confirmButtonText = "Ya, lanjutkan"
    ) {
      const result = await fireAlert({
        icon: "question",
        title,
        text,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText: "Batal",
        confirmButtonColor: "#047857",
        cancelButtonColor: "#64748b",
      });

      return result.isConfirmed === true;
    },

    async deleteConfirm(
      title = "Hapus data?",
      text = "Data yang dihapus tidak dapat dikembalikan."
    ) {
      const result = await fireAlert({
        icon: "warning",
        title,
        text,
        showCancelButton: true,
        confirmButtonText: "Ya, hapus",
        cancelButtonText: "Batal",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",
      });

      return result.isConfirmed === true;
    },

    toastSuccess(title = "Berhasil") {
      return showToast({
        icon: "success",
        title,
      });
    },

    toastError(title = "Gagal") {
      return showToast({
        icon: "error",
        title,
      });
    },

    toastWarning(title = "Perhatian") {
      return showToast({
        icon: "warning",
        title,
      });
    },

    toastInfo(title = "Informasi") {
      return showToast({
        icon: "info",
        title,
      });
    },

    apiError(result, fallback = "Terjadi kesalahan pada server.") {
      const message =
        result?.message ||
        result?.error ||
        result?.errors?.[0] ||
        fallback;

      return this.error("Gagal", message);
    },

    apiSuccess(result, fallback = "Data berhasil diproses.") {
      const message = result?.message || fallback;

      return this.success("Berhasil", message);
    },
  };

  const style = document.createElement("style");
  style.innerHTML = `
    .campuscare-swal-popup {
      border-radius: 24px !important;
      padding: 24px !important;
      font-family: Inter, Arial, sans-serif !important;
    }

    .campuscare-swal-title {
      font-size: 22px !important;
      font-weight: 800 !important;
      color: #0f172a !important;
    }

    .campuscare-swal-confirm,
    .campuscare-swal-cancel {
      border-radius: 14px !important;
      padding: 11px 18px !important;
      font-weight: 800 !important;
      box-shadow: none !important;
    }

    .campuscare-swal-toast {
      border-radius: 18px !important;
      font-family: Inter, Arial, sans-serif !important;
      box-shadow: 0 14px 35px rgba(15, 23, 42, 0.14) !important;
    }
  `;
  document.head.appendChild(style);
})();