import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PacienteDashboard = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [consultas, setConsultas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [cancelando, setCancelando] = useState(null);

  useEffect(() => {
    carregarConsultas();
  }, []);

  const carregarConsultas = async () => {
    try {
      setCarregando(true);
      setErro('');

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/consultas/paciente/${usuario.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setConsultas(response.data.consultas || []);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
      setErro('Erro ao carregar consultas');
    } finally {
      setCarregando(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cancelarConsulta = async (consultaId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      return;
    }

    try {
      setCancelando(consultaId);
      setErro('');

      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/consultas/${consultaId}/cancelar`,
        { motivo_cancelamento: 'Cancelado pelo paciente' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Recarregar consultas após cancelamento
      await carregarConsultas();
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error);
      setErro(error.response?.data?.message || 'Erro ao cancelar consulta');
    } finally {
      setCancelando(null);
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'agendada': 'bg-blue-100 text-blue-800',
      'confirmada': 'bg-green-100 text-green-800',
      'realizada': 'bg-gray-100 text-gray-800',
      'cancelada': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  const consultasProximas = consultas.filter(c =>
    ['agendada', 'confirmada'].includes(c.status) &&
    new Date(c.data_consulta) >= new Date()
  ).slice(0, 5);

  const consultasPassadas = consultas.filter(c =>
    c.status === 'realizada' ||
    (c.status === 'agendada' && new Date(c.data_consulta) < new Date())
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Fala Doutor
            </h1>
            <p className="text-sm text-gray-600">
              Bem-vindo(a), {usuario?.nome}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Minhas Informações
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">CPF</p>
              <p className="text-gray-900 font-medium">
                {usuario?.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plano</p>
              <p className="text-gray-900 font-medium capitalize">
                {usuario?.plano}
              </p>
            </div>
            {usuario?.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900 font-medium">
                  {usuario.email}
                </p>
              </div>
            )}
            {usuario?.telefone && (
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="text-gray-900 font-medium">
                  {usuario.telefone?.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate('/paciente/agendar')}
            className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Agendar Consulta
                </h3>
                <p className="text-sm text-gray-600">
                  Marque uma nova consulta médica
                </p>
              </div>
            </div>
          </button>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {consultas.filter(c => c.status !== 'cancelada').length}
                </h3>
                <p className="text-sm text-gray-600">
                  Consultas ativas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {erro && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {erro}
          </div>
        )}

        {/* Próximas Consultas */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Próximas Consultas
            </h2>
            <button
              onClick={() => navigate('/paciente/agendar')}
              className="btn-primary"
            >
              Nova Consulta
            </button>
          </div>

          {carregando ? (
            <p className="text-gray-600">Carregando consultas...</p>
          ) : consultasProximas.length > 0 ? (
            <div className="space-y-4">
              {consultasProximas.map((consulta) => (
                <div
                  key={consulta.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        Dr(a). {consulta.medico?.nome}
                      </p>
                      <p className="text-sm text-gray-600">
                        CRM: {consulta.medico?.crm}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Data:</span> {formatarData(consulta.data_consulta)} às {consulta.hora_consulta}
                      </p>
                      {consulta.observacoes && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Observações:</span> {consulta.observacoes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(consulta.status)}`}>
                        {consulta.status}
                      </span>
                      {consulta.status !== 'cancelada' && (
                        <button
                          onClick={() => cancelarConsulta(consulta.id)}
                          disabled={cancelando === consulta.id}
                          className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {cancelando === consulta.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Você não tem consultas agendadas.</p>
          )}
        </div>

        {/* Histórico de Consultas */}
        {consultasPassadas.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Histórico de Consultas
            </h2>
            <div className="space-y-4">
              {consultasPassadas.map((consulta) => (
                <div
                  key={consulta.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        Dr(a). {consulta.medico?.nome}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatarData(consulta.data_consulta)} às {consulta.hora_consulta}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(consulta.status)}`}>
                      {consulta.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PacienteDashboard;
