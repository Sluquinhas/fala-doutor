import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sua saúde em boas mãos
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Agende sua consulta de forma rápida e prática com os melhores profissionais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/medicos" className="bg-white text-primary-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Ver Médicos
              </Link>
              <Link to="/cadastro" className="bg-secondary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary-600 transition-colors">
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Como funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-500">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Escolha o médico</h3>
              <p className="text-gray-600">
                Navegue por nossa lista de especialistas e encontre o profissional ideal.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-500">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Selecione o horário</h3>
              <p className="text-gray-600">
                Veja a disponibilidade e escolha o melhor horário para você.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-500">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Confirme sua consulta</h3>
              <p className="text-gray-600">
                Receba a confirmação e compareça no dia e horário agendados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Pronto para agendar sua consulta?
          </h2>
          <p className="text-gray-600 mb-8">
            Crie sua conta gratuitamente e agende em poucos minutos.
          </p>
          <Link to="/cadastro" className="btn-primary text-lg px-8 py-3">
            Começar agora
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
