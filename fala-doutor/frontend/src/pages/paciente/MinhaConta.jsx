import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

function MinhaConta() {
  const { paciente } = useAuth();
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nome: paciente?.nome || '',
    telefone: paciente?.telefone || '',
    endereco: paciente?.endereco || '',
    planoSaude: paciente?.planoSaude || '',
  });
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/pacientes/perfil', formData);
      setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' });
      setEditando(false);
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao atualizar perfil' });
    }
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Minha Conta</h1>

        {mensagem.texto && (
          <div className={`p-4 rounded-lg mb-6 ${
            mensagem.tipo === 'sucesso' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {mensagem.texto}
          </div>
        )}

        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Dados Pessoais</h2>
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="text-primary-500 hover:underline"
              >
                Editar
              </button>
            )}
          </div>

          {editando ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plano de Saúde
                </label>
                <input
                  type="text"
                  name="planoSaude"
                  value={formData.planoSaude}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Unimed, Bradesco Saúde..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary">
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">Nome</span>
                <p className="font-medium">{paciente?.nome}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">E-mail</span>
                <p className="font-medium">{paciente?.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">CPF</span>
                <p className="font-medium">{paciente?.cpf}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Telefone</span>
                <p className="font-medium">{paciente?.telefone || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Endereço</span>
                <p className="font-medium">{paciente?.endereco || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Plano de Saúde</span>
                <p className="font-medium">{paciente?.planoSaude || 'Não informado'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MinhaConta;
