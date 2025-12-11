/**
 * Middleware de autorização baseado em roles
 * Verifica se o usuário autenticado possui a role necessária para acessar um recurso
 */

/**
 * Verifica se o usuário possui uma das roles permitidas
 * @param  {...string} rolesPermitidas - Lista de roles que podem acessar o recurso
 * @returns {Function} Middleware function
 */
export const verificarRole = (...rolesPermitidas) => {
  return (req, res, next) => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.usuario) {
        return res.status(401).json({
          error: true,
          message: 'Usuário não autenticado'
        });
      }

      // Verificar se o usuário tem uma role permitida
      if (!rolesPermitidas.includes(req.usuario.role)) {
        return res.status(403).json({
          error: true,
          message: 'Acesso negado. Você não tem permissão para acessar este recurso.'
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de verificação de role:', error.message);
      return res.status(500).json({
        error: true,
        message: 'Erro ao verificar permissões'
      });
    }
  };
};

/**
 * Middleware para permitir apenas administradores
 */
export const apenasAdmin = verificarRole('admin');

/**
 * Middleware para permitir médicos e administradores
 */
export const apenasMedicos = verificarRole('medico', 'admin');

/**
 * Verifica se o usuário está tentando acessar seus próprios dados ou é admin
 * Útil para rotas como /medicos/:id onde um médico pode ver/editar apenas seus próprios dados
 * @param {string} paramName - Nome do parâmetro na rota que contém o ID (default: 'id')
 */
export const verificarProprioOuAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          error: true,
          message: 'Usuário não autenticado'
        });
      }

      const idRecurso = req.params[paramName];
      const isAdmin = req.usuario.role === 'admin';
      const isProprioRecurso = req.usuario.id === idRecurso;

      if (!isAdmin && !isProprioRecurso) {
        return res.status(403).json({
          error: true,
          message: 'Acesso negado. Você só pode acessar seus próprios dados.'
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de verificação próprio/admin:', error.message);
      return res.status(500).json({
        error: true,
        message: 'Erro ao verificar permissões'
      });
    }
  };
};

export default {
  verificarRole,
  apenasAdmin,
  apenasMedicos,
  verificarProprioOuAdmin
};
