import { Op } from 'sequelize';
import Consulta from '../models/Consulta.js';
import Medico from '../models/Medico.js';
import Paciente from '../models/Paciente.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Lista todas as consultas com filtros opcionais
 */
export const listarConsultas = async (req, res) => {
  try {
    const { medico_id, paciente_id, status, data_inicio, data_fim } = req.query;
    const where = {};

    if (medico_id) where.medico_id = medico_id;
    if (paciente_id) where.paciente_id = paciente_id;
    if (status) where.status = status;

    if (data_inicio && data_fim) {
      where.data_consulta = {
        [Op.between]: [data_inicio, data_fim]
      };
    }

    const consultas = await Consulta.findAll({
      where,
      include: [
        {
          model: Medico,
          as: 'medico',
          attributes: ['id', 'nome', 'crm', 'plano']
        },
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nome', 'cpf', 'email', 'telefone']
        }
      ],
      order: [['data_consulta', 'ASC'], ['hora_consulta', 'ASC']]
    });

    res.json({
      total: consultas.length,
      consultas
    });
  } catch (error) {
    console.error('Erro ao listar consultas:', error);
    res.status(500).json({
      error: true,
      message: 'Erro ao listar consultas'
    });
  }
};

/**
 * Busca consultas de um paciente específico
 */
export const listarConsultasPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const consultas = await Consulta.findAll({
      where: { paciente_id: id },
      include: [
        {
          model: Medico,
          as: 'medico',
          attributes: ['id', 'nome', 'crm', 'plano']
        }
      ],
      order: [['data_consulta', 'DESC'], ['hora_consulta', 'DESC']]
    });

    res.json({
      total: consultas.length,
      consultas
    });
  } catch (error) {
    console.error('Erro ao listar consultas do paciente:', error);
    res.status(500).json({
      error: true,
      message: 'Erro ao listar consultas do paciente'
    });
  }
};

/**
 * Busca consultas de um médico específico
 */
export const listarConsultasMedico = async (req, res) => {
  try {
    const { id } = req.params;

    const consultas = await Consulta.findAll({
      where: { medico_id: id },
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nome', 'cpf', 'email', 'telefone']
        }
      ],
      order: [['data_consulta', 'ASC'], ['hora_consulta', 'ASC']]
    });

    res.json({
      total: consultas.length,
      consultas
    });
  } catch (error) {
    console.error('Erro ao listar consultas do médico:', error);
    res.status(500).json({
      error: true,
      message: 'Erro ao listar consultas do médico'
    });
  }
};

/**
 * Busca uma consulta por ID
 */
export const buscarConsultaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const consulta = await Consulta.findByPk(id, {
      include: [
        {
          model: Medico,
          as: 'medico',
          attributes: ['id', 'nome', 'crm', 'plano']
        },
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nome', 'cpf', 'email', 'telefone']
        }
      ]
    });

    if (!consulta) {
      return res.status(404).json({
        error: true,
        message: 'Consulta não encontrada'
      });
    }

    res.json(consulta);
  } catch (error) {
    console.error('Erro ao buscar consulta:', error);
    res.status(500).json({
      error: true,
      message: 'Erro ao buscar consulta'
    });
  }
};

/**
 * Cria uma nova consulta (agendamento)
 */
export const criarConsulta = async (req, res) => {
  try {
    const { medico_id, paciente_id, data_consulta, hora_consulta, observacoes } = req.body;

    // Verificar se médico existe
    const medico = await Medico.findByPk(medico_id);
    if (!medico) {
      return res.status(404).json({
        error: true,
        message: 'Médico não encontrado'
      });
    }

    // Verificar se paciente existe
    const paciente = await Paciente.findByPk(paciente_id);
    if (!paciente) {
      return res.status(404).json({
        error: true,
        message: 'Paciente não encontrado'
      });
    }

    // Verificar se já existe consulta neste horário para o médico
    const consultaExistente = await Consulta.findOne({
      where: {
        medico_id,
        data_consulta,
        hora_consulta,
        status: ['agendada', 'confirmada']
      }
    });

    if (consultaExistente) {
      return res.status(400).json({
        error: true,
        message: 'Já existe uma consulta agendada para este médico neste horário'
      });
    }

    // Criar consulta
    const consulta = await Consulta.create({
      medico_id,
      paciente_id,
      data_consulta,
      hora_consulta,
      observacoes,
      status: 'agendada'
    });

    // Registrar auditoria
    await AuditLog.create({
      usuario_id: req.user?.id,
      usuario_nome: req.user?.nome || paciente.nome,
      acao: 'CREATE',
      entidade: 'Consulta',
      dados_novos: consulta.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    // Buscar consulta completa com relações
    const consultaCriada = await Consulta.findByPk(consulta.id, {
      include: [
        {
          model: Medico,
          as: 'medico',
          attributes: ['id', 'nome', 'crm']
        },
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nome', 'cpf']
        }
      ]
    });

    res.status(201).json({
      message: 'Consulta agendada com sucesso',
      consulta: consultaCriada
    });
  } catch (error) {
    console.error('Erro ao criar consulta:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Erro ao criar consulta'
    });
  }
};

