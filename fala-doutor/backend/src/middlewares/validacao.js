const { body, validationResult } = require('express-validator');

// Middleware para verificar erros de validação
const verificarValidacao = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validações para cadastro de paciente
const validarCadastroPaciente = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('cpf')
    .trim()
    .notEmpty().withMessage('CPF é obrigatório')
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).withMessage('CPF inválido (use: 000.000.000-00)'),
  body('email')
    .trim()
    .notEmpty().withMessage('E-mail é obrigatório')
    .isEmail().withMessage('E-mail inválido'),
  body('senha')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('dataNascimento')
    .notEmpty().withMessage('Data de nascimento é obrigatória')
    .isISO8601().withMessage('Data de nascimento inválida'),
  verificarValidacao,
];

// Validações para login
const validarLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('E-mail é obrigatório')
    .isEmail().withMessage('E-mail inválido'),
  body('senha')
    .notEmpty().withMessage('Senha é obrigatória'),
  verificarValidacao,
];

module.exports = {
  validarCadastroPaciente,
  validarLogin,
  verificarValidacao,
};
