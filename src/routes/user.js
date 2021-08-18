
const { Router } = require('express');
const router = Router();
const { body } = require('express-validator')
const { checkJwt } = require('../middlewares/jwt')

const { getAll, getById, newUser, editUser, deleteUser, chargeProaTokens, transaction } = require('../controllers/UserController')
const { checkRole } = require('../middlewares/role')

//Ruta 'users/'
router.route('/')
    //Si se accede por get, muestra todos los usuarios
    //Solo para quien este autenticado y sea admin
    .get(checkJwt, checkRole, getAll)


    //Por post se crea un usuario, solo pueden hacerlo admins.
    //Se usa express-validator para ayudar a validar los campos
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
        body("student", "student value are required, is numeric")
            .exists()
            .isNumeric(),

        newUser)

//Ruta users/id para ver cierto usuario, editar o eliminar un usuario. Solo administradores
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



//Ruta users/transactions
//Para enviar proaTokens al kiosco, tiene que estar autenticado
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

//Ruta users/recharge, para agregar proaTokens a un usuario. Solo admins
router.route('/recharge')

    .post(checkJwt, checkRole,

        body('clientUsername', 'Username value error')
            .exists()
            .isLength({ min: 6 }),
        body('quantity', 'Invalid quantity')
            .exists()
            .isNumeric(),

        chargeProaTokens)

    


module.exports = router;