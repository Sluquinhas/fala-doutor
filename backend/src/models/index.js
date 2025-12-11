import Medico from './Medico.js';
import Paciente from './Paciente.js';

/**
 * Exportação centralizada de todos os modelos
 * Facilita a importação em outros módulos
 */

// Define relacionamentos entre modelos (se necessário)
// Exemplo: Medico.hasMany(Paciente, { foreignKey: 'medico_id' });
// Paciente.belongsTo(Medico, { foreignKey: 'medico_id' });

export {
  Medico,
  Paciente
};

export default {
  Medico,
  Paciente
};
