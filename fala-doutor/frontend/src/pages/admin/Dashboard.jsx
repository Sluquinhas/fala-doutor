import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function Dashboard() {
  const { medico } = useAuth();
  const [stats, setStats] = useState({
    consultasHoje: 0,
    consultasSemana: 0,
    pacientesTotal: 0,
    consultasPendentes: 0,
  });
  const [proximasConsultas, setProximasConsultas] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [statsRes, consultasRes] = await Promise.all([
        api.get('/medicos/dashboard/stats'),
        api.get('/medicos/dashboard/proximas-consultas'),
      ]);
      setStats(statsRes.data);
      setProximasConsultas(consultasRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const formatarData = (dataHora) => {
    return new Date(dataHora).toLocaleDateString('pt-BR');
  };

  const formatarHora = (dataHora) => {
    return new Date(dataHora).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Olá, Dr(a). {medico?.nome?.split(' ')[0]}
      </h1>
      <p className="text-gray-600 mb-8">Bem-vindo ao painel de controle</p>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Consultas Hoje</p>
          <p className="text-3xl font-bold text-primary-500">{stats.consultasHoje}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Esta Semana</p>
          <p className="text-3xl font-bold text-primary-500">{stats.consultasSemana}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Pacientes Total</p>
          <p className="text-3xl font-bold text-primary-500">{stats.pacientesTotal}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Pendentes</p>
          <p className="text-3xl font-bold text-secondary-500">{stats.consultasPendentes}</p>
        </div>
      </div>

      {/* Próximas consultas */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Próximas Consultas</h2>
          <Link to="/admin/agenda" className="text-primary-500 hover:underline text-sm">
            Ver todas
          </Link>
        </div>
        <div className="divide-y">
          {proximasConsultas.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">Nenhuma consulta agendada</p>
          ) : (
            proximasConsultas.slice(0, 5).map(consulta => (
              <div key={consulta.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{consulta.paciente?.nome}</p>
                  <p className="text-sm text-gray-500">
                    {formatarData(consulta.dataHora)} às {formatarHora(consulta.dataHora)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  consulta.status === 'CONFIRMADA'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {consulta.status === 'CONFIRMADA' ? 'Confirmada' : 'Agendada'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
