const jwt = require('jsonwebtoken');

require('dotenv').config()
const Jwt = {}


Jwt.checkJwt = (req, res, next) => {
    //authorization, cabecera que se manda con el token


    const bearerHeader = req.headers['authorization'];
    let jwtPayload;

    //Si la cabecera no es undefined
    if (typeof bearerHeader !== 'undefined') {


        //Se verifica ese token con la funcion verify, para saber si coincide con el token de la sesión
        jwt.verify(bearerHeader, process.env.SECRET_JWT, (err, authData) => {
            if (err) {

                return res.status(401).json({ error: 'unauthorized' });


            } else {
                jwtPayload = authData;
                res.locals.jwtPayload = jwtPayload;
                next()
            }
        })

    } else {

        
        return res.status(401).json({ error: 'unauthorized' });

    }


}

module.exports = Jwt