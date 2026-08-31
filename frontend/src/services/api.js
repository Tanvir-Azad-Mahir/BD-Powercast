import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000",
});

export const predictDay = async (date) => {
  const response = await api.post("/predict/day", {
    date,
  });

  return response.data;
};

export const predictMonth = async (year, month) => {
  const response = await api.post("/predict/month", {
    year,
    month,
  });

  return response.data;
};

export default api;