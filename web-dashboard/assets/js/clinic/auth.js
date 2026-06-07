const allowedClinicRoles = [
  "clinic_staff",
  "clinic_admin",
  "supervisor",
  "super_admin",
];

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");
const loginButton = document.getElementById("loginButton");

function showError(message) {
  if (!errorMessage) return;

  errorMessage.style.display = "block";
  errorMessage.textContent = message;
}

function hideError() {
  if (!errorMessage) return;

  errorMessage.style.display = "none";
  errorMessage.textContent = "";
}

function setLoginButtonLoading(isLoading) {
  if (!loginButton) return;

  loginButton.disabled = isLoading;

  if (isLoading) {
    loginButton.innerHTML = "Memproses...";
  } else {
    loginButton.innerHTML = `
      <span>Masuk ke Dashboard</span>
      <svg class="arrow" xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14"/>
        <path d="m12 5 7 7-7 7"/>
      </svg>
    `;
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideError();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showError("Email dan password wajib diisi.");
      return;
    }

    setLoginButtonLoading(true);

    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!result.success) {
        showError(result.message || "Login gagal.");
        return;
      }

      const token = result.data.token;
      const user = result.data.user;

      if (!allowedClinicRoles.includes(user.role)) {
        showError("Akun ini tidak memiliki akses ke dashboard klinik.");
        return;
      }

      setToken(token);
      setUser(user);

      window.location.href = "/web-dashboard/pages/clinic/dashboard.html";
    } catch (error) {
      console.error(error);
      showError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      setLoginButtonLoading(false);
    }
  });
}