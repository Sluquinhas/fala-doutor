import { validationResult } from 'express-validator';

/**
 * Middleware para processar resultados de validação do express-validator
 * Retorna os erros de validação em formato padronizado
 */
export const tratarErrosValidacao = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errosFormatados = errors.array().map(error => ({
      campo: error.path || error.param,
      mensagem: error.msg,
      valor: error.value
    }));

    return res.status(400).json({
      error: true,
      message: 'Erro de validação',
      erros: errosFormatados
    });
  }

  next();
};

/**
 * Validador de CPF
 * @param {string} cpf - CPF a ser validado (apenas números)
 * @returns {boolean} True se o CPF é válido
 */
export const validarCPF = (cpf) => {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }

  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpfLimpo)) {
    return false;
  }

  // Validação dos dígitos verificadores
  let soma = 0;
  let resto;

  // Valida 1º dígito
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

  // Valida 2º dígito
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

  return true;
};

/**
 * Valida formato de data (YYYY-MM-DD)
 * @param {string} data - Data a ser validada
 * @returns {boolean} True se a data é válida
 */
export const validarData = (data) => {
  if (!data) return false;

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(data)) return false;

  const date = new Date(data);
  return date instanceof Date && !isNaN(date);
};

/**
 * Valida se a data é anterior à data atual
 * @param {string} data - Data a ser validada (YYYY-MM-DD)
 * @returns {boolean} True se a data é anterior à atual
 */
export const dataAnteriorAtual = (data) => {
  if (!validarData(data)) return false;

  const dataFornecida = new Date(data);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return dataFornecida < hoje;
};

/**
 * Sanitiza CPF removendo caracteres não numéricos
 * @param {string} cpf - CPF a ser sanitizado
 * @returns {string} CPF apenas com números
 */
export const sanitizarCPF = (cpf) => {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
};

/**
 * Sanitiza telefone removendo caracteres não numéricos
 * @param {string} telefone - Telefone a ser sanitizado
 * @returns {string} Telefone apenas com números
 */
export const sanitizarTelefone = (telefone) => {
  if (!telefone) return '';
  return telefone.replace(/\D/g, '');
};

export default {
  tratarErrosValidacao,
  validarCPF,
  validarData,
  dataAnteriorAtual,
  sanitizarCPF,
  sanitizarTelefone
};
