import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function MinhasConsultas() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    carregarConsultas();
  }, []);

  const carregarConsultas = async () => {
    try {
      const response = await api.get('/consultas/minhas');
      setConsultas(response.data);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelarConsulta = async (id) => {
    if (!confirm('Tem certeza que deseja cancelar esta consulta?')) return;

    try {
      await api.patch(`/consultas/${id}/cancelar`);
      carregarConsultas();
    } catch (error) {
      alert('Erro ao cancelar consulta');
    }
  };

  // Formata a data
  const formatarData = (dataHora) => {
    const data = new Date(dataHora);
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatarHora = (dataHora) => {
    const data = new Date(dataHora);
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status com cores
  const statusConfig = {
    AGENDADA: { label: 'Agendada', cor: 'bg-blue-100 text-blue-700' },
    CONFIRMADA: { label: 'Confirmada', cor: 'bg-green-100 text-green-700' },
    CANCELADA: { label: 'Cancelada', cor: 'bg-red-100 text-red-700' },
    REALIZADA: { label: 'Realizada', cor: 'bg-gray-100 text-gray-700' },
  };

  // Filtrar consultas
  const consultasFiltradas = consultas.filter(c => {
    if (filtro === 'todas') return true;
    if (filtro === 'proximas') return ['AGENDADA', 'CONFIRMADA'].includes(c.status);
    if (filtro === 'passadas') return ['CANCELADA', 'REALIZADA'].includes(c.status);
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Minhas Consultas</h1>
            <p className="text-gray-600">Acompanhe seus agendamentos</p>
          </div>
          <Link to="/agendar" className="btn-primary">
            Nova Consulta
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {['todas', 'proximas', 'passadas'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtro === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f === 'todas' ? 'Todas' : f === 'proximas' ? 'Próximas' : 'Passadas'}
            </button>
          ))}
        </div>

        {/* Lista de consultas */}
        {consultasFiltradas.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">Nenhuma consulta encontrada</p>
            <Link to="/agendar" className="text-primary-500 hover:underline">
              Agendar primeira consulta
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {consultasFiltradas.map(consulta => (
              <div key={consulta.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      Dr(a). {consulta.medico?.nome}
                    </h3>
                    <p className="text-primary-500">{consulta.medico?.especialidade}</p>
                    <div className="mt-2 text-gray-600">
                      <p>{formatarData(consulta.dataHora)}</p>
                      <p className="font-medium">{formatarHora(consulta.dataHora)}</p>
                    </div>
                    {consulta.observacoes && (
                      <p className="mt-2 text-sm text-gray-500">
                        Obs: {consulta.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      statusConfig[consulta.status]?.cor
                    }`}>
                      {statusConfig[consulta.status]?.label}
                    </span>
                    {['AGENDADA', 'CONFIRMADA'].includes(consulta.status) && (
                      <button
                        onClick={() => cancelarConsulta(consulta.id)}
                        className="block mt-4 text-red-500 hover:underline text-sm"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MinhasConsultas;
