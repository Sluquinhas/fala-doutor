/**
 * Script de migração: SQLite (Sequelize) → MongoDB (Mongoose)
 *
 * RODAR UMA UNICA VEZ antes de remover as dependências do Sequelize:
 *   node migrar-dados.js
 *
 * Pré-requisitos:
 *   - MongoDB rodando em localhost:27017
 *   - Arquivo database.sqlite existente com dados
 *   - Dependências sequelize e sqlite3 ainda instaladas
 */

import { Sequelize, DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import { connectMongoDB } from './src/config/mongodb.js';

// Importar modelos Mongoose (novos)
import MedicoMongo from './src/models/Medico.js';
import PacienteMongo from './src/models/Paciente.js';
import ConsultaMongo from './src/models/Consulta.js';

// Criar conexão Sequelize para leitura do SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Definir modelos Sequelize inline (apenas para leitura)
const MedicoSQL = sequelize.define('medico', {
  id: { type: DataTypes.UUID, primaryKey: true },
  nome: DataTypes.STRING,
  cpf: DataTypes.STRING,
  crm: DataTypes.STRING,
  data_nascimento: DataTypes.DATEONLY,
  plano: DataTypes.STRING,
  senha: DataTypes.STRING,
  role: DataTypes.STRING,
  ativo: DataTypes.BOOLEAN
}, { tableName: 'medicos', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const PacienteSQL = sequelize.define('paciente', {
  id: { type: DataTypes.UUID, primaryKey: true },
  nome: DataTypes.STRING,
  cpf: DataTypes.STRING,
  senha: DataTypes.STRING,
  data_nascimento: DataTypes.DATEONLY,
  plano: DataTypes.STRING,
  analise: DataTypes.TEXT,
  status: DataTypes.STRING,
  email: DataTypes.STRING,
  telefone: DataTypes.STRING
}, { tableName: 'pacientes', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const ConsultaSQL = sequelize.define('consultas', {
  id: { type: DataTypes.UUID, primaryKey: true },
  medico_id: DataTypes.UUID,
  paciente_id: DataTypes.UUID,
  data_consulta: DataTypes.DATEONLY,
  hora_consulta: DataTypes.STRING,
  status: DataTypes.STRING,
  observacoes: DataTypes.TEXT,
  motivo_cancelamento: DataTypes.TEXT
}, { tableName: 'consultas', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

async function migrar() {
  try {
    // Conectar ao SQLite
    await sequelize.authenticate();
    console.log('✅ Conectado ao SQLite');

    // Conectar ao MongoDB
    await connectMongoDB();
    console.log('✅ Conectado ao MongoDB');

    // Migrar médicos
    const medicos = await MedicoSQL.findAll({ raw: true });
    console.log(`\n📋 Encontrados ${medicos.length} médicos no SQLite`);

    if (medicos.length > 0) {
      const medicosDocs = medicos.map(m => ({
        _id: m.id,
        nome: m.nome,
        cpf: m.cpf,
        crm: m.crm,
        data_nascimento: m.data_nascimento,
        plano: m.plano,
        senha: m.senha,
        role: m.role,
        ativo: m.ativo,
        created_at: m.created_at,
        updated_at: m.updated_at
      }));

      await MedicoMongo.insertMany(medicosDocs, { ordered: false });
      console.log(`✅ ${medicos.length} médicos migrados`);
    }

    // Migrar pacientes
    const pacientes = await PacienteSQL.findAll({ raw: true });
    console.log(`\n📋 Encontrados ${pacientes.length} pacientes no SQLite`);

    if (pacientes.length > 0) {
      const pacientesDocs = pacientes.map(p => ({
        _id: p.id,
        nome: p.nome,
        cpf: p.cpf,
        senha: p.senha,
        data_nascimento: p.data_nascimento,
        plano: p.plano,
        analise: p.analise,
        status: p.status,
        email: p.email,
        telefone: p.telefone,
        created_at: p.created_at,
        updated_at: p.updated_at
      }));

      await PacienteMongo.insertMany(pacientesDocs, { ordered: false });
      console.log(`✅ ${pacientes.length} pacientes migrados`);
    }

    // Migrar consultas
    const consultas = await ConsultaSQL.findAll({ raw: true });
    console.log(`\n📋 Encontradas ${consultas.length} consultas no SQLite`);

    if (consultas.length > 0) {
      const consultasDocs = consultas.map(c => ({
        _id: c.id,
        medico_id: c.medico_id,
        paciente_id: c.paciente_id,
        data_consulta: c.data_consulta,
        hora_consulta: c.hora_consulta,
        status: c.status,
        observacoes: c.observacoes,
        motivo_cancelamento: c.motivo_cancelamento,
        created_at: c.created_at,
        updated_at: c.updated_at
      }));

      await ConsultaMongo.insertMany(consultasDocs, { ordered: false });
      console.log(`✅ ${consultas.length} consultas migradas`);
    }

    console.log('\n🎉 Migração concluída com sucesso!');
    console.log('Agora você pode remover as dependências do Sequelize/SQLite.');

    await sequelize.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro na migração:', error.message);

    if (error.code === 11000) {
      console.error('Alguns registros já existem no MongoDB (chave duplicada). A migração pode ter sido parcial.');
      console.error('Se quiser migrar novamente, limpe as coleções no MongoDB primeiro.');
    }

    await sequelize.close().catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

migrar();
