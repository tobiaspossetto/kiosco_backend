const bcryptjs = require('bcryptjs')
const Encryptor = {}
const pool = require('../config/database')
Encryptor.hashPassword = (password) => {
    const salt = bcryptjs.genSaltSync(10);
    password = bcryptjs.hashSync(password, salt);
    return password;
}

Encryptor.checkPassword = async (userPassword, username) => {
    let dbPassword = ''
    try {

        let rows = await pool.query("SELECT password FROM users WHERE username = ?", [username])

        dbPassword = rows[0].password


    } catch (error) {

        console.log(error)
        return 0
    }


    return bcryptjs.compareSync(userPassword, dbPassword)
}

module.exports = Encryptor