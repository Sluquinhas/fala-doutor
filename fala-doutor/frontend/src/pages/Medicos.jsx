import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Medicos() {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');

  useEffect(() => {
    carregarMedicos();
  }, []);

  const carregarMedicos = async () => {
    try {
      const response = await api.get('/medicos');
      setMedicos(response.data);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lista de especialidades únicas
  const especialidades = [...new Set(medicos.map(m => m.especialidade))];

  // Médicos filtrados
  const medicosFiltrados = filtroEspecialidade
    ? medicos.filter(m => m.especialidade === filtroEspecialidade)
    : medicos;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Nossos Médicos</h1>
          <p className="text-gray-600">
            Conheça nossa equipe de profissionais qualificados
          </p>
        </div>

        {/* Filtro por especialidade */}
        <div className="mb-8">
          <select
            value={filtroEspecialidade}
            onChange={(e) => setFiltroEspecialidade(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">Todas as especialidades</option>
            {especialidades.map(esp => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
        </div>

        {/* Lista de médicos */}
        {medicosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum médico encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicosFiltrados.map(medico => (
              <div key={medico.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-primary-500 font-bold">
                      {medico.nome.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-lg text-gray-800">
                      Dr(a). {medico.nome}
                    </h3>
                    <p className="text-primary-500">{medico.especialidade}</p>
                  </div>
                </div>
                {medico.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {medico.bio}
                  </p>
                )}
                <p className="text-gray-500 text-sm mb-4">
                  CRM: {medico.crm}
                </p>
                <Link
                  to={`/agendar?medico=${medico.id}`}
                  className="btn-primary w-full text-center block"
                >
                  Agendar Consulta
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Medicos;
