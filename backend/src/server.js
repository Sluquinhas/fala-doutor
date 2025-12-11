import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, syncDatabase } from './config/database.js';
import { connectMongoDB } from './config/mongodb.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Fala Doutor API está rodando!',
    timestamp: new Date().toISOString()
  });
});

// Importar modelos (necessário para criar as tabelas)
import './models/Medico.js';
import './models/Paciente.js';
import './models/Consulta.js';

// Importar rotas
import authRoutes from './routes/auth.routes.js';
import medicoRoutes from './routes/medico.routes.js';
import pacienteRoutes from './routes/paciente.routes.js';
import consultaRoutes from './routes/consulta.routes.js';

// Rotas da aplicação
app.use('/api/auth', authRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/consultas', consultaRoutes);

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro:', err.stack);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Erro interno do servidor'
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Rota não encontrada'
  });
});

// Função para inicializar o servidor e conectar aos bancos de dados
const startServer = async () => {
  try {
    console.log('🔄 Iniciando conexões com os bancos de dados...\n');

    // Conectar ao PostgreSQL
    const postgresConnected = await testConnection();
    if (!postgresConnected) {
      throw new Error('Falha ao conectar ao PostgreSQL');
    }

    // Sincronizar modelos com o banco (criar tabelas se não existirem)
    // No primeiro uso, você pode usar syncDatabase(true) para recriar as tabelas
    await syncDatabase(false, false);

    // Conectar ao MongoDB
    const mongoConnected = await connectMongoDB();
    if (!mongoConnected) {
      throw new Error('Falha ao conectar ao MongoDB');
    }

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log('\n✅ Sistema iniciado com sucesso!');
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error.message);
    process.exit(1);
  }
};

// Iniciar a aplicação
startServer();

export default app;
