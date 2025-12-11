import { Medico } from '../models/index.js';
import Paciente from '../models/Paciente.js';
import { hashSenha, compararSenha, validarSenha } from '../utils/hashUtils.js';
import { gerarToken } from '../utils/jwtUtils.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Controller de Autenticação
 * Gerencia login e registro de médicos
 */

/**
 * Login de médico ou paciente
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { cpf, senha } = req.body;

    // Validar campos obrigatórios
    if (!cpf || !senha) {
      return res.status(400).json({
        error: true,
        message: 'CPF e senha são obrigatórios'
      });
    }

    // Buscar primeiro como médico
    let usuario = await Medico.findOne({ where: { cpf } });
    let tipoUsuario = 'medico';
    let role = null;

    // Se não for médico, buscar como paciente
    if (!usuario) {
      usuario = await Paciente.findOne({ where: { cpf } });
      tipoUsuario = 'paciente';
    }

    if (!usuario) {
      // Registrar tentativa de login falhada (não especificar se é CPF ou senha)
      await AuditLog.registrar({
        usuario_id: 'desconhecido',
        usuario_nome: 'Tentativa de login',
        acao: 'LOGIN_FAILED',
        entidade: 'Auth',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        status: 'falha',
        mensagem_erro: 'CPF não encontrado',
        metadata: { cpf }
      });

      return res.status(401).json({
        error: true,
        message: 'CPF ou senha inválidos'
      });
    }

    // Verificar se a senha existe (pacientes podem não ter senha definida)
    if (!usuario.senha) {
      return res.status(401).json({
        error: true,
        message: 'Usuário sem senha cadastrada. Entre em contato com o administrador.'
      });
    }

    // Verificar se o usuário está ativo (apenas para médicos)
    if (tipoUsuario === 'medico' && !usuario.ativo) {
      return res.status(401).json({
        error: true,
        message: 'Usuário inativo. Entre em contato com o administrador.'
      });
    }

    // Verificar se o paciente está ativo
    if (tipoUsuario === 'paciente' && usuario.status !== 'ativo') {
      return res.status(401).json({
        error: true,
        message: 'Paciente inativo. Entre em contato com o administrador.'
      });
    }

    // Comparar senha
    const senhaCorreta = await compararSenha(senha, usuario.senha);

    if (!senhaCorreta) {
      // Registrar tentativa de login falhada
      await AuditLog.registrar({
        usuario_id: usuario.id,
        usuario_nome: usuario.nome,
        acao: 'LOGIN_FAILED',
        entidade: 'Auth',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        status: 'falha',
        mensagem_erro: 'Senha incorreta'
      });

      return res.status(401).json({
        error: true,
        message: 'CPF ou senha inválidos'
      });
    }

    // Definir role baseado no tipo de usuário
    if (tipoUsuario === 'medico') {
      role = usuario.role; // médicos têm o campo role
    } else {
      role = 'paciente'; // pacientes sempre têm role 'paciente'
    }

    // Gerar token JWT
    const token = gerarToken({
      id: usuario.id,
      nome: usuario.nome,
      role: role,
      tipo: tipoUsuario
    });

    // Registrar login bem-sucedido
    await AuditLog.registrar({
      usuario_id: usuario.id,
      usuario_nome: usuario.nome,
      acao: 'LOGIN',
      entidade: 'Auth',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      status: 'sucesso',
      metadata: { tipo_usuario: tipoUsuario }
    });

    // Preparar dados do usuário para retorno (sem a senha)
    const usuarioResposta = {
      id: usuario.id,
      nome: usuario.nome,
      cpf: usuario.cpf,
      plano: usuario.plano,
      role: role,
      tipo: tipoUsuario
    };

    // Adicionar campos específicos de cada tipo
    if (tipoUsuario === 'medico') {
      usuarioResposta.crm = usuario.crm;
    } else {
      usuarioResposta.email = usuario.email;
      usuarioResposta.telefone = usuario.telefone;
      usuarioResposta.status = usuario.status;
    }

    // Retornar token e informações do usuário
    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      usuario: usuarioResposta
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao realizar login'
    });
  }
};

/**
 * Registro de novo médico (apenas para admin ou primeiro acesso)
 * POST /api/auth/registro
 */
