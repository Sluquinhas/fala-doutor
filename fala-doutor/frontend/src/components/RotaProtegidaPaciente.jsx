import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RotaProtegidaPaciente() {
  const { isPaciente, loading } = useAuth();

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redireciona para login se não estiver autenticado como paciente
  if (!isPaciente) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default RotaProtegidaPaciente;
