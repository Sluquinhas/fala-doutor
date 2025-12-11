const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Senha padrão para os médicos de teste: "123456"
  const senhaHash = await bcrypt.hash('123456', 10);

  // Criar médicos de exemplo
  const medicos = [
    {
      nome: 'Carlos Eduardo Silva',
      cpf: '123.456.789-00',
      crm: 'CRM/SP 123456',
      especialidade: 'Clínico Geral',
      email: 'carlos.silva@faladoutor.com',
      senhaHash,
      dataNascimento: new Date('1975-03-15'),
      bio: 'Médico com mais de 20 anos de experiência em medicina geral. Atendimento humanizado e acolhedor.',
      isAdmin: true, // Admin master
    },
    {
      nome: 'Ana Paula Oliveira',
      cpf: '234.567.890-11',
      crm: 'CRM/SP 234567',
      especialidade: 'Cardiologista',
      email: 'ana.oliveira@faladoutor.com',
      senhaHash,
      dataNascimento: new Date('1980-07-22'),
      bio: 'Especialista em cardiologia com foco em prevenção e tratamento de doenças cardiovasculares.',
    },
    {
      nome: 'Roberto Mendes',
      cpf: '345.678.901-22',
      crm: 'CRM/SP 345678',
      especialidade: 'Ortopedista',
      email: 'roberto.mendes@faladoutor.com',
      senhaHash,
      dataNascimento: new Date('1978-11-08'),
      bio: 'Ortopedista especializado em lesões esportivas e cirurgia do joelho.',
    },
    {
      nome: 'Mariana Costa',
      cpf: '456.789.012-33',
      crm: 'CRM/SP 456789',
      especialidade: 'Dermatologista',
      email: 'mariana.costa@faladoutor.com',
      senhaHash,
      dataNascimento: new Date('1985-05-30'),
      bio: 'Dermatologista com experiência em tratamentos estéticos e clínicos.',
    },
    {
      nome: 'Fernando Almeida',
      cpf: '567.890.123-44',
      crm: 'CRM/SP 567890',
      especialidade: 'Pediatra',
      email: 'fernando.almeida@faladoutor.com',
      senhaHash,
      dataNascimento: new Date('1982-09-12'),
      bio: 'Pediatra dedicado ao cuidado integral da saúde infantil.',
    },
  ];

  // Inserir médicos
  for (const medico of medicos) {
    const medicoExistente = await prisma.medico.findUnique({
      where: { email: medico.email },
    });

    if (!medicoExistente) {
      const novoMedico = await prisma.medico.create({ data: medico });
      console.log(`✅ Médico criado: Dr(a). ${novoMedico.nome}`);

      // Criar horários disponíveis para cada médico (segunda a sexta, 8h-18h)
      for (let dia = 1; dia <= 5; dia++) {
        await prisma.horarioDisponivel.create({
          data: {
            medicoId: novoMedico.id,
            diaSemana: dia,
            horaInicio: '08:00',
            horaFim: '18:00',
            ativo: true,
          },
        });
      }
      console.log(`   📅 Horários configurados para Dr(a). ${novoMedico.nome}`);
    } else {
      console.log(`⏭️  Médico já existe: Dr(a). ${medico.nome}`);
    }
  }

  // Criar um paciente de teste
  const pacienteExistente = await prisma.paciente.findUnique({
    where: { email: 'paciente@teste.com' },
  });

  if (!pacienteExistente) {
    const paciente = await prisma.paciente.create({
      data: {
        nome: 'João da Silva',
        cpf: '111.222.333-44',
        email: 'paciente@teste.com',
        senhaHash,
        telefone: '(11) 99999-9999',
        dataNascimento: new Date('1990-01-15'),
        endereco: 'Rua das Flores, 123 - São Paulo/SP',
        planoSaude: 'Unimed',
      },
    });
    console.log(`✅ Paciente de teste criado: ${paciente.nome}`);
  }

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   Médico: carlos.silva@faladoutor.com / 123456');
  console.log('   Paciente: paciente@teste.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
