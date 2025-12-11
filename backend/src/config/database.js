import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuração e conexão com banco de dados usando Sequelize
 * Responsável por gerenciar dados estruturados (Médicos e Pacientes)
 * Usa SQLite em desenvolvimento para facilitar setup
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

/**
 * Testa a conexão com o banco de dados
 */
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error.message);
    return false;
  }
};

/**
 * Sincroniza os modelos com o banco de dados
 * @param {boolean} force - Se true, deleta e recria as tabelas (USE COM CUIDADO!)
 * @param {boolean} alter - Se true, altera as tabelas existentes para corresponder aos modelos
 */
export const syncDatabase = async (force = false, alter = false) => {
  try {
    await sequelize.sync({ force, alter });
    console.log(`✅ Banco de dados sincronizado ${force ? '(tabelas recriadas)' : alter ? '(tabelas alteradas)' : ''}`);
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de dados:', error.message);
    throw error;
  }
};

export default sequelize;
