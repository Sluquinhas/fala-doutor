import mongoose from 'mongoose';

/**
 * Schema de Log de Auditoria
 * Registra todas as operações importantes realizadas no sistema
 * Armazenado no MongoDB para facilitar consultas e análises de histórico
 */
const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  usuario_id: {
    type: String,
    required: false,
    index: true,
    description: 'ID do usuário que realizou a ação'
  },
  usuario_nome: {
    type: String,
    required: true,
    description: 'Nome do usuário para facilitar consultas'
  },
  acao: {
    type: String,
    required: true,
    enum: [
      'CREATE',
      'READ',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'LOGIN_FAILED'
    ],
    description: 'Tipo de ação realizada'
  },
  entidade: {
    type: String,
    required: true,
    enum: ['Medico', 'Paciente', 'Auth', 'Consulta'],
    description: 'Tipo de entidade afetada'
  },
  entidade_id: {
    type: String,
    description: 'ID da entidade afetada'
  },
  dados_anteriores: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Dados antes da modificação (para UPDATE e DELETE)'
  },
  dados_novos: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Dados após a modificação (para CREATE e UPDATE)'
  },
  ip_address: {
    type: String,
    description: 'Endereço IP de origem da requisição'
  },
  user_agent: {
    type: String,
    description: 'User agent do navegador/cliente'
  },
  status: {
    type: String,
    enum: ['sucesso', 'falha'],
    default: 'sucesso',
    description: 'Status da operação'
  },
  mensagem_erro: {
    type: String,
    description: 'Mensagem de erro (se aplicável)'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Dados adicionais relevantes'
  }
}, {
  timestamps: false,
  collection: 'audit_logs'
});

// Índices compostos para otimizar consultas comuns
auditLogSchema.index({ timestamp: -1, usuario_id: 1 });
auditLogSchema.index({ entidade: 1, entidade_id: 1 });
auditLogSchema.index({ acao: 1, timestamp: -1 });

// Método estático para criar um log de auditoria
auditLogSchema.statics.registrar = async function(dados) {
  try {
    const log = new this(dados);
    await log.save();
    return log;
  } catch (error) {
    console.error('Erro ao registrar log de auditoria:', error);
    // Não lançar erro para não interromper a operação principal
    return null;
  }
};

// Método estático para buscar logs de um usuário
auditLogSchema.statics.buscarPorUsuario = async function(usuarioId, limite = 50) {
  return this.find({ usuario_id: usuarioId })
    .sort({ timestamp: -1 })
    .limit(limite)
    .lean();
};

// Método estático para buscar logs de uma entidade específica
auditLogSchema.statics.buscarPorEntidade = async function(entidade, entidadeId, limite = 50) {
  return this.find({ entidade, entidade_id: entidadeId })
    .sort({ timestamp: -1 })
    .limit(limite)
    .lean();
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
