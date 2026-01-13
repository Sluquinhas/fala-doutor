import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { pacienteService } from '../services/api';

const CadastroPublico = () => {
  const navigate = useNavigate();
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const senha = watch('senha');

  const onSubmit = async (data) => {
    try {
      setCarregando(true);
      setErro('');

      // Remover formatação do CPF e telefone
      const dadosLimpos = {
        ...data,
        cpf: data.cpf.replace(/\D/g, ''),
        telefone: data.telefone ? data.telefone.replace(/\D/g, '') : undefined
      };

      await pacienteService.cadastroPublico(dadosLimpos);
      setSucesso(true);
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao realizar cadastro');
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

  const formatarTelefone = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 10) {
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return apenasNumeros.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cadastro Realizado!
            </h2>
            <p className="text-gray-600 mb-6">
              Seu cadastro foi realizado com sucesso. Você já pode fazer login e agendar suas consultas.
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Fazer Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card">
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cadastro de Paciente
            </h1>
            <p className="text-gray-600">
              Preencha o formulário para se cadastrar
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Mensagem de erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {erro}
              </div>
            )}

            {/* Nome */}
            <div>
              <label htmlFor="nome" className="label">
                Nome Completo *
              </label>
              <input
                id="nome"
                type="text"
                className={`input-field ${errors.nome ? 'input-error' : ''}`}
                placeholder="Seu nome completo"
                {...register('nome', {
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 3,
                    message: 'Nome deve ter no mínimo 3 caracteres'
                  }
                })}
              />
              {errors.nome && (
                <p className="error-message">{errors.nome.message}</p>
              )}
            </div>

            {/* CPF */}
            <div>
              <label htmlFor="cpf" className="label">
                CPF *
              </label>
              <input
                id="cpf"
                type="text"
                maxLength="14"
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

            {/* Data de Nascimento */}
            <div>
              <label htmlFor="data_nascimento" className="label">
                Data de Nascimento *
              </label>
              <input
                id="data_nascimento"
                type="date"
                className={`input-field ${errors.data_nascimento ? 'input-error' : ''}`}
                {...register('data_nascimento', {
                  required: 'Data de nascimento é obrigatória'
                })}
              />
              {errors.data_nascimento && (
                <p className="error-message">{errors.data_nascimento.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="seu@email.com"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="label">
                Telefone
              </label>
              <input
                id="telefone"
                type="text"
                maxLength="15"
                className={`input-field ${errors.telefone ? 'input-error' : ''}`}
                placeholder="(00) 00000-0000"
                {...register('telefone', {
                  onChange: (e) => {
                    e.target.value = formatarTelefone(e.target.value);
                  }
                })}
              />
            </div>

            {/* Plano de Saúde */}
            <div>
              <label htmlFor="plano" className="label">
                Plano de Saúde *
              </label>
              <select
                id="plano"
                className={`input-field ${errors.plano ? 'input-error' : ''}`}
                {...register('plano', {
                  required: 'Plano de saúde é obrigatório'
                })}
              >
                <option value="">Selecione um plano</option>
                <option value="nenhum">Nenhum</option>
                <option value="unimed">Unimed</option>
                <option value="amil">Amil</option>
                <option value="bradesco">Bradesco Saúde</option>
                <option value="sulamerica">SulAmérica Saúde</option>
                <option value="hapvida">Hapvida</option>
                <option value="notredame">NotreDame Intermédica</option>
                <option value="prevent">Prevent Senior</option>
              </select>
              {errors.plano && (
                <p className="error-message">{errors.plano.message}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="label">
                Senha *
              </label>
              <input
                id="senha"
                type="password"
                className={`input-field ${errors.senha ? 'input-error' : ''}`}
                placeholder="Mínimo 6 caracteres"
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

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmar_senha" className="label">
                Confirmar Senha *
              </label>
              <input
                id="confirmar_senha"
                type="password"
                className={`input-field ${errors.confirmar_senha ? 'input-error' : ''}`}
                placeholder="Digite a senha novamente"
                {...register('confirmar_senha', {
                  required: 'Confirmação de senha é obrigatória',
                  validate: (value) =>
                    value === senha || 'As senhas não coincidem'
                })}
              />
              {errors.confirmar_senha && (
                <p className="error-message">{errors.confirmar_senha.message}</p>
              )}
            </div>

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={carregando}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {carregando ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          {/* Links adicionais */}
          <div className="mt-6 text-center space-y-2">
            <Link
              to="/login"
              className="block text-blue-600 hover:text-blue-700 text-sm"
            >
              Já tenho cadastro - Fazer login
            </Link>
            <Link
              to="/cadastro-medico"
              className="block text-gray-600 hover:text-gray-700 text-sm"
            >
              Sou médico - Cadastro de médico
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

export default CadastroPublico;
