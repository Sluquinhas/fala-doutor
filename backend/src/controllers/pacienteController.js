import Paciente from '../models/Paciente.js';
import AuditLog from '../models/AuditLog.js';
import { hashSenha } from '../utils/hashUtils.js';

/**
 * Controller de Pacientes
 * CRUD completo + cadastro público
 */

/**
 * Cadastro público de paciente (sem autenticação)
 * POST /api/pacientes/publico/cadastro
 */
export const cadastroPublico = async (req, res) => {
  try {
    const { nome, cpf, data_nascimento, email, telefone, senha } = req.body;

    // Verificar se CPF já existe
    const cpfExiste = await Paciente.findOne({ cpf });
    if (cpfExiste) {
      return res.status(400).json({
        error: true,
        message: 'CPF já cadastrado'
      });
    }

    // Hash da senha se fornecida
    let senhaHash = null;
    if (senha) {
      senhaHash = await hashSenha(senha);
    }

    // Criar paciente com status ativo
    const novoPaciente = await Paciente.create({
      nome,
      cpf,
      data_nascimento,
      email,
      telefone,
      senha: senhaHash,
      plano: req.body.plano || 'nenhum',
      status: 'ativo'
    });

    // Registrar no log de auditoria (sem usuário autenticado)
    await AuditLog.registrar({
      usuario_id: 'publico',
      usuario_nome: 'Cadastro Público',
      acao: 'CREATE',
      entidade: 'Paciente',
      entidade_id: novoPaciente._id,
      dados_novos: {
        nome: novoPaciente.nome,
        cpf: novoPaciente.cpf,
        status: novoPaciente.status
      },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      status: 'sucesso'
    });

    return res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso! Um médico entrará em contato em breve.',
      data: {
        id: novoPaciente._id,
        nome: novoPaciente.nome,
        cpf: novoPaciente.cpf,
        status: novoPaciente.status
      }
    });
  } catch (error) {
    console.error('Erro no cadastro público:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: true,
        message: 'Erro de validação',
        erros: Object.values(error.errors).map(e => ({ campo: e.path, mensagem: e.message }))
      });
    }

    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: true,
        message: `${campo} já cadastrado`
      });
    }

    return res.status(500).json({
      error: true,
      message: 'Erro ao realizar cadastro'
    });
  }
};

/**
 * Listar todos os pacientes (área administrativa)
 * GET /api/pacientes
 */
export const listarPacientes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, plano, search } = req.query;

    // Construir filtros
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (plano) {
      filter.plano = plano;
    }

    if (search) {
      filter.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { cpf: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Paginação
    const skip = (page - 1) * limit;

    const [count, pacientes] = await Promise.all([
      Paciente.countDocuments(filter),
      Paciente.find(filter)
        .sort({ created_at: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
    ]);

    return res.status(200).json({
      success: true,
      data: pacientes,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar pacientes:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao listar pacientes'
    });
  }
};

/**
 * Buscar paciente por ID (área administrativa)
 * GET /api/pacientes/:id
 */
export const buscarPacientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findById(id);

    if (!paciente) {
      return res.status(404).json({
        error: true,
        message: 'Paciente não encontrado'
      });
    }

    // Registrar visualização no log
    await AuditLog.registrar({
      usuario_id: req.usuario.id,
      usuario_nome: req.usuario.nome,
      acao: 'READ',
      entidade: 'Paciente',
      entidade_id: paciente._id,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      status: 'sucesso'
    });

    return res.status(200).json({
      success: true,
      data: paciente
    });
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar paciente'
    });
  }
};

/**
 * Criar novo paciente (área administrativa)
 * POST /api/pacientes
 */
export const criarPaciente = async (req, res) => {
  try {
    const { nome, cpf, data_nascimento, plano, analise, status, email, telefone } = req.body;

    // Verificar se CPF já existe
    const cpfExiste = await Paciente.findOne({ cpf });
    if (cpfExiste) {
      return res.status(400).json({
        error: true,
        message: 'CPF já cadastrado'
      });
    }

    // Criar paciente
    const novoPaciente = await Paciente.create({
      nome,
      cpf,
      data_nascimento,
      plano: plano || 'nenhum',
      analise,
      status: status || 'ativo',
      email,
      telefone
    });

    // Registrar no log de auditoria
    await AuditLog.registrar({
      usuario_id: req.usuario.id,
      usuario_nome: req.usuario.nome,
      acao: 'CREATE',
      entidade: 'Paciente',
      entidade_id: novoPaciente._id,
      dados_novos: {
        nome: novoPaciente.nome,
        cpf: novoPaciente.cpf,
        plano: novoPaciente.plano,
        status: novoPaciente.status
      },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      status: 'sucesso'
    });

    return res.status(201).json({
      success: true,
      message: 'Paciente criado com sucesso',
      data: novoPaciente
    });
  } catch (error) {
    console.error('Erro ao criar paciente:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: true,
        message: 'Erro de validação',
        erros: Object.values(error.errors).map(e => ({ campo: e.path, mensagem: e.message }))
      });
    }

    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: true,
        message: `${campo} já cadastrado`
      });
    }

    return res.status(500).json({
      error: true,
      message: 'Erro ao criar paciente'
    });
  }
};

