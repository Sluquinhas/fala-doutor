import express from 'express';
import { body } from 'express-validator';
import { login, registro, me } from '../controllers/authController.js';
import { autenticar } from '../middlewares/authMiddleware.js';
import { tratarErrosValidacao, validarCPF, sanitizarCPF } from '../middlewares/validationMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login de médico
 * @access  Public
 */
router.post(
  '/login',
  [
    body('cpf')
      .notEmpty()
      .withMessage('CPF é obrigatório')
      .customSanitizer(sanitizarCPF)
      .custom(validarCPF)
      .withMessage('CPF inválido'),
    body('senha')
      .notEmpty()
      .withMessage('Senha é obrigatória')
  ],
  tratarErrosValidacao,
  login
);

/**
 * @route   POST /api/auth/registro
 * @desc    Registro de novo médico
 * @access  Public (pode ser protegida por admin depois)
 */
router.post(
  '/registro',
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
  registro
);

/**
 * @route   GET /api/auth/me
 * @desc    Obter informações do usuário autenticado
 * @access  Private
 */
router.get('/me', autenticar, me);

export default router;
