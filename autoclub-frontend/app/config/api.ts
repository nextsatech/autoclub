// Usar SIEMPRE la variable de entorno
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const response = await axios.post(`${API_URL}/auth/login`, data);