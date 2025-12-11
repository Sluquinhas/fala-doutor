import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

function Agendar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [medicos, setMedicos] = useState([]);
  const [medicoSelecionado, setMedicoSelecionado] = useState(searchParams.get('medico') || '');
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  // Carrega lista de médicos
  useEffect(() => {
    const carregarMedicos = async () => {
      try {
        const response = await api.get('/medicos');
        setMedicos(response.data);
      } catch (error) {
        console.error('Erro ao carregar médicos:', error);
      }
    };
    carregarMedicos();
  }, []);

  // Carrega horários disponíveis quando médico e data são selecionados
  useEffect(() => {
    if (medicoSelecionado && dataSelecionada) {
      carregarHorarios();
    }
  }, [medicoSelecionado, dataSelecionada]);

  const carregarHorarios = async () => {
    try {
      const response = await api.get(`/consultas/horarios-disponiveis`, {
        params: { medicoId: medicoSelecionado, data: dataSelecionada }
      });
      setHorarios(response.data);
      setHorarioSelecionado('');
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setHorarios([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      await api.post('/consultas', {
        medicoId: parseInt(medicoSelecionado),
        dataHora: `${dataSelecionada}T${horarioSelecionado}:00`,
        observacoes,
      });

      setMensagem({ tipo: 'sucesso', texto: 'Consulta agendada com sucesso!' });

      // Redireciona após 2 segundos
      setTimeout(() => {
        navigate('/minhas-consultas');
      }, 2000);
    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: error.response?.data?.error || 'Erro ao agendar consulta'
      });
    } finally {
      setLoading(false);
    }
  };

  // Data mínima: hoje
  const hoje = new Date().toISOString().split('T')[0];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Agendar Consulta</h1>
        <p className="text-gray-600 mb-8">Escolha o médico, data e horário</p>

        {mensagem.texto && (
          <div className={`p-4 rounded-lg mb-6 ${
            mensagem.tipo === 'sucesso' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Passo 1: Escolher médico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. Escolha o médico
            </label>
            <select
              value={medicoSelecionado}
              onChange={(e) => setMedicoSelecionado(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Selecione um médico</option>
              {medicos.map(medico => (
                <option key={medico.id} value={medico.id}>
                  Dr(a). {medico.nome} - {medico.especialidade}
                </option>
              ))}
            </select>
          </div>

          {/* Passo 2: Escolher data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. Escolha a data
            </label>
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              min={hoje}
              className="input-field"
              required
              disabled={!medicoSelecionado}
            />
          </div>

          {/* Passo 3: Escolher horário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3. Escolha o horário
            </label>
            {horarios.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {horarios.map(horario => (
                  <button
                    key={horario}
                    type="button"
                    onClick={() => setHorarioSelecionado(horario)}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      horarioSelecionado === horario
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    {horario}
                  </button>
                ))}
              </div>
            ) : dataSelecionada ? (
              <p className="text-gray-500">Nenhum horário disponível nesta data</p>
            ) : (
              <p className="text-gray-500">Selecione uma data primeiro</p>
            )}
          </div>

          {/* Observações (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Descreva brevemente o motivo da consulta..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !horarioSelecionado}
            className="btn-primary w-full"
          >
            {loading ? 'Agendando...' : 'Confirmar Agendamento'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Agendar;
