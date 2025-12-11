const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { gerarToken } = require('../utils/jwt');

/**
 * Cadastro de paciente
 * POST /api/auth/paciente/cadastro
 */
const cadastroPaciente = async (req, res) => {
  try {
    const { nome, cpf, email, senha, telefone, dataNascimento } = req.body;

    // Verifica se já existe paciente com este email ou CPF
    const pacienteExistente = await prisma.paciente.findFirst({
      where: {
        OR: [{ email }, { cpf }],
      },
    });

    if (pacienteExistente) {
      return res.status(400).json({
        error: pacienteExistente.email === email
          ? 'E-mail já cadastrado'
          : 'CPF já cadastrado',
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Cria o paciente
    const paciente = await prisma.paciente.create({
      data: {
        nome,
        cpf,
        email,
        senhaHash,
        telefone,
        dataNascimento: new Date(dataNascimento),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        dataNascimento: true,
      },
    });

    // Gera o token
    const token = gerarToken({ id: paciente.id, email: paciente.email }, 'paciente');

    res.status(201).json({
      message: 'Cadastro realizado com sucesso',
      token,
      paciente,
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro ao realizar cadastro' });
  }
};

/**
 * Login de paciente
 * POST /api/auth/paciente/login
 */
const loginPaciente = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Busca o paciente
    const paciente = await prisma.paciente.findUnique({
      where: { email },
    });

    if (!paciente) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, paciente.senhaHash);

    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    // Gera o token
    const token = gerarToken({ id: paciente.id, email: paciente.email }, 'paciente');

    // Retorna sem a senha
    const { senhaHash, ...pacienteSemSenha } = paciente;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      paciente: pacienteSemSenha,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
};

/**
 * Login de médico
 * POST /api/auth/medico/login
 */
const loginMedico = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Busca o médico
    const medico = await prisma.medico.findUnique({
      where: { email },
    });

    if (!medico || !medico.ativo) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, medico.senhaHash);

    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    // Gera o token
    const token = gerarToken(
      { id: medico.id, email: medico.email, isAdmin: medico.isAdmin },
      'medico'
    );

    // Retorna sem a senha
    const { senhaHash, ...medicoSemSenha } = medico;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      medico: medicoSemSenha,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
};

module.exports = {
  cadastroPaciente,
  loginPaciente,
  loginMedico,
};
