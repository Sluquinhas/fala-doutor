import { verificarToken, extrairToken } from '../utils/jwtUtils.js';
import { Medico } from '../models/index.js';

/**
 * Middleware de autenticação
 * Verifica se o usuário possui um token JWT válido
 */
export const autenticar = async (req, res, next) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    const token = extrairToken(authHeader);

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Token de autenticação não fornecido'
      });
    }

    // Verificar e decodificar token
    const decoded = verificarToken(token);

    // Buscar médico no banco para garantir que ainda existe e está ativo
    const medico = await Medico.findByPk(decoded.id);

    if (!medico) {
      return res.status(401).json({
        error: true,
        message: 'Usuário não encontrado'
      });
    }

    if (!medico.ativo) {
      return res.status(401).json({
        error: true,
        message: 'Usuário inativo'
      });
    }

    // Adicionar informações do usuário à requisição
    req.usuario = {
      id: medico.id,
      nome: medico.nome,
      cpf: medico.cpf,
      role: medico.role,
      plano: medico.plano
    };

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error.message);

    if (error.message === 'Token expirado') {
      return res.status(401).json({
        error: true,
        message: 'Token expirado. Faça login novamente.'
      });
    }

    if (error.message === 'Token inválido') {
      return res.status(401).json({
        error: true,
        message: 'Token inválido'
      });
    }

    return res.status(401).json({
      error: true,
      message: 'Falha na autenticação'
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Adiciona informações do usuário se o token for fornecido, mas não bloqueia se não for
 */
export const autenticarOpcional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extrairToken(authHeader);

    if (!token) {
      // Sem token, continua sem adicionar usuário
      return next();
    }

    const decoded = verificarToken(token);
    const medico = await Medico.findByPk(decoded.id);

    if (medico && medico.ativo) {
      req.usuario = {
        id: medico.id,
        nome: medico.nome,
        cpf: medico.cpf,
        role: medico.role,
        plano: medico.plano
      };
    }

    next();
  } catch (error) {
    // Em caso de erro, apenas continua sem autenticação
    next();
  }
};

export default {
  autenticar,
  autenticarOpcional
};
