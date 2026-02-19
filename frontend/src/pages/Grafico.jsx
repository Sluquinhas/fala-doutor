import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { consultaService, pacienteService } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
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

function Grafico() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  // Estados do componente
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Busca dados quando o componente carrega
  useEffect(() => {
    buscarDados();
  }, []);

  // Funcao que busca pacientes e consultas
  const buscarDados = async () => {
    try {
      setCarregando(true);
      const [resPacientes, resConsultas] = await Promise.all([
        pacienteService.listar(),
        consultaService.listar()
      ]);
      setPacientes(resPacientes.data || []);
      setConsultas(resConsultas.data || []);
    } catch (erro) {
      console.error('Erro:', erro);
      alert('Erro ao carregar dados');
    } finally {
      setCarregando(false);
    }
  };

  // Funcao de logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Conta consultas por mes para o paciente selecionado
  const contarConsultasPorMes = () => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const contagem = new Array(12).fill(0);

    // Filtra consultas do paciente selecionado
    const consultasFiltradas = pacienteSelecionado
      ? consultas.filter(c => c.paciente_id === parseInt(pacienteSelecionado))
      : consultas;

    // Conta por mes
    consultasFiltradas.forEach(consulta => {
      const data = new Date(consulta.data);
      const mes = data.getMonth();
      contagem[mes]++;
    });

    return { meses, contagem };
  };

  const { meses, contagem } = contarConsultasPorMes();

  // Dados do grafico
  const dadosGrafico = {
    labels: meses,
    datasets: [
      {
        label: 'Consultas por Mes',
        data: contagem,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  // Opcoes do grafico
  const opcoesGrafico = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: pacienteSelecionado
          ? `Consultas de ${pacientes.find(p => p.id === parseInt(pacienteSelecionado))?.nome || 'Paciente'}`
          : 'Todas as Consultas',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabecalho */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1
                className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600"
                onClick={() => navigate('/dashboard')}
              >
                Fala Doutor
              </h1>
              <p className="text-sm text-gray-600">
                Bem-vindo, Dr(a). {usuario?.nome}
              </p>
            </div>
            <button onClick={handleLogout} className="btn-secondary">
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteudo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Grafico de Consultas</h2>

        {carregando ? (
          <p>Carregando...</p>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            {/* Seletor de Paciente */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Paciente:
              </label>
              <select
                value={pacienteSelecionado}
                onChange={(e) => setPacienteSelecionado(e.target.value)}
                className="border rounded px-3 py-2 w-full max-w-xs"
              >
                <option value="">Todos os Pacientes</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            {/* Grafico */}
            <Bar data={dadosGrafico} options={opcoesGrafico} />
          </div>
        )}

        {/* Botao Voltar */}
        <div className="mt-6">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Voltar ao Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

export default Grafico;
