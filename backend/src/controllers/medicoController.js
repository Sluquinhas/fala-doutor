import Medico from '../models/Medico.js';
import { hashSenha, validarSenha } from '../utils/hashUtils.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Controller de Médicos
 * CRUD completo para gerenciamento de médicos (área administrativa)
 */

/**
 * Listar todos os médicos
 * GET /api/medicos
 */
export const listarMedicos = async (req, res) => {
  try {
    const { page = 1, limit = 10, ativo, plano, search } = req.query;

    // Construir filtros
    const filter = {};

    if (ativo !== undefined) {
      filter.ativo = ativo === 'true';
    }

    if (plano) {
      filter.plano = plano;
    }

    if (search) {
      filter.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { cpf: { $regex: search, $options: 'i' } },
        { crm: { $regex: search, $options: 'i' } }
      ];
    }

    // Paginação
    const skip = (page - 1) * limit;

    const [count, medicos] = await Promise.all([
      Medico.countDocuments(filter),
      Medico.find(filter)
        .sort({ created_at: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
    ]);

    return res.status(200).json({
      success: true,
      data: medicos,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar médicos:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao listar médicos'
    });
  }
};

/**
 * Buscar médico por ID
 * GET /api/medicos/:id
 */
export const buscarMedicoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const medico = await Medico.findById(id);

    if (!medico) {
      return res.status(404).json({
        error: true,
        message: 'Médico não encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      data: medico
    });
  } catch (error) {
    console.error('Erro ao buscar médico:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar médico'
    });
  }
};

/**
 * Criar novo médico
 * POST /api/medicos
 */
export const criarMedico = async (req, res) => {
  try {
    const { nome, cpf, crm, data_nascimento, plano, senha, role } = req.body;

    // Validar senha
    const senhaValidacao = validarSenha(senha);
    if (!senhaValidacao.valida) {
      return res.status(400).json({
        error: true,
        message: senhaValidacao.mensagem
      });
    }

    // Verificar se CPF já existe
    const cpfExiste = await Medico.findOne({ cpf });
    if (cpfExiste) {
      return res.status(400).json({
        error: true,
        message: 'CPF já cadastrado'
      });
    }

    // Verificar se CRM já existe
    const crmExiste = await Medico.findOne({ crm });
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
      plano: plano || 'nenhum',
      senha: senhaHash,
      role: role || 'medico',
      ativo: true
    });

    // Registrar no log de auditoria
    await AuditLog.registrar({
      usuario_id: req.usuario.id,
      usuario_nome: req.usuario.nome,
      acao: 'CREATE',
      entidade: 'Medico',
      entidade_id: novoMedico._id,
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

    return res.status(201).json({
      success: true,
      message: 'Médico criado com sucesso',
      data: novoMedico
    });
  } catch (error) {
    console.error('Erro ao criar médico:', error);

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
      message: 'Erro ao criar médico'
    });
  }
};

/**
 * Atualizar médico
 * PUT /api/medicos/:id
 */
export const atualizarMedico = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, crm, data_nascimento, plano, senha, role, ativo } = req.body;

    // Buscar médico
    const medico = await Medico.findById(id);

    if (!medico) {
      return res.status(404).json({
        error: true,
        message: 'Médico não encontrado'
      });
    }

    // Guardar dados anteriores para auditoria
    const dadosAnteriores = {
      nome: medico.nome,
      cpf: medico.cpf,
      crm: medico.crm,
      data_nascimento: medico.data_nascimento,
      plano: medico.plano,
      role: medico.role,
      ativo: medico.ativo
    };

    // Preparar dados para atualização
    const dadosAtualizacao = {};

    if (nome) dadosAtualizacao.nome = nome;
    if (cpf && cpf !== medico.cpf) {
      // Verificar se novo CPF já existe
      const cpfExiste = await Medico.findOne({ cpf, _id: { $ne: id } });
      if (cpfExiste) {
        return res.status(400).json({
          error: true,
          message: 'CPF já cadastrado'
        });
      }
      dadosAtualizacao.cpf = cpf;
    }
    if (crm && crm !== medico.crm) {
      // Verificar se novo CRM já existe
      const crmExiste = await Medico.findOne({ crm, _id: { $ne: id } });
      if (crmExiste) {
        return res.status(400).json({
          error: true,
          message: 'CRM já cadastrado'
        });
      }
      dadosAtualizacao.crm = crm;
    }
    if (data_nascimento) dadosAtualizacao.data_nascimento = data_nascimento;
    if (plano) dadosAtualizacao.plano = plano;
    if (role) dadosAtualizacao.role = role;
    if (ativo !== undefined) dadosAtualizacao.ativo = ativo;

    // Se senha foi fornecida, validar e fazer hash
    if (senha) {
      const senhaValidacao = validarSenha(senha);
      if (!senhaValidacao.valida) {
        return res.status(400).json({
          error: true,
          message: senhaValidacao.mensagem
        });
      }
      dadosAtualizacao.senha = await hashSenha(senha);
    }

    // Atualizar médico
    Object.assign(medico, dadosAtualizacao);
    await medico.save();

    // Registrar no log de auditoria
    await AuditLog.registrar({
      usuario_id: req.usuario.id,
      usuario_nome: req.usuario.nome,
      acao: 'UPDATE',
      entidade: 'Medico',
      entidade_id: medico._id,
      dados_anteriores: dadosAnteriores,
      dados_novos: dadosAtualizacao,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      status: 'sucesso'
    });

    return res.status(200).json({
      success: true,
      message: 'Médico atualizado com sucesso',
      data: medico
    });
  } catch (error) {
    console.error('Erro ao atualizar médico:', error);

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
      message: 'Erro ao atualizar médico'
    });
  }
};

/**
 * Deletar médico
 * DELETE /api/medicos/:id
 */
export const deletarMedico = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar médico
    const medico = await Medico.findById(id);

    if (!medico) {
      return res.status(404).json({
        error: true,
        message: 'Médico não encontrado'
      });
    }

    // Prevenir auto-exclusão
    if (medico._id === req.usuario.id) {
      return res.status(400).json({
        error: true,
        message: 'Você não pode deletar sua própria conta'
      });
    }

    // Guardar dados para auditoria
    const dadosMedico = {
      nome: medico.nome,
      cpf: medico.cpf,
      crm: medico.crm,
      plano: medico.plano,
      role: medico.role
    };

    // Deletar médico
    await medico.deleteOne();

    // Registrar no log de auditoria
    await AuditLog.registrar({
      usuario_id: req.usuario.id,
      usuario_nome: req.usuario.nome,
      acao: 'DELETE',
      entidade: 'Medico',
      entidade_id: id,
      dados_anteriores: dadosMedico,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      status: 'sucesso'
    });

    return res.status(200).json({
      success: true,
      message: 'Médico deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar médico:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao deletar médico'
    });
  }
};

export default {
  listarMedicos,
  buscarMedicoPorId,
  criarMedico,
  atualizarMedico,
  deletarMedico
};