/**
 * Atualiza uma consulta
 */
export const atualizarConsulta = async (req, res) => {
  try {
    const { id } = req.params;
    const { data_consulta, hora_consulta, status, observacoes, motivo_cancelamento } = req.body;

    const consulta = await Consulta.findByPk(id);

    if (!consulta) {
      return res.status(404).json({
        error: true,
        message: 'Consulta não encontrada'
      });
    }

    const dadosAnteriores = consulta.toJSON();

    // Atualizar consulta
    await consulta.update({
      data_consulta: data_consulta || consulta.data_consulta,
      hora_consulta: hora_consulta || consulta.hora_consulta,
      status: status || consulta.status,
      observacoes: observacoes !== undefined ? observacoes : consulta.observacoes,
      motivo_cancelamento: motivo_cancelamento || consulta.motivo_cancelamento
    });

    // Registrar auditoria
    await AuditLog.create({
      usuario_id: req.user?.id,
      usuario_nome: req.user?.nome,
      acao: 'UPDATE',
      entidade: 'Consulta',
      dados_anteriores: dadosAnteriores,
      dados_novos: consulta.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    // Buscar consulta atualizada com relações
    const consultaAtualizada = await Consulta.findByPk(id, {
      include: [
        {
          model: Medico,
          as: 'medico',
          attributes: ['id', 'nome', 'crm']
        },
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['id', 'nome', 'cpf']
        }
      ]
    });

    res.json({
      message: 'Consulta atualizada com sucesso',
      consulta: consultaAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar consulta:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Erro ao atualizar consulta'
    });
  }
};

/**
 * Cancela uma consulta
 */
export const cancelarConsulta = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_cancelamento } = req.body;

    const consulta = await Consulta.findByPk(id);

    if (!consulta) {
      return res.status(404).json({
        error: true,
        message: 'Consulta não encontrada'
      });
    }

    if (consulta.status === 'cancelada') {
      return res.status(400).json({
        error: true,
        message: 'Esta consulta já está cancelada'
      });
    }

    const dadosAnteriores = consulta.toJSON();

    await consulta.update({
      status: 'cancelada',
      motivo_cancelamento
    });

    // Registrar auditoria
    await AuditLog.create({
      usuario_id: req.user?.id,
      usuario_nome: req.user?.nome,
      acao: 'UPDATE',
      entidade: 'Consulta',
      dados_anteriores: dadosAnteriores,
      dados_novos: consulta.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    res.json({
      message: 'Consulta cancelada com sucesso',
      consulta
    });
  } catch (error) {
    console.error('Erro ao cancelar consulta:', error);
    res.status(500).json({
      error: true,
      message: 'Erro ao cancelar consulta'
    });
  }
};

/**
 * Deleta uma consulta
 */
export const deletarConsulta = async (req, res) => {
  try {
    const { id } = req.params;

    const consulta = await Consulta.findByPk(id);

    if (!consulta) {
      return res.status(404).json({
        error: true,
        message: 'Consulta não encontrada'
      });
    }

    const dadosAnteriores = consulta.toJSON();

    await consulta.destroy();

    // Registrar auditoria
    await AuditLog.create({
      usuario_id: req.user?.id,
      usuario_nome: req.user?.nome,
      acao: 'DELETE',
      entidade: 'Consulta',
      dados_anteriores: dadosAnteriores,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    res.json({
      message: 'Consulta deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar consulta:', error);
    res.status(500).json({
      error: true,
      message: 'Erro ao deletar consulta'
    });
  }
};
