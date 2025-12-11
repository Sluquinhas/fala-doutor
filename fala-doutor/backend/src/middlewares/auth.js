const { verificarToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

/**
 * Middleware que verifica se o usuário está autenticado
 */
const autenticado = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verificarToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }

  req.usuario = decoded;
  next();
};

/**
 * Middleware que verifica se o usuário é um paciente autenticado
 */
const autenticarPaciente = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verificarToken(token);

  if (!decoded || decoded.tipo !== 'paciente') {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }

  // Busca o paciente no banco
  const paciente = await prisma.paciente.findUnique({
    where: { id: decoded.id },
  });

  if (!paciente) {
    return res.status(401).json({ error: 'Paciente não encontrado' });
  }

  req.paciente = paciente;
  next();
};

/**
 * Middleware que verifica se o usuário é um médico autenticado
 */
const autenticarMedico = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verificarToken(token);

  if (!decoded || decoded.tipo !== 'medico') {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }

  // Busca o médico no banco
  const medico = await prisma.medico.findUnique({
    where: { id: decoded.id },
  });

  if (!medico || !medico.ativo) {
    return res.status(401).json({ error: 'Médico não encontrado ou inativo' });
  }

  req.medico = medico;
  next();
};

/**
 * Middleware que verifica se o médico é admin
 */
const autenticarAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verificarToken(token);

  if (!decoded || decoded.tipo !== 'medico') {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }

  const medico = await prisma.medico.findUnique({
    where: { id: decoded.id },
  });

  if (!medico || !medico.ativo || !medico.isAdmin) {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }

  req.medico = medico;
  next();
};

module.exports = {
  autenticado,
  autenticarPaciente,
  autenticarMedico,
  autenticarAdmin,
};
