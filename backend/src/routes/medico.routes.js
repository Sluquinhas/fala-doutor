import express from 'express';
import { body, param } from 'express-validator';
import {
  listarMedicos,
  buscarMedicoPorId,
  criarMedico,
  atualizarMedico,
  deletarMedico
} from '../controllers/medicoController.js';
import { autenticar } from '../middlewares/authMiddleware.js';
import { apenasMedicos, verificarProprioOuAdmin } from '../middlewares/roleMiddleware.js';
import { tratarErrosValidacao, validarCPF, sanitizarCPF } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Todas as rotas de médicos requerem autenticação
router.use(autenticar);

/**
 * @route   GET /api/medicos
 * @desc    Listar todos os médicos
 * @access  Private (Médicos e Admins)
 */
router.get('/', apenasMedicos, listarMedicos);

/**
 * @route   GET /api/medicos/:id
 * @desc    Buscar médico por ID
 * @access  Private (Próprio médico ou Admin)
 */
router.get(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('ID inválido')
  ],
  tratarErrosValidacao,
  verificarProprioOuAdmin('id'),
  buscarMedicoPorId
);

/**
 * @route   POST /api/medicos
 * @desc    Criar novo médico
 * @access  Private (Apenas Admins podem criar outros médicos)
 */
router.post(
  '/',
  [
    body('nome')
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 3, max: 150 })
      .withMessage('Nome deve ter entre 3 e 150 caracteres')
      .trim(),
    body('cpf')
      .notEmpty()
      .withMessage('CPF é obrigatório')
      .customSanitizer(sanitizarCPF)
      .custom(validarCPF)
      .withMessage('CPF inválido'),
    body('crm')
      .notEmpty()
      .withMessage('CRM é obrigatório')
      .trim(),
    body('data_nascimento')
      .notEmpty()
      .withMessage('Data de nascimento é obrigatória')
      .isDate()
      .withMessage('Data de nascimento inválida')
      .isBefore(new Date().toISOString())
      .withMessage('Data de nascimento deve ser anterior à data atual'),
    body('plano')
      .optional()
      .isIn(['básico', 'premium', 'enterprise'])
      .withMessage('Plano inválido'),
    body('senha')
      .notEmpty()
      .withMessage('Senha é obrigatória')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('role')
      .optional()
      .isIn(['medico', 'admin'])
      .withMessage('Role inválida')
  ],
  tratarErrosValidacao,
  apenasMedicos,
  criarMedico
);

/**
 * @route   PUT /api/medicos/:id
 * @desc    Atualizar médico
 * @access  Private (Próprio médico ou Admin)
 */
router.put(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('ID inválido'),
    body('nome')
      .optional()
      .isLength({ min: 3, max: 150 })
      .withMessage('Nome deve ter entre 3 e 150 caracteres')
      .trim(),
    body('cpf')
      .optional()
      .customSanitizer(sanitizarCPF)
      .custom(validarCPF)
      .withMessage('CPF inválido'),
    body('crm')
      .optional()
      .trim(),
    body('data_nascimento')
      .optional()
      .isDate()
      .withMessage('Data de nascimento inválida')
      .isBefore(new Date().toISOString())
      .withMessage('Data de nascimento deve ser anterior à data atual'),
    body('plano')
      .optional()
      .isIn(['básico', 'premium', 'enterprise'])
      .withMessage('Plano inválido'),
    body('senha')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('role')
      .optional()
      .isIn(['medico', 'admin'])
      .withMessage('Role inválida'),
    body('ativo')
      .optional()
      .isBoolean()
      .withMessage('Ativo deve ser boolean')
  ],
  tratarErrosValidacao,
  verificarProprioOuAdmin('id'),
  atualizarMedico
);

/**
 * @route   DELETE /api/medicos/:id
 * @desc    Deletar médico
 * @access  Private (Apenas Admin)
 */
router.delete(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('ID inválido')
  ],
  tratarErrosValidacao,
  apenasMedicos,
  deletarMedico
);

export default router;