/**
 * Atualizar paciente (área administrativa)
 * PUT /api/pacientes/:id
 */
export const atualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, data_nascimento, plano, analise, status, email, telefone } = req.body;

    // Buscar paciente
    const paciente = await Paciente.findById(id);

    if (!paciente) {
      return res.status(404).json({
        error: true,
        message: 'Paciente não encontrado'
      });
    }

    // Guardar dados anteriores para auditoria
    const dadosAnteriores = {
      nome: paciente.nome,
      cpf: paciente.cpf,
      data_nascimento: paciente.data_nascimento,
      plano: paciente.plano,
      analise: paciente.analise,
      status: paciente.status,
      email: paciente.email,
      telefone: paciente.telefone
    };

    // Preparar dados para atualização
    const dadosAtualizacao = {};

    if (nome) dadosAtualizacao.nome = nome;
    if (cpf && cpf !== paciente.cpf) {
      // Verificar se novo CPF já existe
      const cpfExiste = await Paciente.findOne({ cpf, _id: { $ne: id } });
      if (cpfExiste) {
        return res.status(400).json({
          error: true,
          message: 'CPF já cadastrado'
        });
      }
      dadosAtualizacao.cpf = cpf;
    }
    if (data_nascimento) dadosAtualizacao.data_nascimento = data_nascimento;
    if (plano) dadosAtualizacao.plano = plano;
    if (analise !== undefined) dadosAtualizacao.analise = analise;
    if (status) dadosAtualizacao.status = status;
    if (email !== undefined) dadosAtualizacao.email = email;
    if (telefone !== undefined) dadosAtualizacao.telefone = telefone;

    // Atualizar paciente
    Object.assign(paciente, dadosAtualizacao);
    await paciente.save();

    // Registrar no log de auditoria
    await AuditLog.registrar({
      usuario_id: req.usuario.id,
      usuario_nome: req.usuario.nome,
      acao: 'UPDATE',
      entidade: 'Paciente',
      entidade_id: paciente._id,
      dados_anteriores: dadosAnteriores,
      dados_novos: dadosAtualizacao,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      status: 'sucesso'
    });

    return res.status(200).json({
      success: true,
      message: 'Paciente atualizado com sucesso',
      data: paciente
    });
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: true,
        message: 'Erro de validação',
        erros: Object.values(error.errors).map(e => ({ campo: e.path, mensagem: e.message }))
      });
    }

    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: true,
        message: `${campo} já cadastrado`
      });
    }

    return res.status(500).json({
      error: true,
      message: 'Erro ao atualizar paciente'
    });
  }
};

/**
 * Deletar paciente (área administrativa)
 * DELETE /api/pacientes/:id
 */
export const deletarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar paciente
    const paciente = await Paciente.findById(id);

    if (!paciente) {
      return res.status(404).json({
        error: true,
        message: 'Paciente não encontrado'
      });
    }

    // Guardar dados para auditoria
    const dadosPaciente = {
      nome: paciente.nome,
      cpf: paciente.cpf,
      plano: paciente.plano,
      status: paciente.status
    };

    // Deletar paciente
    await paciente.deleteOne();

    // Registrar no log de auditoria
    await AuditLog.registrar({
      usuario_id: req.usuario.id,
      usuario_nome: req.usuario.nome,
      acao: 'DELETE',
      entidade: 'Paciente',
      entidade_id: id,
      dados_anteriores: dadosPaciente,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      status: 'sucesso'
    });

    return res.status(200).json({
      success: true,
      message: 'Paciente deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar paciente:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao deletar paciente'
    });
  }
};

export default {
  cadastroPublico,
  listarPacientes,
  buscarPacientePorId,
  criarPaciente,
  atualizarPaciente,
  deletarPaciente
};
