import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Layout() {
  const { paciente, logout, isPaciente } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-500">Fala Doutor</span>
            </Link>

            {/* Menu de navegação */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-primary-500 transition-colors">
                Início
              </Link>
              <Link to="/medicos" className="text-gray-600 hover:text-primary-500 transition-colors">
                Nossos Médicos
              </Link>

              {isPaciente ? (
                <>
                  <Link to="/agendar" className="text-gray-600 hover:text-primary-500 transition-colors">
                    Agendar Consulta
                  </Link>
                  <Link to="/minhas-consultas" className="text-gray-600 hover:text-primary-500 transition-colors">
                    Minhas Consultas
                  </Link>
                  <div className="flex items-center space-x-4">
                    <Link to="/minha-conta" className="text-gray-600 hover:text-primary-500">
                      Olá, {paciente?.nome?.split(' ')[0]}
                    </Link>
                    <button onClick={logout} className="btn-outline text-sm">
                      Sair
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="btn-outline">
                    Entrar
                  </Link>
                  <Link to="/cadastro" className="btn-primary">
                    Cadastrar
                  </Link>
                </div>
              )}
            </div>

            {/* Menu mobile - simplificado */}
            <div className="md:hidden">
              <Link to="/login" className="btn-primary text-sm">
                Entrar
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Conteúdo principal */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Fala Doutor</h3>
              <p className="text-gray-400">
                Sua saúde em boas mãos. Agende sua consulta de forma rápida e prática.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <p className="text-gray-400">contato@faladoutor.com.br</p>
              <p className="text-gray-400">(11) 99999-9999</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Horário</h3>
              <p className="text-gray-400">Segunda a Sexta: 8h às 18h</p>
              <p className="text-gray-400">Sábado: 8h às 12h</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Fala Doutor. Todos os direitos reservados.</p>
            {/* Link discreto para área médica */}
            <Link to="/admin" className="text-gray-600 hover:text-gray-500 text-xs mt-2 inline-block">
              Área Médica
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
