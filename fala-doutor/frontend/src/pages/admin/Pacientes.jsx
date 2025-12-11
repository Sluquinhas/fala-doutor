import { useState, useEffect } from 'react';
import api from '../../services/api';

function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  useEffect(() => {
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    try {
      const response = await api.get('/medicos/pacientes');
      setPacientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por busca
  const pacientesFiltrados = pacientes.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.cpf.includes(busca) ||
    p.email.toLowerCase().includes(busca.toLowerCase())
  );

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Pacientes</h1>

      {/* Busca */}
      <div className="mb-6">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, CPF ou e-mail..."
          className="input-field max-w-md"
        />
      </div>

      {/* Lista de pacientes */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">CPF</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Contato</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Plano</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pacientesFiltrados.map(paciente => (
              <tr key={paciente.id}>
                <td className="px-6 py-4">
                  <p className="font-medium">{paciente.nome}</p>
                  <p className="text-sm text-gray-500">
                    Nascimento: {formatarData(paciente.dataNascimento)}
                  </p>
                </td>
                <td className="px-6 py-4 text-sm">{paciente.cpf}</td>
                <td className="px-6 py-4 text-sm">
                  <p>{paciente.telefone || '-'}</p>
                  <p className="text-gray-500">{paciente.email}</p>
                </td>
                <td className="px-6 py-4 text-sm">
                  {paciente.planoSaude || 'Particular'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setPacienteSelecionado(paciente)}
                    className="text-primary-500 hover:underline text-sm"
                  >
                    Ver detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pacientesFiltrados.length === 0 && (
          <p className="p-6 text-center text-gray-500">Nenhum paciente encontrado</p>
        )}
      </div>

      {/* Modal de detalhes do paciente */}
      {pacienteSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">Detalhes do Paciente</h2>
              <button
                onClick={() => setPacienteSelecionado(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">Nome</span>
                <p className="font-medium">{pacienteSelecionado.nome}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">CPF</span>
                <p>{pacienteSelecionado.cpf}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">E-mail</span>
                <p>{pacienteSelecionado.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Telefone</span>
                <p>{pacienteSelecionado.telefone || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Data de Nascimento</span>
                <p>{formatarData(pacienteSelecionado.dataNascimento)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Endereço</span>
                <p>{pacienteSelecionado.endereco || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Plano de Saúde</span>
                <p>{pacienteSelecionado.planoSaude || 'Particular'}</p>
              </div>
            </div>

            <button
              onClick={() => setPacienteSelecionado(null)}
              className="btn-primary w-full mt-6"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pacientes;
