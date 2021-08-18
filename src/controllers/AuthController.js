require('dotenv').config()
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const pool = require('../config/database')
const { checkPassword, hashPassword } = require('../lib/encryptor')
const AuthController = {}

//Login
AuthController.login = async (req, res) => {

    //Valida error en los campos con express-validator
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        //si hay errores
        let arrayErrosms = errors.array()
        let arrayMsg = []
        //dejo solo los mensajes y no el valor que puso el usuario para mayor seguridad
        arrayErrosms.forEach(e => {
            arrayMsg.push(e.msg)
        });

        //utilizo solo el mensaje y lo envio
        res.status(400).json({ error: arrayMsg })

    } else {

        //traigo los campos
        const { username, password } = req.body

        let rows = await pool.query("SELECT * FROM users WHERE username = ?", [username])
        if (rows.length > 0) {
            //signfica que existe un usuario con ese nombre
            //llamo a la funcion checkPassword, devuelve 0 o 1 si coincide 
            const verify = await checkPassword(password, username)
            //si coincide
            if (verify) {
                try {
                    //Envio un token creado para el usuario
                    //Libreria JWT, el token expira en 2h para mayor seguridad
                    jwt.sign({ userId: rows[0].id, username: rows[0].username, email: rows[0].email }, process.env.SECRET_JWT, { expiresIn: '2h' }, (err, token) => {
                        res.json({ token, "id": rows[0].id })
                    })


                } catch (error) {
                    console.log(error)
                }

                //si verify es 0, la contraseña no es correcta
            } else {
                res.status(400).send('la contraseña no coincide')

            }
        } else {
            //Si no encontro el usuario en la db
            res.status(404).json({ message: 'username not found' })

        }
    }
}

//Cambiar contraseña 
AuthController.changePassword = async (req, res) => {
    //Como se accede si esta autenticado traigo el id almacenado al iniciar sesión
    const { userId } = res.locals.jwtPayload;
    //Traigo los campos
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    //----- Verifico errores con express-validator
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        //si hay errores
        let arrayErrosms = errors.array()
        let arrayMsg = []

        arrayErrosms.forEach(e => {
            arrayMsg.push(e.msg)
        });
        //utilizo solo el mensaje y lo envio
        res.status(400).json({ error: arrayMsg })


    } else if (newPassword !== confirmNewPassword) {
        //Si los 2 campos no coinciden
        res.status(400).json({ error: "password confirm not coincide" })
    } else {
        //Intenta hacer el llamado a la db buscando por id
        try {
            let rows = await pool.query("SELECT username FROM users WHERE id = ?", [userId])
            //traigo el username de la db con el id almacenado, para mas seguridad
            //verifico la contraseña vieja con su cuenta
            let verify = await checkPassword(oldPassword, rows[0].username)
            if (!verify) {
                res.status(400).json({ error: "old password incorrect" })
            } else {
                //Funcion donde paso la contraseña nueva para cifrarla
                let finalPassword = hashPassword(newPassword)
                //guarda el nuevo texto cifrado en la db, actualizando la anterior
                await pool.query("UPDATE users SET password = ? WHERE id = ?", [finalPassword, userId])
                res.send('password changed')
            }
            //Si el llamado no funciona mando un mensaje de error
        } catch (error) {
            console.log(error)
            res.status(404).json({ message: 'Something goes wrong!' })
        }


    }
}


//datos del perfil ruta 'login/prifile'
AuthController.myProfile = async (req, res) => {

    const { userId } = res.locals.jwtPayload;

        //traigo algunos datos del usuario
        let userDataQuery = await pool.query('SELECT id,username,email,proaTokens from users WHERE id = ?', [userId])

        if (userDataQuery.length > 0) {
            //Creo el objeto userData con la info traida de la db como propiedades
            const userData = { ...userDataQuery[0] }
            //llamo a la db para traer info de las transacciones 
            let transactionsData = await pool.query('SELECT proaTokens, createdAt FROM transactions WHERE userId = ?', [userId])
            //Como la db las trae en un array de objetos dificil de leer lo ordeno en uno nuevo
            const transactionHistory = []
            transactionsData.forEach(i => {
                //Ademas paso el valor timestamp de mysql a fecha entendible con js
                transactionHistory.push({ "proaTokens": i.proaTokens, "date": i.createdAt.toLocaleDateString() })

            })

            //Hago lo mismo con el historial de transacciones
            let rechargesData = await pool.query("SELECT usernameAdmin, proaTokens, createdAt FROM recharges WHERE clientId = ?", [userId])
            const rechargesHistory = []
            rechargesData.forEach(i => {
                rechargesHistory.push({ 'proaTokens': i.proaTokens, 'adminCreator': i.usernameAdmin, 'date': i.createdAt.toLocaleDateString() })
            })


            res.status(200).json({ userData, transactionHistory, rechargesHistory })
        } else {
            res.status(404).json({ message: 'Something goes wrong!' })
        }
 

}


module.exports = AuthController
