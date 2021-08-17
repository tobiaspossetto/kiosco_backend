
const jwt = require('jsonwebtoken')

require('dotenv').config()



const { validationResult } = require('express-validator')
const pool = require('../config/database')
const { checkPassword,hashPassword } = require('../lib/encryptor')
const AuthController = {}

AuthController.login = async (req, res) => {


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

    } else {

        const { username, password } = req.body

        try {
            let rows = await pool.query("SELECT * FROM users WHERE username = ?", [username])
            if (rows.length > 0) {
                //signfica que existe un usuario con ese nombre


                const verify = await checkPassword(password, username)

                if (verify) {
                    try {
                        //Envio un token creado para el usuario
                        jwt.sign({ userId: rows[0].id, username: rows[0].username, email: rows[0].email }, process.env.SECRET_JWT, { expiresIn: '2h' }, (err, token) => {
                            res.json({ token, "id": rows[0].id })
                        })


                    } catch (error) {
                        console.log(error)
                    }


                } else {
                    res.send('la contraseña no coincide')

                }
            } else {
                res.status(400).json({ message: 'username not found' })

            }

        } catch (error) {
            res.status(404).json({message:'Something goes wrong!'})
            console.log(error)
        }


    }

    
    }
AuthController.changePassword = async (req, res) => {
    const { userId } = res.locals.jwtPayload;
    const {oldPassword, newPassword, confirmNewPassword } = req.body;
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
        res.status(400).json({ error: " password confirm not coincide" })
    }else{
        try {
            let rows = await pool.query("SELECT username FROM users WHERE id = ?", [userId])
            let verify  = await checkPassword(oldPassword, rows[0].username)
            if(!verify){
                res.status(400).json({ error: "old password incorrect" })
            }else{
                let finalPassword = hashPassword(newPassword) 
                await pool.query("UPDATE users SET password = ? WHERE id = ?",[finalPassword, userId])
                res.send('password changed')
            }
        } catch (error) {
            console.log(error)
            res.status(404).json({message:'Something goes wrong!'})
        }
       
        
    }
}





module.exports = AuthController
