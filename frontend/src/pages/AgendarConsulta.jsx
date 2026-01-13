import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AgendarConsulta = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [medicos, setMedicos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    carregarMedicos();
  }, []);

  const carregarMedicos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/medicos', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMedicos(response.data.data || response.data.medicos || []);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
      setErro('Erro ao carregar lista de médicos');
    }
  };

  const onSubmit = async (data) => {
    try {
      setCarregando(true);
      setErro('');
      setSucesso(false);

      const token = localStorage.getItem('token');

      const consultaData = {
        medico_id: data.medico_id,
        paciente_id: usuario.id,
        data_consulta: data.data_consulta,
        hora_consulta: data.hora_consulta,
        observacoes: data.observacoes || ''
      };

      await axios.post('http://localhost:3000/api/consultas', consultaData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSucesso(true);
      reset();

      setTimeout(() => {
        navigate('/paciente/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
      setErro(error.response?.data?.message || 'Erro ao agendar consulta');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Agendar Consulta
            </h1>
            <p className="text-sm text-gray-600">
              Marque sua consulta médica
            </p>
          </div>
          <button
            onClick={() => navigate('/paciente/dashboard')}
            className="btn-secondary"
          >
            Voltar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          {/* Mensagens */}
          {sucesso && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Consulta agendada com sucesso! Redirecionando...
            </div>
          )}

          {erro && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {erro}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Médico */}
            <div>
              <label htmlFor="medico_id" className="label">
                Médico *
              </label>
              <select
                id="medico_id"
                className={`input-field ${errors.medico_id ? 'input-error' : ''}`}
                {...register('medico_id', {
                  required: 'Selecione um médico'
                })}
              >
                <option value="">Selecione um médico</option>
                {medicos.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    Dr(a). {medico.nome} - CRM: {medico.crm}
                  </option>
                ))}
              </select>
              {errors.medico_id && (
                <p className="error-message">{errors.medico_id.message}</p>
              )}
            </div>

            {/* Data */}
            <div>
              <label htmlFor="data_consulta" className="label">
                Data da Consulta *
              </label>
              <input
                id="data_consulta"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={`input-field ${errors.data_consulta ? 'input-error' : ''}`}
                {...register('data_consulta', {
                  required: 'Data é obrigatória',
                  validate: {
                    notPast: (value) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const selectedDate = new Date(value);
                      return selectedDate >= today || 'Data não pode ser no passado';
                    }
                  }
                })}
              />
              {errors.data_consulta && (
                <p className="error-message">{errors.data_consulta.message}</p>
              )}
            </div>

            {/* Hora */}
            <div>
              <label htmlFor="hora_consulta" className="label">
                Horário *
              </label>
              <input
                id="hora_consulta"
                type="time"
                className={`input-field ${errors.hora_consulta ? 'input-error' : ''}`}
                {...register('hora_consulta', {
                  required: 'Horário é obrigatório',
                  pattern: {
                    value: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
                    message: 'Horário inválido'
                  }
                })}
              />
              {errors.hora_consulta && (
                <p className="error-message">{errors.hora_consulta.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Horário de atendimento: 08:00 às 18:00
              </p>
            </div>

            {/* Observações */}
            <div>
              <label htmlFor="observacoes" className="label">
                Observações (opcional)
              </label>
              <textarea
                id="observacoes"
                rows="4"
                className="input-field"
                placeholder="Descreva seus sintomas ou motivo da consulta..."
                {...register('observacoes')}
              />
              <p className="text-xs text-gray-500 mt-1">
                Informe sintomas, dúvidas ou motivo da consulta
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/paciente/dashboard')}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={carregando}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {carregando ? 'Agendando...' : 'Agendar Consulta'}
              </button>
            </div>
          </form>

          {/* Informações adicionais */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Informações Importantes
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Chegue com 15 minutos de antecedência</li>
              <li>• Traga documentos e exames anteriores</li>
              <li>• Em caso de cancelamento, avise com 24h de antecedência</li>
              <li>• Confirmação será enviada por email/telefone</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgendarConsulta;
