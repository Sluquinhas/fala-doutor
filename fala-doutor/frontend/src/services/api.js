import axios from 'axios';

// Instância do Axios configurada para a API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT nas requisições
api.interceptors.request.use(
  (config) => {
    // Verifica token de paciente ou médico
    const tokenPaciente = localStorage.getItem('token_paciente');
    const tokenMedico = localStorage.getItem('token_medico');

    if (tokenPaciente) {
      config.headers.Authorization = `Bearer ${tokenPaciente}`;
    } else if (tokenMedico) {
      config.headers.Authorization = `Bearer ${tokenMedico}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expirado ou inválido
    if (error.response?.status === 401) {
      localStorage.removeItem('token_paciente');
      localStorage.removeItem('token_medico');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
