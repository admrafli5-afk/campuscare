const allowedClinicRoles = [
    "clinic_staff",
    "clinic_admin",
    "supervisor",
    "super_admin",
  ];
  
  async function protectClinicPage() {
    const token = getToken();
  
    if (!token) {
      window.location.href = "./login.html";
      return;
    }
  
    try {
      const result = await apiRequest("/auth/me", {
        method: "GET",
      });
  
      if (!result.success) {
        removeToken();
        window.location.href = "./login.html";
        return;
      }
  
      const user = result.data;
  
      if (!allowedClinicRoles.includes(user.role)) {
        removeToken();
        window.location.href = "./login.html";
        return;
      }
  
      setUser(user);
  
      const userNameElement = document.getElementById("userName");
      const welcomeNameElement = document.getElementById("welcomeName");
  
      if (userNameElement) userNameElement.textContent = user.name;
      if (welcomeNameElement) welcomeNameElement.textContent = user.name;
    } catch (error) {
      removeToken();
      window.location.href = "./login.html";
    }
  }
  
  const logoutButton = document.getElementById("logoutButton");
  
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      removeToken();
      window.location.href = "./login.html";
    });
  }
  
  protectClinicPage();