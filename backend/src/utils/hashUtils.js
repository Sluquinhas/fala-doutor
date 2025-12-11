import bcrypt from 'bcryptjs';

/**
 * Utilitários para hash e validação de senhas usando bcrypt
 */

const SALT_ROUNDS = 10;

/**
 * Gera um hash da senha usando bcrypt
 * @param {string} senha - Senha em texto plano
 * @returns {Promise<string>} Hash da senha
 */
export const hashSenha = async (senha) => {
  try {
    if (!senha || typeof senha !== 'string') {
      throw new Error('Senha inválida');
    }

    if (senha.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    const hash = await bcrypt.hash(senha, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Erro ao gerar hash da senha:', error.message);
    throw error;
  }
};

/**
 * Compara uma senha em texto plano com um hash
 * @param {string} senha - Senha em texto plano
 * @param {string} hash - Hash armazenado no banco
 * @returns {Promise<boolean>} True se a senha corresponde ao hash
 */
export const compararSenha = async (senha, hash) => {
  try {
    if (!senha || !hash) {
      return false;
    }

    const match = await bcrypt.compare(senha, hash);
    return match;
  } catch (error) {
    console.error('Erro ao comparar senha:', error.message);
    return false;
  }
};

/**
 * Valida se a senha atende aos requisitos mínimos de segurança
 * @param {string} senha - Senha a ser validada
 * @returns {object} { valida: boolean, mensagem: string }
 */
export const validarSenha = (senha) => {
  if (!senha) {
    return { valida: false, mensagem: 'Senha é obrigatória' };
  }

  if (senha.length < 6) {
    return { valida: false, mensagem: 'Senha deve ter no mínimo 6 caracteres' };
  }

  if (senha.length > 100) {
    return { valida: false, mensagem: 'Senha muito longa (máximo 100 caracteres)' };
  }

  // Adicionar mais validações se necessário:
  // - Letra maiúscula
  // - Letra minúscula
  // - Número
  // - Caractere especial

  return { valida: true, mensagem: 'Senha válida' };
};

export default {
  hashSenha,
  compararSenha,
  validarSenha
};
