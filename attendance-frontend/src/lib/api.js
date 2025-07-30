import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", 
  // withCredentials: true, // Uncomment only if using cookie-based auth
});

// Automatically attach token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired token globally (redirect to login)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth helper functions
export const signup = async (userData) => {
  const res = await api.post("/auth/signup", userData);
  return res.data;
};

export const login = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
};

// Profile
export const getProfile = async () => {
  const res = await api.get("/me");
  return res.data;
};

// For Admins — get all shifts
export const getAllShifts = async () => {
  try {
    const res = await api.get("http://localhost:5000/shifts");
    return res.data;
  } catch (err) {
    console.error("Admin shift fetch failed:", err);
    throw err;
  }
};

// For Regular Users — get only their shifts
export const getUserShifts = async (userId) => {
  try {
    const res = await api.get(`http://localhost:5000/shifts/user/${userId}`);
    return res.data;
  } catch (err) {
    console.error("User shift fetch failed:", err);
    throw err;
  }
};

// Holiday attendance
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

// get my attendances
export const getMyAttendance = async () => {
  const res = await api.get('/attendance/my');
  return res.data;
};

 // get all attendance
export const getAllAttendance = async () => {
  const res = await api.get("/attendance/all");
  return res.data;
};

// Mark attendance (check-in)
export const markAttendance = async (data) => {
  const res = await api.post('/attendance/mark', data);
  return res.data;
};

// Mark checkout
export const markCheckout = async (data) => {
  const res = await api.put('/attendance/checkout', data);
  return res.data;
};
  
export const checkIn = async () => {
  const res = await api.post('/attendance/check-in');
  return res.data;
};

export const checkOut = async () => {
  const res = await api.post('/attendance/check-out');
  return res.data;
};


export default api;
