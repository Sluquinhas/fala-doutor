import express from 'express';
import { autenticar } from '../middlewares/authMiddleware.js';
import {
  listarConsultas,
  listarConsultasPaciente,
  listarConsultasMedico,
  buscarConsultaPorId,
  criarConsulta,
  atualizarConsulta,
  cancelarConsulta,
  deletarConsulta
} from '../controllers/consultaController.js';

const router = express.Router();

/**
 * @route   GET /api/consultas
 * @desc    Lista todas as consultas (com filtros opcionais)
 * @access  Privado (médicos e pacientes)
 * @query   medico_id, paciente_id, status, data_inicio, data_fim
 */
router.get('/', autenticar, listarConsultas);

/**
 * @route   GET /api/consultas/paciente/:id
 * @desc    Lista consultas de um paciente específico
 * @access  Privado
 */
router.get('/paciente/:id', autenticar, listarConsultasPaciente);

/**
 * @route   GET /api/consultas/medico/:id
 * @desc    Lista consultas de um médico específico
 * @access  Privado
 */
router.get('/medico/:id', autenticar, listarConsultasMedico);

/**
 * @route   GET /api/consultas/:id
 * @desc    Busca uma consulta por ID
 * @access  Privado
 */
router.get('/:id', autenticar, buscarConsultaPorId);

/**
 * @route   POST /api/consultas
 * @desc    Cria uma nova consulta (agendamento)
 * @access  Privado (pacientes podem agendar, médicos também)
 * @body    medico_id, paciente_id, data_consulta, hora_consulta, observacoes
 */
router.post('/', autenticar, criarConsulta);

/**
 * @route   PUT /api/consultas/:id
 * @desc    Atualiza uma consulta
 * @access  Privado
 * @body    data_consulta, hora_consulta, status, observacoes
 */
router.put('/:id', autenticar, atualizarConsulta);

/**
 * @route   PUT /api/consultas/:id/cancelar
 * @desc    Cancela uma consulta
 * @access  Privado
 * @body    motivo_cancelamento
 */
router.put('/:id/cancelar', autenticar, cancelarConsulta);

/**
 * @route   DELETE /api/consultas/:id
 * @desc    Deleta uma consulta
 * @access  Privado (apenas admin)
 */
router.delete('/:id', autenticar, deletarConsulta);

export default router;
