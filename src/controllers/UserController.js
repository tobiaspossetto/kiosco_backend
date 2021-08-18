const { validationResult } = require('express-validator')
const pool = require('../config/database')
const UserController = {}
const { hashPassword } = require('../lib/encryptor')

//Traer todos los usuarios
UserController.getAll = async (req, res) => {

    let rows = await pool.query("SELECT id, username, email, admin,proaTokens, createdAt FROM users")
    if (rows.length > 0) {
        rows.forEach(row => {
            row.createdAt = row.createdAt.toLocaleDateString()
        })
        res.json(rows)
    } else {
        res.status(404).json({ message: 'Not results' })
    }

}



//Traer usuario por id
UserController.getById = async (req, res) => {
    const { id } = req.params;

    let rows = await pool.query("SELECT id, username, email, admin,proaTokens,student,year,division, createdAt  FROM users WHERE id = ?",
        [id])


    if (rows.length > 0) {
        //Si el usuario no es alumno, no necesito los campos year y division
        if (rows[0].student == 0) {
            delete rows[0].year
            delete rows[0].division
        }
        //paso la fecha a formato mas entendible
        rows[0].createdAt = rows[0].createdAt.toLocaleDateString()
        //traigo tambien el historial de transacciones y de recargas
        let transactionsData = await pool.query("SELECT proaTokens, createdAt FROM transactions WHERE userId = ?", [id])
        let rechargesData = await pool.query("SELECT usernameAdmin, proaTokens, createdAt FROM recharges WHERE clientId = ?", [id])

        //Como vienen de una forma dificil de entender los limpio en nuevos arrays
        const transactionHistory = []
        const rechargesHistory = []
        transactionsData.forEach(i => {

            transactionHistory.push({ "proaTokens": i.proaTokens, "date": i.createdAt.toLocaleDateString() })

        })

        rechargesData.forEach(i => {
            rechargesHistory.push({ 'proaTokens': i.proaTokens, 'adminCreator': i.usernameAdmin, 'date': i.createdAt.toLocaleDateString() })
        })
        res.json({ 'info': rows[0], transactionHistory, rechargesHistory })

    } else {
        res.status(404).json({ message: 'Not results' })
    }




}

//Crear nuevo usuario. Ruta 'users' (post)
UserController.newUser = async (req, res) => {


    //Valida los campos con express-validator

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        //si hay errores

        //Me quedo solo con los mensajes para mas seguridad
        let arrayErrosms = errors.array()
        let arrayMsg = []

        arrayErrosms.forEach(e => {
            arrayMsg.push(e.msg)
        });
        //utilizo solo el mensaje y lo envio
        res.status(400).json({ error: arrayMsg })

    } else {
        //se crea el usuario 

        const { username, password, admin, email, proaTokens, student, year, division } = req.body;
        //funcion que cifra la contraseña del usuario
        let passwordEncrypted = hashPassword(password)
        const newUser = {
            username,
            password: passwordEncrypted,
            admin,
            email,
            proaTokens,
            student,
            year: 0,
            division: ''

        }

        //si me esta diciendo que no es alumno pero le metiste un curso o division
        if (student == 0) {
            if (year != 0 || division != '') {

                return res.status(400).json({ message: 'if not is a student not can be year or division' })
            }

        } else if (year < 8 & year > 0 & division != '') {
            //si es estudiante y year esta entre 1-7 y division no esta vacia
            newUser.year = year,
                newUser.division = division

        } else {

            return res.status(400).json({ message: 'if  is a student  can be year and division valid' })
        }

        //Valida con la db que el usuario o correo no exista
        try {

            let rows = await pool.query("SELECT * FROM users WHERE username = ? or email = ?", [username, email])

            if (rows.length > 0) {

                res.status(400).json({ message: 'username or email already exists' })
            } else {
                try {

                    await pool.query("INSERT INTO users set ?", [newUser])
                    res.status(200)
                    res.send('User Created')
                } catch (error) {
                    console.log(error)
                    res.status(404).json({ message: 'Creation error' })
                }



            }

        } catch (error) {
            console.log(error)
            res.status(404).json({ message: 'Creation error' })
        }





    }



}

