import axios from 'axios';

/**
 * Configuração do Axios para comunicação com o backend
 */

// URL base da API (alterar conforme ambiente)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Criar instância do Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de requisição - Adiciona token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta - Trata erros globalmente
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratar erro de autenticação (token expirado ou inválido)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }

    // Retornar erro para tratamento específico
    return Promise.reject(error);
  }
);

/**
 * Serviços de Autenticação
 */
export const authService = {
  login: async (cpf, senha) => {
    const response = await api.post('/auth/login', { cpf, senha });
    return response.data;
  },

  registro: async (dados) => {
    const response = await api.post('/auth/registro', dados);
    return response.data;
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

/**
 * Serviços de Médicos
 */
export const medicoService = {
  listar: async (params = {}) => {
    const response = await api.get('/medicos', { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/medicos/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post('/medicos', dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/medicos/${id}`, dados);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/medicos/${id}`);
    return response.data;
  }
};

/**
 * Serviços de Pacientes
 */
export const pacienteService = {
  cadastroPublico: async (dados) => {
    const response = await api.post('/pacientes/publico/cadastro', dados);
    return response.data;
  },

  listar: async (params = {}) => {
    const response = await api.get('/pacientes', { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/pacientes/${id}`);
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post('/pacientes', dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/pacientes/${id}`, dados);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/pacientes/${id}`);
    return response.data;
  }
};

export default api;
