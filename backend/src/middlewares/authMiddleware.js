import { verificarToken, extrairToken } from '../utils/jwtUtils.js';
import { Medico } from '../models/index.js';
import Paciente from '../models/Paciente.js';

/**
 * Middleware de autenticação
 * Verifica se o usuário possui um token JWT válido
 * Suporta tanto médicos quanto pacientes
 */
export const autenticar = async (req, res, next) => {
  try {
    console.log('🔐 Requisição recebida:', req.method, req.originalUrl);

    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    console.log('🔐 Auth header:', authHeader ? 'presente' : 'ausente');

    const token = extrairToken(authHeader);

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Token de autenticação não fornecido'
      });
    }

    // Verificar e decodificar token
    const decoded = verificarToken(token);
    console.log('🔐 Token decodificado:', decoded);

    let usuario = null;
    // Usar 'tipo' se existir, senão verificar 'role' para determinar o tipo
    let tipoUsuario = decoded.tipo || (decoded.role === 'paciente' ? 'paciente' : 'medico');
    console.log('🔐 Tipo de usuário:', tipoUsuario);

    // Buscar usuário baseado no tipo
    if (tipoUsuario === 'paciente') {
      usuario = await Paciente.findByPk(decoded.id);

      if (!usuario) {
        return res.status(401).json({
          error: true,
          message: 'Usuário não encontrado'
        });
      }

      if (usuario.status !== 'ativo') {
        return res.status(401).json({
          error: true,
          message: 'Usuário inativo'
        });
      }

      // Adicionar informações do paciente à requisição
      req.usuario = {
        id: usuario.id,
        nome: usuario.nome,
        cpf: usuario.cpf,
        role: 'paciente',
        tipo: 'paciente',
        plano: usuario.plano
      };
    } else {
      // Buscar médico no banco para garantir que ainda existe e está ativo
      usuario = await Medico.findByPk(decoded.id);

      if (!usuario) {
        return res.status(401).json({
          error: true,
          message: 'Usuário não encontrado'
        });
      }

      if (!usuario.ativo) {
        return res.status(401).json({
          error: true,
          message: 'Usuário inativo'
        });
      }

      // Adicionar informações do médico à requisição
      req.usuario = {
        id: usuario.id,
        nome: usuario.nome,
        cpf: usuario.cpf,
        role: usuario.role,
        tipo: 'medico',
        plano: usuario.plano
      };
    }

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
 * Suporta tanto médicos quanto pacientes
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
    const tipoUsuario = decoded.tipo || (decoded.role === 'paciente' ? 'paciente' : 'medico');

    if (tipoUsuario === 'paciente') {
      const paciente = await Paciente.findByPk(decoded.id);

      if (paciente && paciente.status === 'ativo') {
        req.usuario = {
          id: paciente.id,
          nome: paciente.nome,
          cpf: paciente.cpf,
          role: 'paciente',
          tipo: 'paciente',
          plano: paciente.plano
        };
      }
    } else {
      const medico = await Medico.findByPk(decoded.id);

      if (medico && medico.ativo) {
        req.usuario = {
          id: medico.id,
          nome: medico.nome,
          cpf: medico.cpf,
          role: medico.role,
          tipo: 'medico',
          plano: medico.plano
        };
      }
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
