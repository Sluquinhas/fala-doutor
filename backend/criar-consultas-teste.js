import { connectMongoDB } from './src/config/mongodb.js';
import mongoose from 'mongoose';
import Consulta from './src/models/Consulta.js';
import Medico from './src/models/Medico.js';
import Paciente from './src/models/Paciente.js';

async function criarConsultasTeste() {
  try {
    await connectMongoDB();
    console.log('Conectado ao MongoDB!');

    const medico = await Medico.findOne();
    const paciente = await Paciente.findOne();

    if (!medico || !paciente) {
      console.log('Precisa ter pelo menos 1 medico e 1 paciente!');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('Medico:', medico.nome);
    console.log('Paciente:', paciente.nome);

    const consultas = [
      { data_consulta: '2026-02-15', hora_consulta: '09:00' },
      { data_consulta: '2026-02-20', hora_consulta: '10:00' },
      { data_consulta: '2026-03-10', hora_consulta: '14:00' },
      { data_consulta: '2026-03-25', hora_consulta: '15:00' },
      { data_consulta: '2026-03-28', hora_consulta: '11:00' },
      { data_consulta: '2026-04-05', hora_consulta: '09:00' },
      { data_consulta: '2026-05-12', hora_consulta: '16:00' },
      { data_consulta: '2026-05-18', hora_consulta: '10:00' },
      { data_consulta: '2026-06-22', hora_consulta: '14:00' },
      { data_consulta: '2026-06-08', hora_consulta: '11:00' },
    ];

    for (const c of consultas) {
      await Consulta.create({
        medico_id: medico._id,
        paciente_id: paciente._id,
        data_consulta: c.data_consulta,
        hora_consulta: c.hora_consulta,
        status: 'agendada'
      });
      console.log('Criada consulta em', c.data_consulta);
    }

    console.log('\n10 consultas criadas!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

criarConsultasTeste();
