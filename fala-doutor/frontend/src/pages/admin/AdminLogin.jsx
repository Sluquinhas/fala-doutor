import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginMedico, isMedico } = useAuth();
  const navigate = useNavigate();

  // Se já estiver logado como médico, redireciona
  if (isMedico) {
    navigate('/admin/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await loginMedico(email, senha);
      navigate('/admin/dashboard');
    } catch (error) {
      setErro(error.response?.data?.error || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Área Médica</h1>
            <p className="text-gray-600 mt-2">Acesso restrito a profissionais</p>
          </div>

          {erro && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail profissional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="medico@clinica.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Entrando...' : 'Acessar'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 text-sm">
            Acesso exclusivo para médicos cadastrados
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
