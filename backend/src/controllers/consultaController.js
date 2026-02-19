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
    const filter = {};

    if (medico_id) filter.medico_id = medico_id;
    if (paciente_id) filter.paciente_id = paciente_id;
    if (status) filter.status = status;

    if (data_inicio && data_fim) {
      filter.data_consulta = { $gte: data_inicio, $lte: data_fim };
    }

    const consultas = await Consulta.find(filter)
      .populate({ path: 'medico', select: 'nome crm plano' })
      .populate({ path: 'paciente', select: 'nome cpf email telefone' })
      .sort({ data_consulta: 1, hora_consulta: 1 });

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

    const consultas = await Consulta.find({ paciente_id: id })
      .populate({ path: 'medico', select: 'nome crm plano' })
      .sort({ data_consulta: -1, hora_consulta: -1 });

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

    const consultas = await Consulta.find({ medico_id: id })
      .populate({ path: 'paciente', select: 'nome cpf email telefone' })
      .sort({ data_consulta: 1, hora_consulta: 1 });

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

    const consulta = await Consulta.findById(id)
      .populate({ path: 'medico', select: 'nome crm plano' })
      .populate({ path: 'paciente', select: 'nome cpf email telefone' });

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
    const medico = await Medico.findById(medico_id);
    if (!medico) {
      return res.status(404).json({
        error: true,
        message: 'Médico não encontrado'
      });
    }

    // Verificar se paciente existe
    const paciente = await Paciente.findById(paciente_id);
    if (!paciente) {
      return res.status(404).json({
        error: true,
        message: 'Paciente não encontrado'
      });
    }

    // Verificar se já existe consulta neste horário para o médico
    const consultaExistente = await Consulta.findOne({
      medico_id,
      data_consulta,
      hora_consulta,
      status: { $in: ['agendada', 'confirmada'] }
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
    await AuditLog.registrar({
      usuario_id: req.usuario?.id,
      usuario_nome: req.usuario?.nome || paciente.nome,
      acao: 'CREATE',
      entidade: 'Consulta',
      entidade_id: consulta._id,
      dados_novos: consulta.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      status: 'sucesso'
    });

    // Buscar consulta completa com relações
    const consultaCriada = await Consulta.findById(consulta._id)
      .populate({ path: 'medico', select: 'nome crm' })
      .populate({ path: 'paciente', select: 'nome cpf' });

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

    const consulta = await Consulta.findById(id);

    if (!consulta) {
      return res.status(404).json({
        error: true,
        message: 'Consulta não encontrada'
      });
    }

    const dadosAnteriores = consulta.toJSON();

    // Atualizar consulta
    if (data_consulta) consulta.data_consulta = data_consulta;
    if (hora_consulta) consulta.hora_consulta = hora_consulta;
    if (status) consulta.status = status;
    if (observacoes !== undefined) consulta.observacoes = observacoes;
    if (motivo_cancelamento) consulta.motivo_cancelamento = motivo_cancelamento;
    await consulta.save();

    // Registrar auditoria
    await AuditLog.registrar({
      usuario_id: req.usuario?.id,
      usuario_nome: req.usuario?.nome,
      acao: 'UPDATE',
      entidade: 'Consulta',
      entidade_id: consulta._id,
      dados_anteriores: dadosAnteriores,
      dados_novos: consulta.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      status: 'sucesso'
    });

    // Buscar consulta atualizada com relações
    const consultaAtualizada = await Consulta.findById(id)
      .populate({ path: 'medico', select: 'nome crm' })
      .populate({ path: 'paciente', select: 'nome cpf' });

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

    const consulta = await Consulta.findById(id);

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

    consulta.status = 'cancelada';
    consulta.motivo_cancelamento = motivo_cancelamento;
    await consulta.save();

    // Registrar auditoria
    await AuditLog.registrar({
      usuario_id: req.usuario?.id,
      usuario_nome: req.usuario?.nome || 'Usuário',
      acao: 'UPDATE',
      entidade: 'Consulta',
      entidade_id: consulta._id,
      dados_anteriores: dadosAnteriores,
      dados_novos: consulta.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      status: 'sucesso'
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

    const consulta = await Consulta.findById(id);

    if (!consulta) {
      return res.status(404).json({
        error: true,
        message: 'Consulta não encontrada'
      });
    }

    const dadosAnteriores = consulta.toJSON();

    await consulta.deleteOne();

    // Registrar auditoria
    await AuditLog.registrar({
      usuario_id: req.usuario?.id,
      usuario_nome: req.usuario?.nome,
      acao: 'DELETE',
      entidade: 'Consulta',
      entidade_id: id,
      dados_anteriores: dadosAnteriores,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      status: 'sucesso'
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
