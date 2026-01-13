import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

const CadastroMedico = () => {
  const navigate = useNavigate();
  const { registro } = useAuth();
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [cadastroSucesso, setCadastroSucesso] = useState(false);

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

      // Remover formatação
      const cpfLimpo = data.cpf.replace(/\D/g, '');
      const crmLimpo = data.crm.replace(/\D/g, '');

      const dadosMedico = {
        nome: data.nome,
        cpf: cpfLimpo,
        crm: `CRM/${data.uf} ${crmLimpo}`,
        data_nascimento: data.data_nascimento,
        plano: data.plano || 'nenhum',
        senha: data.senha,
        role: 'medico'
      };

      const resultado = await registro(dadosMedico);

      if (resultado.success) {
        setCadastroSucesso(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setErro(resultado.error || 'Erro ao realizar cadastro');
      }
    } catch (error) {
      setErro('Erro ao realizar cadastro. Tente novamente.');
      console.error('Erro:', error);
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

  const formatarCRM = (valor) => {
    return valor.replace(/\D/g, '').substring(0, 6);
  };

  if (cadastroSucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cadastro realizado com sucesso!
            </h2>
            <p className="text-gray-600 mb-4">
              Bem-vindo ao sistema Fala Doutor. Você será redirecionado para o dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="card">
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cadastro de Médico
            </h1>
            <p className="text-gray-600">
              Registre-se no sistema Fala Doutor
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            {/* CRM e UF */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="crm" className="label">
                  Número do CRM *
                </label>
                <input
                  id="crm"
                  type="text"
                  maxLength="6"
                  className={`input-field ${errors.crm ? 'input-error' : ''}`}
                  placeholder="123456"
                  {...register('crm', {
                    required: 'CRM é obrigatório',
                    minLength: {
                      value: 4,
                      message: 'CRM deve ter no mínimo 4 dígitos'
                    },
                    maxLength: {
                      value: 6,
                      message: 'CRM deve ter no máximo 6 dígitos'
                    },
                    onChange: (e) => {
                      e.target.value = formatarCRM(e.target.value);
                    }
                  })}
                />
                {errors.crm && (
                  <p className="error-message">{errors.crm.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="uf" className="label">
                  UF do CRM *
                </label>
                <select
                  id="uf"
                  className={`input-field ${errors.uf ? 'input-error' : ''}`}
                  {...register('uf', {
                    required: 'Selecione o estado'
                  })}
                >
                  <option value="">Selecione</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="BA">Bahia</option>
                  <option value="PR">Paraná</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="PE">Pernambuco</option>
                  <option value="CE">Ceará</option>
                  <option value="GO">Goiás</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="AM">Amazonas</option>
                  <option value="PA">Pará</option>
                  <option value="MA">Maranhão</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="PB">Paraíba</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="AL">Alagoas</option>
                  <option value="SE">Sergipe</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="AC">Acre</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="AP">Amapá</option>
                  <option value="TO">Tocantins</option>
                  <option value="PI">Piauí</option>
                </select>
                {errors.uf && (
                  <p className="error-message">{errors.uf.message}</p>
                )}
              </div>
            </div>

            {/* Data de Nascimento */}
            <div>
              <label htmlFor="data_nascimento" className="label">
                Data de Nascimento *
              </label>
              <input
                id="data_nascimento"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                className={`input-field ${errors.data_nascimento ? 'input-error' : ''}`}
                {...register('data_nascimento', {
                  required: 'Data de nascimento é obrigatória'
                })}
              />
              {errors.data_nascimento && (
                <p className="error-message">{errors.data_nascimento.message}</p>
              )}
            </div>

            {/* Plano */}
            <div>
              <label htmlFor="plano" className="label">
                Plano
              </label>
              <select
                id="plano"
                className="input-field"
                {...register('plano')}
              >
                <option value="nenhum">Nenhum</option>
                <option value="unimed">Unimed</option>
                <option value="amil">Amil</option>
                <option value="bradesco">Bradesco Saúde</option>
                <option value="sulamerica">SulAmérica Saúde</option>
                <option value="hapvida">Hapvida</option>
                <option value="notredame">NotreDame Intermédica</option>
                <option value="prevent">Prevent Senior</option>
              </select>
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
              to="/cadastro-publico"
              className="block text-gray-600 hover:text-gray-700 text-sm"
            >
              Sou paciente - Cadastro de paciente
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

export default CadastroMedico;
