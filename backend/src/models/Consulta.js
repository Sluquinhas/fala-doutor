import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const consultaSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => randomUUID()
  },
  medico_id: {
    type: String,
    required: true,
    ref: 'Medico'
  },
  paciente_id: {
    type: String,
    required: true,
    ref: 'Paciente'
  },
  data_consulta: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Formato de data inválido. Use YYYY-MM-DD'
    }
  },
  hora_consulta: {
    type: String,
    required: true,
    match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida. Use formato HH:MM']
  },
  status: {
    type: String,
    enum: { values: ['agendada', 'confirmada', 'realizada', 'cancelada'], message: 'Status inválido' },
    default: 'agendada'
  },
  observacoes: {
    type: String,
    default: null
  },
  motivo_cancelamento: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Virtuals para populate com alias (consulta.medico e consulta.paciente)
consultaSchema.virtual('medico', {
  ref: 'Medico',
  localField: 'medico_id',
  foreignField: '_id',
  justOne: true
});

consultaSchema.virtual('paciente', {
  ref: 'Paciente',
  localField: 'paciente_id',
  foreignField: '_id',
  justOne: true
});

consultaSchema.index({ medico_id: 1 });
consultaSchema.index({ paciente_id: 1 });
consultaSchema.index({ data_consulta: 1 });
consultaSchema.index({ status: 1 });
consultaSchema.index({ medico_id: 1, data_consulta: 1, hora_consulta: 1 });

const Consulta = mongoose.model('Consulta', consultaSchema);
export default Consulta;
