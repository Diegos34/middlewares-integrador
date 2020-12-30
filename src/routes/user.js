const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path')
const fs = require('fs')
const userController = require('../controllers/userController');
const {check, body} = require('express-validator');


const authMiddleware = require("../middleware/authMiddleware")
const guestMiddleware = require('../middleware/guestMiddleware')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname + '/../../public/images/users')
      
    },
    filename: function (req, file, cb) {
      
      cb(null, file.fieldname + '-' + Date.now() + '-' +file.originalname)
    }
  })
   
const upload = multer({ storage: storage })

const usersFilePath = path.join(__dirname + "/../database/users.json")

// Muestra la vista de registro
router.get('/register', guestMiddleware, userController.showRegister);

// Procesa la vista de registro
router.post('/register', upload.any(), [
    check('email').isEmail().withMessage('El email debe ser valido'),
    body('email').custom(function (value){
      let fileUsers = fs.readFileSync(usersFilePath,'utf-8');
      let users;
      if(fileUsers == ""){
          users = [];
      } else {
          users = JSON.parse(fileUsers);
      }
  
      for (let i = 0; i< users.length; i++){
        if(users[i].email == value){
          return false;
        }
      }
      return true;
    }).withMessage('Usuario ya existente'),
    check('password').isLength({min: 6}).withMessage('Debe poner una contraseña valida'),
    body('retype').custom((value, { req }) => value == req.body.retype).withMessage('Las contraseñas no coinciden')
  ],userController.processRegister);

// Muestra la vista de login
router.get('/login', guestMiddleware, userController.showLogin);

// Procesa la vista de login
router.post('/login', [
check('email').isEmail().withMessage('Ingrese un mail valido'),
check('password').isLength({min: 6}).withMessage('Clave incorrecta')
], userController.processLogin);

// Muestra el perfil del usuario
router.get('/profile', authMiddleware, userController.showProfile);

// Cierra la sesión
router.get('/logout', userController.logout);

module.exports = router;