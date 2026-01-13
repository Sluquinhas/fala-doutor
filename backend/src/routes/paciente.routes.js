import express from 'express';
import { body, param } from 'express-validator';
import {
  cadastroPublico,
  listarPacientes,
  buscarPacientePorId,
  criarPaciente,
  atualizarPaciente,
  deletarPaciente
} from '../controllers/pacienteController.js';
import { autenticar } from '../middlewares/authMiddleware.js';
import { apenasMedicos } from '../middlewares/roleMiddleware.js';
import { tratarErrosValidacao, validarCPF, sanitizarCPF, sanitizarTelefone } from '../middlewares/validationMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/pacientes/publico/cadastro
 * @desc    Cadastro público de paciente (sem autenticação)
 * @access  Public
 */
router.post(
  '/publico/cadastro',
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
    body('data_nascimento')
      .notEmpty()
      .withMessage('Data de nascimento é obrigatória')
      .isDate()
      .withMessage('Data de nascimento inválida')
      .isBefore(new Date().toISOString())
      .withMessage('Data de nascimento deve ser anterior à data atual'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('telefone')
      .optional()
      .customSanitizer(sanitizarTelefone)
  ],
  tratarErrosValidacao,
  cadastroPublico
);

// As rotas abaixo requerem autenticação
router.use(autenticar);
router.use(apenasMedicos);

/**
 * @route   GET /api/pacientes
 * @desc    Listar todos os pacientes
 * @access  Private (Médicos e Admins)
 */
router.get('/', listarPacientes);

/**
 * @route   GET /api/pacientes/:id
 * @desc    Buscar paciente por ID
 * @access  Private (Médicos e Admins)
 */
router.get(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('ID inválido')
  ],
  tratarErrosValidacao,
  buscarPacientePorId
);

/**
 * @route   POST /api/pacientes
 * @desc    Criar novo paciente
 * @access  Private (Médicos e Admins)
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
    body('data_nascimento')
      .notEmpty()
      .withMessage('Data de nascimento é obrigatória')
      .isDate()
      .withMessage('Data de nascimento inválida')
      .isBefore(new Date().toISOString())
      .withMessage('Data de nascimento deve ser anterior à data atual'),
    body('plano')
      .optional()
      .isIn(['nenhum', 'unimed', 'amil', 'bradesco', 'sulamerica', 'hapvida', 'notredame', 'prevent'])
      .withMessage('Plano inválido'),
    body('analise')
      .optional()
      .isString()
      .withMessage('Análise deve ser um texto'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'em_tratamento', 'alta'])
      .withMessage('Status inválido'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('telefone')
      .optional()
      .customSanitizer(sanitizarTelefone)
  ],
  tratarErrosValidacao,
  criarPaciente
);

/**
 * @route   PUT /api/pacientes/:id
 * @desc    Atualizar paciente
 * @access  Private (Médicos e Admins)
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
    body('data_nascimento')
      .optional()
      .isDate()
      .withMessage('Data de nascimento inválida')
      .isBefore(new Date().toISOString())
      .withMessage('Data de nascimento deve ser anterior à data atual'),
    body('plano')
      .optional()
      .isIn(['nenhum', 'unimed', 'amil', 'bradesco', 'sulamerica', 'hapvida', 'notredame', 'prevent'])
      .withMessage('Plano inválido'),
    body('analise')
      .optional()
      .isString()
      .withMessage('Análise deve ser um texto'),
    body('status')
      .optional()
      .isIn(['ativo', 'inativo', 'em_tratamento', 'alta'])
      .withMessage('Status inválido'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('telefone')
      .optional()
      .customSanitizer(sanitizarTelefone)
  ],
  tratarErrosValidacao,
  atualizarPaciente
);

/**
 * @route   DELETE /api/pacientes/:id
 * @desc    Deletar paciente
 * @access  Private (Médicos e Admins)
 */
router.delete(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('ID inválido')
  ],
  tratarErrosValidacao,
  deletarPaciente
);

export default router;
