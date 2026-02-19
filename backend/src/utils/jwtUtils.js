import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Utilitários para geração e verificação de tokens JWT
 */

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_padrao_MUDE_EM_PRODUCAO';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Gera um token JWT para um usuário
 * @param {object} payload - Dados a serem incluídos no token (id, role, etc)
 * @returns {string} Token JWT
 */
export const gerarToken = (payload) => {
  try {
    if (!payload || !payload.id) {
      throw new Error('Payload inválido: id é obrigatório');
    }

    // Criar payload do token
    const tokenPayload = {
      id: payload.id,
      nome: payload.nome,
      role: payload.role || 'medico',
      tipo: payload.tipo || 'medico',
      iat: Math.floor(Date.now() / 1000)
    };

    // Gerar token
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    return token;
  } catch (error) {
    console.error('Erro ao gerar token:', error.message);
    throw error;
  }
};

/**
 * Verifica e decodifica um token JWT
 * @param {string} token - Token JWT a ser verificado
 * @returns {object} Payload decodificado do token
 * @throws {Error} Se o token for inválido ou expirado
 */
export const verificarToken = (token) => {
  try {
    if (!token) {
      throw new Error('Token não fornecido');
    }

    // Remover prefixo 'Bearer ' se existir
    const tokenLimpo = token.replace('Bearer ', '');

    // Verificar e decodificar token
    const decoded = jwt.verify(tokenLimpo, JWT_SECRET);

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    throw error;
  }
};

/**
 * Decodifica um token sem verificar sua validade
 * Útil para debug ou obter informações do token expirado
 * @param {string} token - Token JWT
 * @returns {object} Payload decodificado (sem verificação)
 */
export const decodificarToken = (token) => {
  try {
    const tokenLimpo = token.replace('Bearer ', '');
    const decoded = jwt.decode(tokenLimpo);
    return decoded;
  } catch (error) {
    console.error('Erro ao decodificar token:', error.message);
    return null;
  }
};

/**
 * Extrai o token do header Authorization
 * @param {string} authHeader - Header Authorization da requisição
 * @returns {string|null} Token extraído ou null
 */
export const extrairToken = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
};

/**
 * Verifica se um token está expirado (sem validar assinatura)
 * @param {string} token - Token JWT
 * @returns {boolean} True se expirado
 */
export const tokenExpirado = (token) => {
  try {
    const decoded = decodificarToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const agora = Math.floor(Date.now() / 1000);
    return decoded.exp < agora;
  } catch (error) {
    return true;
  }
};

export default {
  gerarToken,
  verificarToken,
  decodificarToken,
  extrairToken,
  tokenExpirado
};
