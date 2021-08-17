const { Router } = require('express');
const router = Router();
const { login, changePassword } = require('../controllers/AuthController')
const { body } = require('express-validator')
//const AuthController = require('../controllers/AuthController')
const { checkJwt, newToken } = require('../middlewares/jwt')
// import {checkJwt} from '../middlewares/jwt'

router.route('/')
    .post(

        body('username', 'Username value error')
            .exists()
            .isLength({ min: 6 }),


        body('password', 'password value incorrect')
            .exists()
            .isLength({ min: 6 }),


        login)

// //login
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

// //change password
// router.post('/change-password',  AuthController.changePassword)

module.exports = router;
