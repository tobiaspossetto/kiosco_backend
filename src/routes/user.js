
const { Router } = require('express');
const router = Router();
const { body } = require('express-validator')
const { checkJwt } = require('../middlewares/jwt')

const { getAll, getById, newUser, editUser, deleteUser,chargeProaTokens,myProfile ,transaction} = require('../controllers/UserController')
const { checkRole } = require('../middlewares/role')


router.route('/')
    .get(checkJwt, checkRole, getAll)


    //CREATE USER, EXPRESS VALIDATOR
    .post(checkJwt, checkRole,
        body('username', 'Username value error')
            .exists()
            .isLength({ min: 6 }),
        body('email', 'Invalid Email')
            .exists()
            .isEmail(),
        body('admin', 'role value error')
            .exists()
            .isNumeric(),

        body('password', 'password value incorrect')
            .exists()
            .isLength({ min: 6 }),
        body("proaTokens", "proaTokens value are required, is numeric")
            .exists()
            .isNumeric(),

        newUser)

router.route('/:id')
    .get(checkJwt, checkRole, getById)

    .patch(checkJwt, checkRole,
        body('username', 'Username value error')
            .exists()
            .isLength({ min: 6 }),
        body('email', 'Invalid Email')
            .exists()
            .isEmail(),
        body('admin', 'role value error')
            .exists()
            .isNumeric(),

        editUser)
    .delete(checkJwt, checkRole, deleteUser)

//Agregar proaTokens siendo admin
router.route('/profile/:id')
        .get(checkJwt, myProfile)



router.route('/transaction')
        .post(
            checkJwt,
            body('quantity', 'quantity value error, check the value')
            .exists()
            .isNumeric(),
        body('quantityConfirm', 'quantityConfirm value error, check the value')
            .exists()
            .isNumeric(),
            
            
            transaction)

router.route('/recharge')
    

    .post(checkJwt, checkRole,
        body('clientUsername', 'Username value error')
            .exists()
            .isLength({ min: 6 }),
        body('quantity', 'Invalid quantity')
            .exists()
            .isNumeric(),
            
        

        chargeProaTokens)
    .delete(checkJwt, checkRole, deleteUser)


module.exports = router;