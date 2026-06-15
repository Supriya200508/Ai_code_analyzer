import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL1,
});

// Register API
export const registerUser = (data) =>
  API.post("/register", data);

// Login API (FastAPI expects form-data)
export const loginUser = (email, password) => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  return API.post("/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};