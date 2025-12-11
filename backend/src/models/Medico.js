import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Modelo de Médico
 * Representa os profissionais médicos com acesso administrativo ao sistema
 */
const Medico = sequelize.define('medico', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'ID único do médico'
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
    comment: 'Nome completo do médico'
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
    comment: 'CPF do médico (apenas números)'
  },
  crm: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: {
      msg: 'Este CRM já está cadastrado'
    },
    validate: {
      notEmpty: {
        msg: 'CRM é obrigatório'
      }
    },
    comment: 'Número do CRM (Conselho Regional de Medicina)'
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
    comment: 'Data de nascimento do médico'
  },
  plano: {
    type: DataTypes.ENUM('básico', 'premium', 'enterprise'),
    allowNull: false,
    defaultValue: 'básico',
    comment: 'Plano de assinatura do médico'
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Senha é obrigatória'
      }
    },
    comment: 'Senha hash (bcrypt)'
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'medico',
    validate: {
      isIn: {
        args: [['medico', 'admin']],
        msg: 'Role deve ser "medico" ou "admin"'
      }
    },
    comment: 'Função do usuário no sistema'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica se o médico está ativo no sistema'
  }
}, {
  tableName: 'medicos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['cpf']
    },
    {
      unique: true,
      fields: ['crm']
    }
  ]
});

export default Medico;
