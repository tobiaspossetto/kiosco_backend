const jwt = require('jsonwebtoken');

require('dotenv').config()
const Jwt = {}


Jwt.checkJwt = (req, res, next) => {
    //authorization, cabecera que se manda con el token


    const bearerHeader = req.headers['authorization'];
    let jwtPayload;

    if (typeof bearerHeader !== 'undefined') {
        // const bearerToken = bearerHeader.split(' ')[1];


        jwt.verify(bearerHeader, process.env.SECRET_JWT, (err, authData) => {
            if (err) {

                return res.status(403), res.json({ error: 'unauthorized' });


            } else {
                jwtPayload = authData;
                res.locals.jwtPayload = jwtPayload;
                next()
            }
        })

    } else {

        console.log('es undefined')
        return res.status(403), res.json({ error: 'unauthorized' });

    }


}

module.exports = Jwt