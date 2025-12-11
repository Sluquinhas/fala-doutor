const mongoose = require('mongoose');

/**
 * Conecta ao MongoDB para armazenamento de logs
 */
const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log('⚠️  MongoDB URI não configurada - logs desabilitados');
      return;
    }

    await mongoose.connect(uri);
    console.log('📊 MongoDB conectado - sistema de logs ativo');
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error.message);
    // Não encerra a aplicação, apenas desabilita logs
  }
};

module.exports = { connectMongoDB };
