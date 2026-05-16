function getToken() {
    return localStorage.getItem("campuscare_web_token");
  }
  
  function setToken(token) {
    localStorage.setItem("campuscare_web_token", token);
  }
  
  function removeToken() {
    localStorage.removeItem("campuscare_web_token");
    localStorage.removeItem("campuscare_web_user");
  }
  
  function setUser(user) {
    localStorage.setItem("campuscare_web_user", JSON.stringify(user));
  }
  
  function getUser() {
    const rawUser = localStorage.getItem("campuscare_web_user");
  
    if (!rawUser) return null;
  
    try {
      return JSON.parse(rawUser);
    } catch (error) {
      return null;
    }
  }
  
  async function apiRequest(path, options = {}) {
    const token = getToken();
  
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    };
  
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
  
      const contentType = response.headers.get("content-type") || "";
  
      if (contentType.includes("application/json")) {
        return await response.json();
      }
  
      return {
        success: false,
        message: `Response bukan JSON. Status: ${response.status}`,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        message: "Tidak dapat terhubung ke server. Pastikan backend berjalan.",
        errors: [error.message],
      };
    }
  }
  
  function logoutWeb() {
    removeToken();
    window.location.href = "./login.html";
  }