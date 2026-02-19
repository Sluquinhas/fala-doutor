import { connectMongoDB } from './src/config/mongodb.js';
import mongoose from 'mongoose';
import Consulta from './src/models/Consulta.js';
import Medico from './src/models/Medico.js';
import Paciente from './src/models/Paciente.js';

async function limparBanco() {
  try {
    await connectMongoDB();
    console.log('Conectado ao MongoDB!');

    const consultasApagadas = await Consulta.deleteMany({});
    console.log(`${consultasApagadas.deletedCount} consultas apagadas`);

    const pacientesApagados = await Paciente.deleteMany({});
    console.log(`${pacientesApagados.deletedCount} pacientes apagados`);

    const medicosApagados = await Medico.deleteMany({});
    console.log(`${medicosApagados.deletedCount} medicos apagados`);

    console.log('\nBanco limpo com sucesso!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

limparBanco();
