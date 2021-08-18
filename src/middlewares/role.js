const pool = require('../config/database')
Role = {}


Role.checkRole = async (req, res, next) => {
    const { userId } = res.locals.jwtPayload;

    try {
        let rows = await pool.query(`SELECT admin FROM users WHERE id = ?`, [userId])

        if (rows[0].admin === 1) {
            next()
        } else {
            return res.status(401).send('unauthorized')
        }
    } catch (error) {
        console.error(error)
        return res.status(401).send('error to conect to database')
    }



}
module.exports = Role