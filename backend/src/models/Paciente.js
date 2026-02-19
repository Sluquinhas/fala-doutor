import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const PLANOS = ['nenhum', 'unimed', 'amil', 'bradesco', 'sulamerica', 'hapvida', 'notredame', 'prevent'];

const pacienteSchema = new mongoose.Schema({
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
  senha: {
    type: String,
    default: null
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
  analise: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: { values: ['ativo', 'inativo', 'em_tratamento', 'alta'], message: 'Status inválido' },
    default: 'ativo'
  },
  email: {
    type: String,
    default: null,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido']
  },
  telefone: {
    type: String,
    default: null,
    validate: {
      validator(v) {
        if (!v) return true;
        return /^[0-9]{10,15}$/.test(v);
      },
      message: 'Telefone deve conter entre 10 e 15 dígitos numéricos'
    }
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

pacienteSchema.index({ cpf: 1 }, { unique: true });
pacienteSchema.index({ status: 1 });

const Paciente = mongoose.model('Paciente', pacienteSchema);
export default Paciente;
