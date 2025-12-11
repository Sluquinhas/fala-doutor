import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [paciente, setPaciente] = useState(null);
  const [medico, setMedico] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica se há usuário logado ao carregar a página
  useEffect(() => {
    const tokenPaciente = localStorage.getItem('token_paciente');
    const tokenMedico = localStorage.getItem('token_medico');

    if (tokenPaciente) {
      carregarPaciente();
    } else if (tokenMedico) {
      carregarMedico();
    } else {
      setLoading(false);
    }
  }, []);

  // Carrega dados do paciente logado
  const carregarPaciente = async () => {
    try {
      const response = await api.get('/pacientes/perfil');
      setPaciente(response.data);
    } catch (error) {
      localStorage.removeItem('token_paciente');
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados do médico logado
  const carregarMedico = async () => {
    try {
      const response = await api.get('/medicos/perfil');
      setMedico(response.data);
    } catch (error) {
      localStorage.removeItem('token_medico');
    } finally {
      setLoading(false);
    }
  };

  // Login do paciente
  const loginPaciente = async (email, senha) => {
    const response = await api.post('/auth/paciente/login', { email, senha });
    localStorage.setItem('token_paciente', response.data.token);
    setPaciente(response.data.paciente);
    return response.data;
  };

  // Cadastro do paciente
  const cadastrarPaciente = async (dados) => {
    const response = await api.post('/auth/paciente/cadastro', dados);
    localStorage.setItem('token_paciente', response.data.token);
    setPaciente(response.data.paciente);
    return response.data;
  };

  // Login do médico
  const loginMedico = async (email, senha) => {
    const response = await api.post('/auth/medico/login', { email, senha });
    localStorage.setItem('token_medico', response.data.token);
    setMedico(response.data.medico);
    return response.data;
  };

  // Logout geral
  const logout = () => {
    localStorage.removeItem('token_paciente');
    localStorage.removeItem('token_medico');
    setPaciente(null);
    setMedico(null);
  };

  const value = {
    paciente,
    medico,
    loading,
    loginPaciente,
    cadastrarPaciente,
    loginMedico,
    logout,
    isAuthenticated: !!paciente || !!medico,
    isPaciente: !!paciente,
    isMedico: !!medico,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
