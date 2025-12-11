import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminLayout() {
  const { medico, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-white">
        <div className="p-6">
          <h1 className="text-xl font-bold">Fala Doutor</h1>
          <p className="text-gray-400 text-sm">Área Médica</p>
        </div>

        <nav className="mt-6">
          <Link
            to="/admin/dashboard"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/agenda"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            Minha Agenda
          </Link>
          <Link
            to="/admin/pacientes"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            Pacientes
          </Link>
          <Link
            to="/admin/configuracoes"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            Configurações
          </Link>
        </nav>

        {/* Usuário logado */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <p className="text-sm text-gray-400">Logado como:</p>
          <p className="font-medium">{medico?.nome}</p>
          <button
            onClick={handleLogout}
            className="mt-2 text-red-400 hover:text-red-300 text-sm"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
