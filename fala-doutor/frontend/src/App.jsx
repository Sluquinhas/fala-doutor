import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layout
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Páginas públicas
import Home from './pages/Home';
import Medicos from './pages/Medicos';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';

// Páginas do paciente (protegidas)
import MinhaConta from './pages/paciente/MinhaConta';
import Agendar from './pages/paciente/Agendar';
import MinhasConsultas from './pages/paciente/MinhasConsultas';

// Páginas admin/médico (protegidas)
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Agenda from './pages/admin/Agenda';
import Pacientes from './pages/admin/Pacientes';
import Configuracoes from './pages/admin/Configuracoes';

// Componentes de proteção de rota
import RotaProtegidaPaciente from './components/RotaProtegidaPaciente';
import RotaProtegidaMedico from './components/RotaProtegidaMedico';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="medicos" element={<Medicos />} />
            <Route path="login" element={<Login />} />
            <Route path="cadastro" element={<Cadastro />} />

            {/* Rotas protegidas do paciente */}
            <Route element={<RotaProtegidaPaciente />}>
              <Route path="minha-conta" element={<MinhaConta />} />
              <Route path="agendar" element={<Agendar />} />
              <Route path="minhas-consultas" element={<MinhasConsultas />} />
            </Route>
          </Route>

          {/* Rotas da área administrativa (discreta) */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin" element={<RotaProtegidaMedico />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="pacientes" element={<Pacientes />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
