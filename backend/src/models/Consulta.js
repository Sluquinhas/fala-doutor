import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Medico from './Medico.js';
import Paciente from './Paciente.js';

/**
 * Modelo de Consulta
 * Representa agendamentos entre médicos e pacientes
 */
const Consulta = sequelize.define('consultas', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  medico_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'medicos',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  paciente_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'pacientes',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  data_consulta: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isAfterToday(value) {
        if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
          throw new Error('Data da consulta não pode ser no passado');
        }
      }
    }
  },
  hora_consulta: {
    type: DataTypes.STRING(5), // Formato: HH:MM
    allowNull: false,
    validate: {
      is: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    }
  },
  status: {
    type: DataTypes.ENUM('agendada', 'confirmada', 'realizada', 'cancelada'),
    defaultValue: 'agendada',
    allowNull: false
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  motivo_cancelamento: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  indexes: [
    {
      fields: ['medico_id']
    },
    {
      fields: ['paciente_id']
    },
    {
      fields: ['data_consulta']
    },
    {
      fields: ['status']
    }
  ]
});

// Associações
Consulta.belongsTo(Medico, {
  foreignKey: 'medico_id',
  as: 'medico'
});

Consulta.belongsTo(Paciente, {
  foreignKey: 'paciente_id',
  as: 'paciente'
});

export default Consulta;
