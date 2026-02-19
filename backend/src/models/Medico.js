import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const PLANOS = ['nenhum', 'unimed', 'amil', 'bradesco', 'sulamerica', 'hapvida', 'notredame', 'prevent'];

const medicoSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => randomUUID()
  },
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [3, 'Nome deve ter entre 3 e 150 caracteres'],
    maxlength: [150, 'Nome deve ter entre 3 e 150 caracteres']
  },
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório'],
    match: [/^[0-9]{11}$/, 'CPF deve conter exatamente 11 dígitos numéricos']
  },
  crm: {
    type: String,
    required: [true, 'CRM é obrigatório'],
    trim: true
  },
  data_nascimento: {
    type: String,
    required: [true, 'Data de nascimento é obrigatória'],
    validate: {
      validator(v) { return new Date(v) < new Date(); },
      message: 'Data de nascimento deve ser anterior à data atual'
    }
  },
  plano: {
    type: String,
    enum: { values: PLANOS, message: 'Plano de saúde inválido' },
    default: 'nenhum'
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória']
  },
  role: {
    type: String,
    enum: { values: ['medico', 'admin'], message: 'Role deve ser "medico" ou "admin"' },
    default: 'medico'
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.senha;
    }
  }
});

medicoSchema.index({ cpf: 1 }, { unique: true });
medicoSchema.index({ crm: 1 }, { unique: true });

const Medico = mongoose.model('Medico', medicoSchema);
export default Medico;
