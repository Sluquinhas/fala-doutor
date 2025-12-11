import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo de Paciente
 * Representa os pacientes que podem se cadastrar publicamente ou ser gerenciados por médicos
 */
const Paciente = sequelize.define('paciente', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'ID único do paciente'
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome é obrigatório'
      },
      len: {
        args: [3, 150],
        msg: 'Nome deve ter entre 3 e 150 caracteres'
      }
    },
    comment: 'Nome completo do paciente'
  },
  cpf: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: {
      msg: 'Este CPF já está cadastrado'
    },
    validate: {
      notEmpty: {
        msg: 'CPF é obrigatório'
      },
      is: {
        args: /^[0-9]{11}$/,
        msg: 'CPF deve conter exatamente 11 dígitos numéricos'
      }
    },
    comment: 'CPF do paciente (apenas números)'
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Senha hash do paciente para login (opcional no cadastro público)'
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Data de nascimento é obrigatória'
      },
      isDate: {
        msg: 'Data de nascimento inválida'
      },
      isBefore: {
        args: new Date().toISOString().split('T')[0],
        msg: 'Data de nascimento deve ser anterior à data atual'
      }
    },
    comment: 'Data de nascimento do paciente'
  },
  plano: {
    type: DataTypes.ENUM('básico', 'prata', 'ouro', 'platinum'),
    allowNull: false,
    defaultValue: 'básico',
    comment: 'Plano de saúde do paciente'
  },
  analise: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Análise médica ou observações sobre o paciente'
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'em_tratamento', 'alta'),
    allowNull: false,
    defaultValue: 'ativo',
    comment: 'Status atual do paciente'
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Email inválido'
      }
    },
    comment: 'Email do paciente para contato'
  },
  telefone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: {
      is: {
        args: /^[0-9]{10,15}$/,
        msg: 'Telefone deve conter entre 10 e 15 dígitos numéricos'
      }
    },
    comment: 'Telefone do paciente (apenas números)'
  }
}, {
  tableName: 'pacientes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['cpf']
    },
    {
      fields: ['status']
    }
  ]
});

export default Paciente;
