import { useState, useEffect } from 'react';
import api from '../../services/api';

function Configuracoes() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const diasSemana = [
    { valor: 1, nome: 'Segunda-feira' },
    { valor: 2, nome: 'Terça-feira' },
    { valor: 3, nome: 'Quarta-feira' },
    { valor: 4, nome: 'Quinta-feira' },
    { valor: 5, nome: 'Sexta-feira' },
    { valor: 6, nome: 'Sábado' },
    { valor: 0, nome: 'Domingo' },
  ];

  useEffect(() => {
    carregarHorarios();
  }, []);

  const carregarHorarios = async () => {
    try {
      const response = await api.get('/medicos/horarios');
      // Organiza os horários por dia da semana
      const horariosOrganizados = diasSemana.map(dia => {
        const horarioDia = response.data.find(h => h.diaSemana === dia.valor);
        return {
          diaSemana: dia.valor,
          nome: dia.nome,
          horaInicio: horarioDia?.horaInicio || '08:00',
          horaFim: horarioDia?.horaFim || '18:00',
          ativo: horarioDia?.ativo ?? false,
          id: horarioDia?.id,
        };
      });
      setHorarios(horariosOrganizados);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDia = (diaSemana) => {
    setHorarios(horarios.map(h =>
      h.diaSemana === diaSemana ? { ...h, ativo: !h.ativo } : h
    ));
  };

  const atualizarHorario = (diaSemana, campo, valor) => {
    setHorarios(horarios.map(h =>
      h.diaSemana === diaSemana ? { ...h, [campo]: valor } : h
    ));
  };

  const salvarHorarios = async () => {
    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      await api.post('/medicos/horarios', { horarios });
      setMensagem({ tipo: 'sucesso', texto: 'Horários salvos com sucesso!' });
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar horários' });
    } finally {
      setSalvando(false);
    }
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
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Configurações</h1>
      <p className="text-gray-600 mb-8">Configure seus horários de atendimento</p>

      {mensagem.texto && (
        <div className={`p-4 rounded-lg mb-6 ${
          mensagem.tipo === 'sucesso' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {mensagem.texto}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-6">Horários de Atendimento</h2>

        <div className="space-y-4">
          {horarios.map(horario => (
            <div
              key={horario.diaSemana}
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                horario.ativo ? 'border-primary-200 bg-primary-50' : 'border-gray-200'
              }`}
            >
              {/* Toggle do dia */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={horario.ativo}
                  onChange={() => toggleDia(horario.diaSemana)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  horario.ativo ? 'bg-primary-500' : 'bg-gray-300'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    horario.ativo ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </div>
              </label>

              {/* Nome do dia */}
              <span className={`w-36 font-medium ${
                horario.ativo ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {horario.nome}
              </span>

              {/* Horários */}
              {horario.ativo && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={horario.horaInicio}
                    onChange={(e) => atualizarHorario(horario.diaSemana, 'horaInicio', e.target.value)}
                    className="input-field w-32"
                  />
                  <span className="text-gray-500">até</span>
                  <input
                    type="time"
                    value={horario.horaFim}
                    onChange={(e) => atualizarHorario(horario.diaSemana, 'horaFim', e.target.value)}
                    className="input-field w-32"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={salvarHorarios}
          disabled={salvando}
          className="btn-primary mt-8"
        >
          {salvando ? 'Salvando...' : 'Salvar Horários'}
        </button>
      </div>
    </div>
  );
}

export default Configuracoes;
