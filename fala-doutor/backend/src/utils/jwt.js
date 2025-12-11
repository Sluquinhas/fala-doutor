const jwt = require('jsonwebtoken');

/**
 * Gera um token JWT
 * @param {Object} payload - Dados a serem incluídos no token
 * @param {string} tipo - Tipo do usuário ('paciente' ou 'medico')
 */
const gerarToken = (payload, tipo) => {
  return jwt.sign(
    { ...payload, tipo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Verifica e decodifica um token JWT
 * @param {string} token - Token a ser verificado
 */
const verificarToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { gerarToken, verificarToken };
