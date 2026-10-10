import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("holden_user");
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Error reading current user from storage", e);
  }
  const username = localStorage.getItem("username");
  return username ? { username } : null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem("holden_user", JSON.stringify(user));
    localStorage.setItem("username", user.username);
  } else {
    localStorage.removeItem("holden_user");
    localStorage.removeItem("username");
  }
};

export const logout = () => {
  localStorage.removeItem("holden_user");
  localStorage.removeItem("username");
};

export const authService = {
  login: async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    if (response.data && response.data.user) {
      setCurrentUser(response.data.user);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
};

export const certificateService = {
  upload: async (formData) => {
    return await api.post("/certificates/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getMyCertificates: async (ownerUsername) => {
    return await api.get("/certificates", {
      params: { ownerUsername },
    });
  },

  getById: async (id, username) => {
    return await api.get(`/certificates/${id}`, {
      params: { username },
    });
  },

  download: async (id, username, fileName) => {
    const response = await api.get(`/certificates/${id}/download`, {
      params: { username },
      responseType: "blob",
    });

    // Create download link
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName || "certificate");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  update: async (id, username, data) => {
    return await api.put(`/certificates/${id}`, data, {
      params: { username },
    });
  },

  delete: async (id, username) => {
    return await api.delete(`/certificates/${id}`, {
      params: { username },
    });
  },

  verifyIntegrity: async (id, username) => {
    return await api.post(`/certificates/${id}/verify`, null, {
      params: { username },
    });
  },

  share: async (id, ownerUsername, recipientUsername) => {
    return await api.post(
      `/certificates/${id}/share`,
      { ownerUsername, recipientUsername },
      { params: { ownerUsername, recipientUsername } }
    );
  },

  revokeShare: async (id, ownerUsername, recipientUsername) => {
    return await api.post(
      `/certificates/${id}/revoke-share`,
      { ownerUsername, recipientUsername },
      { params: { ownerUsername, recipientUsername } }
    );
  },

  getShares: async (id, ownerUsername) => {
    return await api.get(`/certificates/${id}/shares`, {
      params: { ownerUsername },
    });
  },

  getSharedWithMe: async (username) => {
    return await api.get("/certificates/shared-with-me", {
      params: { username },
    });
  },

  getSummary: async (username) => {
    return await api.get("/certificates/summary", {
      params: { username },
    });
  },

  getActivities: async (username) => {
    return await api.get("/certificates/activities", {
      params: { username },
    });
  },
};

export default api;
