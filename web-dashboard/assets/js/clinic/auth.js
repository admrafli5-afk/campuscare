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
    errorMessage.style.display = "block";
    errorMessage.textContent = message;
  }
  
  function hideError() {
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
  }
  
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideError();
  
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
  
    if (!email || !password) {
      showError("Email dan password wajib diisi.");
      return;
    }
  
    loginButton.disabled = true;
    loginButton.textContent = "Memproses...";
  
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
  
      window.location.href = "./dashboard.html";
    } catch (error) {
      showError("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Masuk";
    }
  });