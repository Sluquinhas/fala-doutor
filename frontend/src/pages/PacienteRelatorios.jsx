import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registra os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function PacienteRelatorios() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [consultas, setConsultas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [medicoSelecionado, setMedicoSelecionado] = useState('');

  // Busca as consultas do paciente logado
  useEffect(() => {
    buscarConsultas();
  }, []);

  const buscarConsultas = async () => {
    try {
      setCarregando(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/consultas/paciente/${usuario.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Filtra apenas consultas não canceladas
      const todasConsultas = response.data.consultas || [];
      const consultasAtivas = todasConsultas.filter(c => c.status !== 'cancelada');
      setConsultas(consultasAtivas);
    } catch (erro) {
      console.error('Erro ao buscar consultas:', erro);
    } finally {
      setCarregando(false);
    }
  };

  // Pega lista de medicos unicos das consultas
  const medicosUnicos = consultas.reduce((acc, c) => {
    if (c.medico && !acc.find(m => m.id === c.medico.id)) {
      acc.push(c.medico);
    }
    return acc;
  }, []);

  // Conta consultas por mes
  const contarConsultasPorMes = () => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const contagem = Array(12).fill(0);

    const consultasFiltradas = medicoSelecionado
      ? consultas.filter(c => c.medico_id === medicoSelecionado)
      : consultas;

    consultasFiltradas.forEach(c => {
      const data = new Date(c.data_consulta);
      const mes = data.getMonth();
      contagem[mes]++;
    });

    return { meses, contagem, totalFiltrado: consultasFiltradas.length };
  };

  const { meses, contagem, totalFiltrado } = contarConsultasPorMes();

  // Dados do grafico
  const dadosGrafico = {
    labels: meses,
    datasets: [{
      label: 'Minhas Consultas por Mes',
      data: contagem,
      backgroundColor: 'rgba(34, 197, 94, 0.5)',
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 1,
    }],
  };

  // Opcoes do grafico
  const opcoesGrafico = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: medicoSelecionado
          ? `Consultas com Dr(a). ${medicosUnicos.find(m => m.id === medicoSelecionado)?.nome || 'Médico'}`
          : `Todas as Consultas de ${usuario?.nome}`,
      },
    },
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1
              className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => navigate('/paciente/dashboard')}
            >
              Fala Doutor
            </h1>
            <p className="text-sm text-gray-600">
              Bem-vindo(a), {usuario?.nome}
            </p>
          </div>
          <button onClick={handleLogout} className="btn-secondary">
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Meus Relatorios</h2>

        {carregando ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Médico:
              </label>
              <select
                value={medicoSelecionado}
                onChange={(e) => setMedicoSelecionado(e.target.value)}
                className="border rounded px-3 py-2 w-full max-w-xs"
              >
                <option value="">Todos os Médicos</option>
                {medicosUnicos.map((m) => (
                  <option key={m.id} value={m.id}>Dr(a). {m.nome}</option>
                ))}
              </select>
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-4">
              {medicoSelecionado
                ? `Total de Consultas com este médico: ${totalFiltrado}`
                : `Total de Consultas: ${consultas.length}`
              }
            </p>
            <Bar data={dadosGrafico} options={opcoesGrafico} />
          </div>
        )}

        {/* Botao para voltar */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/paciente/dashboard')}
            className="btn-secondary"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

export default PacienteRelatorios;
