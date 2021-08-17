


const { validationResult } = require('express-validator')
const pool = require('../config/database')
const UserController = {}
const {hashPassword}   = require('../lib/encryptor')
UserController.getAll = async (req, res) => {

    let rows = await pool.query("SELECT id, username, email, admin,proaTokens, createdAt FROM users")
        if (rows.length > 0) {
            res.json(rows)
        } else {
            res.status(404).json({ message: 'Not results' })
        }
    
}




UserController.getById = async (req, res) => {
    const { id } = req.params;

    let rows = await pool.query("SELECT id, username, email, admin,proaTokens, createdAt  FROM users WHERE id = ?", [id])
        if (rows.length > 0) {

             res.json(rows[0])
         
        } else {
            res.status(404).json({ message: 'Not results' })
        }
 

   

}


UserController.newUser = async (req, res) => {

   
    //Valida los campos
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
        //se crea el usuario 

        const { username, password, admin, email, proaTokens, student, year, division } = req.body;
        let passwordEncrypted = hashPassword(password)
        const newUser = {
            username,
            password: passwordEncrypted,
            admin,
            email,
            proaTokens,
            student,
            year:0,
            division:''

        }
        //si me esta diciendo que no es alumno pero le metiste un curso o division
        console.log(student)
        console.log(year)
        console.log(division)
        if(student === 0 & year !== 0 || student === 0 & division != '') {
            return res.status(400).json({ message: 'if not is a student not can be year or division' })
            
        }else if(student == 1 & year<8 & year>0 & division != '' ){
            //si es estudiante y year esta entre 1-7 y division no esta vacia
            
                newUser.year = year,
                newUser.division = division
            
            
                
            
        }else{
            return res.status(400).json({ message: 'if  is a student  can be year and division valid' })
        }
       
        //Valida con la db que el usuario o correo no exista
        try {
            
           let rows = await pool.query("SELECT * FROM users WHERE username = ? or email = ?", [username, email])
         
                if (rows.length > 0) {
                    
                    res.status(400).json({ message: 'username or email already exists' })
                }else {
                    try {
           
                        let insert = await pool.query("INSERT INTO users set ?", [newUser])
                        res.status(200)
                        res.send('User Created')
                    } catch (error) {
                        res.status(404).json({ message: 'Creation error' })
                    }
                         
    
                    
                }
            
        } catch (error) {
            console.log(error)
            res.status(404).json({ message: 'Creation error' })
        }
       

       


    }

    

}

UserController.editUser = async(req, res) => {
     //Valida los campos
     const errors = validationResult(req)
     if(!errors.isEmpty()) {
         //si hay errores
 
 
         let arrayErrosms = errors.array()
         let arrayMsg = []
 
         arrayErrosms.forEach(e => {
             arrayMsg.push(e.msg)
         });
         //utilizo solo el mensaje y lo envio
         res.status(400).json({ error: arrayMsg })
 
     }else {
         
             const {id} = req.params;
             const{username,admin,email,proaTokens} = req.body;
           
             const finalUser = {username,email,admin, proaTokens}
              //Valida con la db que el usuario o correo no exista
            try {
             let rows = pool.query("SELECT * FROM users WHERE username = ? or email = ?", [username, email])
                if (rows.length > 0) {
                    res.status(401).json({ message: 'username or email already exists' })
                }else {
                    let insert = await pool.query('UPDATE users SET ? WHERE id = ?', [finalUser, id]);
                    res.status(201).json({message: 'User update'})
                         
    
                    
                }
          
        } catch (error) {
            console.log(error)
            res.status(404).json({ message: 'update error' })
        }
          
    }
   
}


UserController.deleteUser = async(req, res) => {
    const {id} = req.params
    
    try {
        let rows = await pool.query("SELECT * FROM users WHERE id = ?", [id])
           if (rows.length > 0)  {
             await pool.query('DELETE FROM users WHERE id = ?', [id]);
            res.status(201).json({message: 'User deleted'})
           }else {
              
                    
               res.status(404).json({ message: 'user not found' })
               
           }
      
   } catch (error) {
       console.log(error)
       res.status(404).json({ message: 'update error' })
   }
     
}

      
     
UserController.chargeProaTokens = async (req, res) => {
    const {  userId,username} = res.locals.jwtPayload;
    const {clientUsername,quantity} = req.body
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        //si hay errores


        let arrayErrosms = errors.array()
        let arrayMsg = []

        arrayErrosms.forEach(e => {
            arrayMsg.push(e.msg)
        });
        //utilizo solo el mensaje y lo envio
        res.status(400).json({ error: arrayMsg })

    }else {
        let rows = await pool.query('select id, proaTokens from users where username = ?',[clientUsername])
        if(rows.length > 0){
            const recharge = {
                proaTokens: quantity,
                admCreatorId: userId,
                clientId: rows[0].id,
                usernameClient: clientUsername,
                usernameAdmin: username
            }
            await pool.query('INSERT INTO recharges set ?',[recharge])

            const updateProaTokens = rows[0].proaTokens + quantity
            await pool.query('UPDATE  users SET proaTokens = ? WHERE id = ?',[updateProaTokens, rows[0].id])
            res.send('recargado')
        }else{
            res.status(404).json({ error: "username not found"}) 
        }
    }
}

UserController.myProfile = async (req, res) => {
   const {id} = req.params
   const { userId } = res.locals.jwtPayload;
    if(id == userId){
        let rows = await pool.query('SELECT username,email,proaTokens from users WHERE id = ?',[id])
   if(rows.length > 0){
        const userData = {...rows[0]}
        res.status(200).json(userData)
   }else{
    res.status(404).json({message:'Something goes wrong!'})
   }
    }else{
        console.log(id),
        console.log(userId)
        res.status(403).send('unauthorized')
    }
   
}

UserController.transaction = async (req, res) => {
    const { userId,username } = res.locals.jwtPayload;
    const{quantity, quantityConfirm} = req.body

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        //si hay errores


        let arrayErrosms = errors.array()
        let arrayMsg = []

        arrayErrosms.forEach(e => {
            arrayMsg.push(e.msg)
        });
        //utilizo solo el mensaje y lo envio
        res.status(400).json({ error: arrayMsg })

    }else {
        if(quantity !== quantityConfirm){
            res.status(400).json('check quantityConfirm value')
        }else{
            let rows = await pool.query('select proaTokens from users where id = ?',[userId])

            if(rows[0].proaTokens - quantity < 0){
                res.status(400).json('proaTokens insuficient')
            }else{

                const transaction = {
                    userId,username:username,proaTokens: quantity
                }
                console.log(transaction)
                 await pool.query('insert into transactions set ?',[transaction])
                 let rows = await pool.query('select transactionTotal from transactions ')
                
                 await pool.query('UPDATE transactions SET transactionTotal = ?',[rows[0].transactionTotal + quantity])
                 res.send('enviado')
            }
        }
    }
}


module.exports = UserController

