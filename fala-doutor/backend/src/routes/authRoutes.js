const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validarCadastroPaciente, validarLogin } = require('../middlewares/validacao');

// Rotas de paciente
router.post('/paciente/cadastro', validarCadastroPaciente, authController.cadastroPaciente);
router.post('/paciente/login', validarLogin, authController.loginPaciente);

// Rotas de médico
router.post('/medico/login', validarLogin, authController.loginMedico);

module.exports = router;
