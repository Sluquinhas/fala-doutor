import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setCarregando(true);
      setErro('');

      // Remover formatação do CPF (manter apenas números)
      const cpfLimpo = data.cpf.replace(/\D/g, '');

      const resultado = await login(cpfLimpo, data.senha);

      if (resultado.success) {
        // Obter dados do usuário do localStorage
        const usuarioStr = localStorage.getItem('usuario');
        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

        // Redirecionar baseado no tipo de usuário
        if (usuario?.tipo === 'paciente' || usuario?.role === 'paciente') {
          navigate('/paciente/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErro(resultado.error || 'Erro ao fazer login');
      }
    } catch (error) {
      setErro('Erro ao fazer login. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const formatarCPF = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    return apenasNumeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card">
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Fala Doutor
            </h1>
            <p className="text-gray-600">
              Sistema de Gestão Médica
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
            {/* Mensagem de erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {erro}
              </div>
            )}

            {/* CPF */}
            <div>
              <label htmlFor="cpf" className="label">
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                maxLength="14"
                autoComplete="new-password"
                className={`input-field ${errors.cpf ? 'input-error' : ''}`}
                placeholder="000.000.000-00"
                {...register('cpf', {
                  required: 'CPF é obrigatório',
                  pattern: {
                    value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                    message: 'CPF inválido'
                  },
                  onChange: (e) => {
                    e.target.value = formatarCPF(e.target.value);
                  }
                })}
              />
              {errors.cpf && (
                <p className="error-message">{errors.cpf.message}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="label">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="new-password"
                className={`input-field ${errors.senha ? 'input-error' : ''}`}
                placeholder="Sua senha"
                {...register('senha', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter no mínimo 6 caracteres'
                  }
                })}
              />
              {errors.senha && (
                <p className="error-message">{errors.senha.message}</p>
              )}
            </div>

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={carregando}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Links adicionais */}
          <div className="mt-6 text-center space-y-2">
            <Link
              to="/cadastro-publico"
              className="block text-blue-600 hover:text-blue-700 text-sm"
            >
              Sou paciente e quero me cadastrar
            </Link>
            <Link
              to="/cadastro-medico"
              className="block text-gray-600 hover:text-gray-700 text-sm"
            >
              Sou médico e quero me cadastrar
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Sistema de Gestão Médica © 2024
        </p>
      </div>
    </div>
  );
};

export default Login;