//editar usuario. Ruta 'users/id PATCH
UserController.editUser = async (req, res) => {
    //Valida los campos con express-validator
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
        const { id } = req.params;
        const { username, admin, email, proaTokens } = req.body;

        const finalUser = { username, email, admin, proaTokens }

        //Valida con la db que el usuario o correo no exista
        try {
            let rows = pool.query("SELECT * FROM users WHERE username = ? or email = ?", [username, email])
            if (rows.length > 0) {
                res.status(400).json({ message: 'username or email already exists' })
            } else {
                await pool.query('UPDATE users SET ? WHERE id = ?', [finalUser, id]);
                res.status(200).json({ message: 'User update' })



            }

        } catch (error) {
            console.log(error)
            res.status(404).json({ message: 'update error' })
        }

    }

}


UserController.deleteUser = async (req, res) => {
    const { id } = req.params

    try {
        //Primero verifico que el usuario existe
        let rows = await pool.query("SELECT * FROM users WHERE id = ?", [id])
        if (rows.length > 0) {
            await pool.query('DELETE FROM users WHERE id = ?', [id]);
            res.status(200).json({ message: 'User deleted' })
        } else {
            res.status(404).json({ message: 'user not found' })

        }

    } catch (error) {
        console.log(error)
        res.status(404).json({ message: 'update error' })
    }

}


//Recargar proAtokens a usuario
//Ruta users/recharge
UserController.chargeProaTokens = async (req, res) => {
    //Como el admin debe estar autenticado busco su id y nombre de usuario para guardarlo en el registro
    const { userId, username } = res.locals.jwtPayload;

    const { clientUsername, quantity } = req.body
    //Verifico si hay errores con express-validator
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
        //traigo datos del cliente segun el nombre que me dio el admin
        let rows = await pool.query('select id, proaTokens from users where username = ?', [clientUsername])
        if (rows.length > 0) {
            //si ese usuario existe
            //creo la recarga
            const recharge = {
                proaTokens: quantity,
                admCreatorId: userId,
                clientId: rows[0].id,
                usernameClient: clientUsername,
                usernameAdmin: username
            }
            //La inserto en la tabla de recargas
            await pool.query('INSERT INTO recharges set ?', [recharge])

            //le sumo a los proaTokens que tenia el usuario el valor que va a tener ahora
            const updateProaTokens = rows[0].proaTokens + quantity
            //Se lo inserto en la tabla usuarios
            await pool.query('UPDATE  users SET proaTokens = ? WHERE id = ?', [updateProaTokens, rows[0].id])
            res.status(200).send('proaTokens update successfully ')
        } else {
            res.status(404).json({ error: "username not found" })
        }
    }
}


//Transaction realizada por un usuario al kiosco
//Ruta users/transaction

UserController.transaction = async (req, res) => {
    //id y nombre de usuario del usuario autenticado
    const { userId, username } = res.locals.jwtPayload;
    const { quantity, quantityConfirm } = req.body

    //Validacion de errores con express-validator
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
        //Validacion de que la confimacion de cantidad y la cantidad sean iguales
        if (quantity !== quantityConfirm) {
            res.status(400).json('check quantityConfirm value')
        } else {
            //Se buscan los proaTokens del usuario 
            let userQuery = await pool.query('select proaTokens from users where id = ?', [userId])

            //Si quitandoles lo que transfiere va a tener menor a 0 entonces no se sigue
            if (userQuery[0].proaTokens - quantity < 0) {
                res.status(400).json('proaTokens insuficient')
            } else {
                //Se crea la transferencia
                const transaction = {
                    userId, username: username, proaTokens: quantity
                }

                //Se resta al usuario esos proaTokens
                await pool.query('UPDATE users SET proaTokens = ? WHERE id = ?', [userQuery[0].proaTokens - quantity, userId])

                //Se inserta
                await pool.query('insert into transactions set ?', [transaction])
                let rows = await pool.query('select transactionTotal from transactions ')
                //El total de transaccion que tiene el kiosco se le suma la nueva transaccion
                await pool.query('UPDATE transactions SET transactionTotal = ?', [rows[0].transactionTotal + quantity])
                res.status(200).send('Transaction success')
            }
        }
    }
}


module.exports = UserController