export const registro = async (req, res) => {
  try {
    const { nome, cpf, crm, data_nascimento, plano, senha, role } = req.body;

    // Validar campos obrigatórios
    if (!nome || !cpf || !crm || !data_nascimento || !senha) {
      return res.status(400).json({
        error: true,
        message: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    // Validar senha
    const senhaValidacao = validarSenha(senha);
    if (!senhaValidacao.valida) {
      return res.status(400).json({
        error: true,
        message: senhaValidacao.mensagem
      });
    }

    // Verificar se CPF já existe
    const cpfExiste = await Medico.findOne({ where: { cpf } });
    if (cpfExiste) {
      return res.status(400).json({
        error: true,
        message: 'CPF já cadastrado'
      });
    }

    // Verificar se CRM já existe
    const crmExiste = await Medico.findOne({ where: { crm } });
    if (crmExiste) {
      return res.status(400).json({
        error: true,
        message: 'CRM já cadastrado'
      });
    }

    // Hash da senha
    const senhaHash = await hashSenha(senha);

    // Criar médico
    const novoMedico = await Medico.create({
      nome,
      cpf,
      crm,
      data_nascimento,
      plano: plano || 'básico',
      senha: senhaHash,
      role: role || 'medico',
      ativo: true
    });

    // Registrar criação no log de auditoria
    await AuditLog.registrar({
      usuario_id: novoMedico.id,
      usuario_nome: novoMedico.nome,
      acao: 'CREATE',
      entidade: 'Medico',
      entidade_id: novoMedico.id,
      dados_novos: {
        nome: novoMedico.nome,
        cpf: novoMedico.cpf,
        crm: novoMedico.crm,
        plano: novoMedico.plano,
        role: novoMedico.role
      },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      status: 'sucesso'
    });

    // Gerar token para login automático
    const token = gerarToken({
      id: novoMedico.id,
      nome: novoMedico.nome,
      role: novoMedico.role
    });

    return res.status(201).json({
      success: true,
      message: 'Médico cadastrado com sucesso',
      token,
      usuario: {
        id: novoMedico.id,
        nome: novoMedico.nome,
        cpf: novoMedico.cpf,
        crm: novoMedico.crm,
        plano: novoMedico.plano,
        role: novoMedico.role
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);

    // Tratar erros de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: true,
        message: 'Erro de validação',
        erros: error.errors.map(e => ({ campo: e.path, mensagem: e.message }))
      });
    }

    return res.status(500).json({
      error: true,
      message: 'Erro ao cadastrar médico'
    });
  }
};

/**
 * Verifica informações do usuário autenticado (médico ou paciente)
 * GET /api/auth/me
 */
export const me = async (req, res) => {
  try {
    // req.usuario já foi preenchido pelo middleware de autenticação
    const tipoUsuario = req.usuario.tipo || 'medico'; // padrão para compatibilidade
    let usuario = null;

    if (tipoUsuario === 'medico') {
      usuario = await Medico.findByPk(req.usuario.id, {
        attributes: { exclude: ['senha'] }
      });
    } else {
      usuario = await Paciente.findByPk(req.usuario.id, {
        attributes: { exclude: ['senha'] }
      });
    }

    if (!usuario) {
      return res.status(404).json({
        error: true,
        message: 'Usuário não encontrado'
      });
    }

    // Preparar resposta baseada no tipo de usuário
    const usuarioResposta = {
      id: usuario.id,
      nome: usuario.nome,
      cpf: usuario.cpf,
      data_nascimento: usuario.data_nascimento,
      plano: usuario.plano,
      tipo: tipoUsuario,
      created_at: usuario.created_at,
      updated_at: usuario.updated_at
    };

    if (tipoUsuario === 'medico') {
      usuarioResposta.crm = usuario.crm;
      usuarioResposta.role = usuario.role;
      usuarioResposta.ativo = usuario.ativo;
    } else {
      usuarioResposta.email = usuario.email;
      usuarioResposta.telefone = usuario.telefone;
      usuarioResposta.status = usuario.status;
      usuarioResposta.analise = usuario.analise;
      usuarioResposta.role = 'paciente';
    }

    return res.status(200).json({
      success: true,
      usuario: usuarioResposta
    });
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar informações do usuário'
    });
  }
};

export default {
  login,
  registro,
  me
};
