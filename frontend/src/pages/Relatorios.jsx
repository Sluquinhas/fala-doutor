import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pacienteService, medicoService } from '../services/api';
import './Relatorios.css';
import { consultaService } from '../services/api';
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

function Relatorios() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();

  // Estados do componente
  const [abaAtiva, setAbaAtiva] = useState('pacientes');
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [consultas, setConsultas] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState('');

  // Executa automaticamente quando o componente carrega
  useEffect(() => {
    buscarDados();
  }, [location.pathname]);

  // Função que busca pacientes e médicos da API
  const buscarDados = async () => {
    console.log('>>> BuscarDados foi chamado!');
    try {
      setCarregando(true);

      // Busca pacientes e médicos ao mesmo tempo
      const [resPacientes, resMedicos, resConsultas] = await Promise.all([
        pacienteService.listar(),
        medicoService.listar(),
        consultaService.listar({medico_id: usuario.id})
      ]);

      // Vamos ver o que a API retorna
      console.log("Resposta completa Pacientes: ", resPacientes);
      console.log("Resposta completa Medicos: ", resMedicos);
      
      // Salva os dados nos estados
      setPacientes(resPacientes.data || []);
      setMedicos(resMedicos.data || []);
      // Filtra apenas consultas não canceladas
      const todasConsultas = resConsultas.consultas || [];
      const consultasAtivas = todasConsultas.filter(c => c.status !== 'cancelada');
      setConsultas(consultasAtivas)
    } catch (erro) {
      console.error('Erro:', erro);
      alert('Erro ao carregar relatórios');
    } finally {
      setCarregando(false);
    }
  };
  // Conta consultas por mes para o paciente selecionado
  const contarConsultasPorMes = () => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const contagem = Array(12).fill(0);

    const consultasFiltradas = pacienteSelecionado
      ? consultas.filter(c => c.paciente_id === pacienteSelecionado)
      : consultas;

    consultasFiltradas.forEach(c => {
      const data = new Date(c.data_consulta);
      const mes = data.getMonth();
      contagem[mes]++;
    });

      return { meses, contagem};
    };

    const {meses, contagem} = contarConsultasPorMes();

  // Dados do grafico
  const dadosGrafico = {
    labels: meses,
    datasets: [{
      label: 'Consultas por Mês',
      data: contagem,
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
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
        text: pacienteSelecionado
          ? `Consultas de ${pacientes.find(p => p.id === pacienteSelecionado)?.nome || 'Paciente'}`
          : 'Todas as Consultas',
      },
    },
  };

  // Formata data para padrão brasileiro
  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  // Formata nome do plano de saúde
  const formatarPlano = (plano) => {
    const planos = {
      'nenhum': 'Nenhum',
      'unimed': 'Unimed',
      'amil': 'Amil',
      'bradesco': 'Bradesco',
      'sulamerica': 'SulAmérica',
      'hapvida': 'Hapvida',
      'notredame': 'Notre Dame',
      'prevent': 'Prevent Senior'
    };
    return planos[plano] || plano || 'Não informado';
  };

  // Função de logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
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
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Relatórios</h2>

        {/* Conteúdo das Abas */}
        {carregando ? (
          <div className="carregando">
            <p>⏳ Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* Abas - só aparecem depois de carregar */}
            <div className="tabs">
              <button
                className={`tab ${abaAtiva === 'pacientes' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('pacientes')}
              >
                📋 Pacientes ({pacientes.length})
              </button>

              <button
                className={`tab ${abaAtiva === 'medicos' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('medicos')}
              >
                👨‍⚕️ Médicos ({medicos.length})
              </button>

              <button
                className={`tab ${abaAtiva === 'graficos' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('graficos')}
              >
                📊 Gráficos
              </button>
            </div>

          <div className="tab-content">
            {/* Tabela de Pacientes */}
            {abaAtiva === 'pacientes' && (
              <div className="tabela-wrapper">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Lista de Pacientes Cadastrados
                  </h3>
                  <span className="text-sm text-gray-600">
                    Total: {pacientes.length} paciente(s)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="tabela-relatorio">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Data Nascimento</th>
                        <th>Plano de Saúde</th>
                        <th>Tipo</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pacientes.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="sem-dados">
                            📭 Nenhum paciente cadastrado
                          </td>
                        </tr>
                      ) : (
                        pacientes.map((paciente) => (
                          <tr key={paciente.id}>
                            <td className="font-medium">{paciente.nome}</td>
                            <td>{paciente.cpf}</td>
                            <td>{formatarData(paciente.data_nascimento)}</td>
                            <td>{formatarPlano(paciente.plano)}</td>
                            <td>
                              <span className='badge paciente'>
                                👤 Paciente
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${paciente.status || 'ativo'}`}>
                                {paciente.status || 'ativo'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tabela de Médicos */}
            {abaAtiva === 'medicos' && (
              <div className="tabela-wrapper">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Lista de Médicos Cadastrados
                  </h3>
                  <span className="text-sm text-gray-600">
                    Total: {medicos.length} médico(s)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="tabela-relatorio">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>CRM</th>
                        <th>Data Nascimento</th>
                        <th>Plano de Saúde</th>
                        <th>Tipo</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicos.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="sem-dados">
                            📭 Nenhum médico cadastrado
                          </td>
                        </tr>
                      ) : (
                        medicos.map((medico) => (
                          <tr key={medico.id}>
                            <td className="font-medium">{medico.nome}</td>
                            <td>{medico.cpf}</td>
                            <td>{medico.crm}</td>
                            <td>{formatarData(medico.data_nascimento)}</td>
                            <td>{formatarPlano(medico.plano)}</td>
                            <td>
                              <span className={`badge ${medico.role}`}>
                                {medico.role === 'admin' ? '👑 Admin' : '👨‍⚕️ Médico'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${medico.ativo ? 'ativo' : 'inativo'}`}>
                                {medico.ativo ? '✅ Ativo' : '❌ Inativo'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Gráfico de Consultas */}
            {abaAtiva === 'graficos' && (
              <div className="bg-white p-6 rounded-lg shadow">
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
                <p className="text-lg font-semibold text-gray-700 mb-4">
                  Total de Consultas: {consultas.length}
                </p>
                <Bar data={dadosGrafico} options={opcoesGrafico}/>
              </div>
            )}
          </div>
          </>
        )}

        {/* Botão para voltar */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

export default Relatorios;
