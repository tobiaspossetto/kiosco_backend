const { Router } = require('express');
const router = Router();
const { login, changePassword, myProfile } = require('../controllers/AuthController')
const { body } = require('express-validator')

const { checkJwt } = require('../middlewares/jwt')


//Ruta 'login' 
//donde se inicia sesión 
router.route('/')
    .post(
        //Se verifica con express validator los campos 

        body('username', 'Username value error')
            .exists()
            .isLength({ min: 6 }),
        body('password', 'password value incorrect')
            .exists()
            .isLength({ min: 6 }),
        
            login)

// ruta '/login/profile'
//se puede obtener informacion del usuario para su perfil. 
//Solo si esta autenticado(checkJwt)

router.route('/profile')
    .get(checkJwt, myProfile)

//ruta 'login/changepassword'
//Se puede cambiar la contraseña
//Accedida si esta autenticado
router.route('/change-password')
    .post(
        checkJwt,
        
        body('oldPassword', 'old password value are required')
            .exists()
            .isLength({ min: 6 }),
        body('newPassword', 'new password value are required')
            .exists()
            .isLength({ min: 6 }),
        body('confirmNewPassword', 'confirm password incorrect')
            .exists()
            .isLength({ min: 6 }),

        changePassword)


module.exports = router;
