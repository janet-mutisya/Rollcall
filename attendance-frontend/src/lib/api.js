import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Automatically attach token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired token globally (redirect to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ===== Auth =====
export const signup = async (userData) => {
  const res = await api.post("/auth/signup", userData);
  return res.data;
};

export const login = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("/me");
  return res.data;
};

// ===== Shift =====
export const getAllShifts = async () => {
  const res = await api.get("/shifts");
  return res.data;
};

export const getUserShifts = async (userId) => {
  const res = await api.get(`/shifts/user/${userId}`);
  return res.data;
};

export const createShift = async (data) => {
  const res = await api.post("/shifts", data);
  return res.data;
};

// ===== Holiday Attendance =====
export const markHolidayAttendance = async (data) => {
  const res = await api.post("/holiday-attendance/mark", data);
  return res.data;
};

export const getMyHolidayAttendance = async () => {
  const res = await api.get("/holiday-attendance/my");
  return res.data;
};

export const getAllHolidayAttendance = async () => {
  const res = await api.get("/holiday-attendance/all");
  return res.data;
};

// ===== Attendance =====
export const getMyAttendance = async () => {
  const res = await api.get("/attendance/my");
  return res.data;
};

export const getAllAttendance = async () => {
  const res = await api.get("/attendance/all");
  return res.data;
};

export const markAttendance = async (data) => {
  const res = await api.post("/attendance/mark", data);
  return res.data;
};

export const markCheckout = async (data) => {
  const res = await api.post("/attendance/checkout", data);
  return res.data;
};

export default api;
