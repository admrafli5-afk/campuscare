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
      "Accept": "application/json",
      ...(options.headers || {}),
    };
  
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  
    return response.json();
  }
  
  function logoutWeb() {
    removeToken();
    window.location.href = "./login.html";
  }