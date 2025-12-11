import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Medicos from './pages/Medicos';
import Pacientes from './pages/Pacientes';
import CadastroPublico from './pages/CadastroPublico';
import CadastroMedico from './pages/CadastroMedico';
import PacienteDashboard from './pages/PacienteDashboard';
import AgendarConsulta from './pages/AgendarConsulta';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota raiz redireciona para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro-publico" element={<CadastroPublico />} />
          <Route path="/cadastro-medico" element={<CadastroMedico />} />

          {/* Rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/medicos"
            element={
              <ProtectedRoute>
                <Medicos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pacientes"
            element={
              <ProtectedRoute>
                <Pacientes />
              </ProtectedRoute>
            }
          />

          {/* Rotas do Paciente */}
          <Route
            path="/paciente/dashboard"
            element={
              <ProtectedRoute>
                <PacienteDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/paciente/agendar"
            element={
              <ProtectedRoute>
                <AgendarConsulta />
              </ProtectedRoute>
            }
          />

          {/* Rota 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
