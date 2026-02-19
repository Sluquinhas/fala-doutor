import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuração e conexão com MongoDB usando Mongoose
 * Banco de dados principal do sistema Fala Doutor
 */

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fala_doutor';

// Configurações de conexão
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

/**
 * Conecta ao MongoDB
 */
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, mongoOptions);
    console.log('✅ Conexão com MongoDB estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    return false;
  }
};

/**
 * Desconecta do MongoDB (útil para testes e shutdown gracioso)
 */
export const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  } catch (error) {
    console.error('❌ Erro ao desconectar do MongoDB:', error.message);
  }
};

// Event listeners para monitorar a conexão
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose conectado ao MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro de conexão do Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose desconectado do MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectMongoDB();
  process.exit(0);
});

export default mongoose;
