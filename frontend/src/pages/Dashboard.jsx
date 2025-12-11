import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Fala Doutor
              </h1>
              <p className="text-sm text-gray-600">
                Bem-vindo, Dr(a). {usuario?.nome}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card de Médicos */}
          <div className="card cursor-pointer hover:shadow-lg transition-shadow"
               onClick={() => navigate('/medicos')}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Médicos
                </h2>
                <p className="text-gray-600 text-sm">
                  Gerenciar cadastro de médicos
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card de Pacientes */}
          <div className="card cursor-pointer hover:shadow-lg transition-shadow"
               onClick={() => navigate('/pacientes')}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Pacientes
                </h2>
                <p className="text-gray-600 text-sm">
                  Gerenciar cadastro de pacientes
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Usuário */}
        <div className="mt-8 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Suas Informações
          </h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Nome:</span> {usuario?.nome}</p>
            <p><span className="font-medium">CPF:</span> {usuario?.cpf}</p>
            <p><span className="font-medium">CRM:</span> {usuario?.crm}</p>
            <p><span className="font-medium">Plano:</span> {usuario?.plano}</p>
            <p><span className="font-medium">Perfil:</span> {usuario?.role === 'admin' ? 'Administrador' : 'Médico'}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
