import axios from 'axios';

const baseURL = import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
