import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar se há usuário logado ao carregar a aplicação
  useEffect(() => {
    const carregarUsuario = async () => {
      const token = localStorage.getItem('token');
      const usuarioSalvo = localStorage.getItem('usuario');

      if (token && usuarioSalvo) {
        try {
          setUsuario(JSON.parse(usuarioSalvo));
        } catch (err) {
          console.error('Erro ao carregar usuário:', err);
          logout();
        }
      }

      setLoading(false);
    };

    carregarUsuario();
  }, []);

  const login = async (cpf, senha) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.login(cpf, senha);

      if (response.success) {
        const { token, usuario } = response;

        // Salvar no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));

        // Atualizar estado
        setUsuario(usuario);

        return { success: true };
      }
    } catch (err) {
      const mensagemErro = err.response?.data?.message || 'Erro ao fazer login';
      setError(mensagemErro);
      return { success: false, error: mensagemErro };
    } finally {
      setLoading(false);
    }
  };

  const registro = async (dados) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.registro(dados);

      if (response.success) {
        const { token, usuario } = response;

        // Salvar no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));

        // Atualizar estado
        setUsuario(usuario);

        return { success: true };
      }
    } catch (err) {
      const mensagemErro = err.response?.data?.message || 'Erro ao fazer registro';
      setError(mensagemErro);
      return { success: false, error: mensagemErro };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setError(null);
  };

  const isAuthenticated = () => {
    return !!usuario && !!localStorage.getItem('token');
  };

  const isAdmin = () => {
    return usuario?.role === 'admin';
  };

  const isMedico = () => {
    return usuario?.tipo === 'medico' || usuario?.role === 'admin' || usuario?.role === 'medico';
  };

  const isPaciente = () => {
    return usuario?.tipo === 'paciente' || usuario?.role === 'paciente';
  };

  const value = {
    usuario,
    loading,
    error,
    login,
    registro,
    logout,
    isAuthenticated,
    isAdmin,
    isMedico,
    isPaciente
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};

export default AuthContext;
