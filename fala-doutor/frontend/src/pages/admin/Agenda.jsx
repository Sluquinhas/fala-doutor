import { useState, useEffect } from 'react';
import api from '../../services/api';

function Agenda() {
  const [consultas, setConsultas] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarConsultas();
  }, [dataSelecionada]);

  const carregarConsultas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/medicos/consultas', {
        params: { data: dataSelecionada }
      });
      setConsultas(response.data);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    try {
      await api.patch(`/consultas/${id}/status`, { status: novoStatus });
      carregarConsultas();
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  const formatarHora = (dataHora) => {
    return new Date(dataHora).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusConfig = {
    AGENDADA: { label: 'Agendada', cor: 'bg-blue-100 text-blue-700' },
    CONFIRMADA: { label: 'Confirmada', cor: 'bg-green-100 text-green-700' },
    CANCELADA: { label: 'Cancelada', cor: 'bg-red-100 text-red-700' },
    REALIZADA: { label: 'Realizada', cor: 'bg-gray-100 text-gray-700' },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Minha Agenda</h1>

      {/* Seletor de data */}
      <div className="mb-6">
        <input
          type="date"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      {/* Lista de consultas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      ) : consultas.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-500">Nenhuma consulta nesta data</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Horário</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Paciente</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Contato</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {consultas.map(consulta => (
                <tr key={consulta.id}>
                  <td className="px-6 py-4 font-medium">
                    {formatarHora(consulta.dataHora)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{consulta.paciente?.nome}</p>
                    {consulta.observacoes && (
                      <p className="text-sm text-gray-500">{consulta.observacoes}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p>{consulta.paciente?.telefone || '-'}</p>
                    <p className="text-gray-500">{consulta.paciente?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      statusConfig[consulta.status]?.cor
                    }`}>
                      {statusConfig[consulta.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {consulta.status === 'AGENDADA' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => atualizarStatus(consulta.id, 'CONFIRMADA')}
                          className="text-green-600 hover:underline text-sm"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => atualizarStatus(consulta.id, 'CANCELADA')}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                    {consulta.status === 'CONFIRMADA' && (
                      <button
                        onClick={() => atualizarStatus(consulta.id, 'REALIZADA')}
                        className="text-primary-500 hover:underline text-sm"
                      >
                        Marcar como Realizada
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Agenda;
