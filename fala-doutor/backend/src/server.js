// Carrega variáveis de ambiente
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectMongoDB } = require('./config/mongodb');

// Rotas
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Conexão com MongoDB (logs)
connectMongoDB();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API Fala Doutor funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);

// Tratamento de erro 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros globais
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🏥 Servidor Fala Doutor rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
