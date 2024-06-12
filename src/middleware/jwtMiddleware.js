import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.SECRET_KEY

export function createToken(user){
    const expiresIn = 3600
    const expirationDate = Math.floor(Date.now() / 1000) + expiresIn;
    return jwt.sign({ 
        id:  user.google_id,
        exp: expirationDate
    }, 
    key
    )
}

export function validateToken(req, res, next){
    const bearer = req.headers['authorization']; // Chequeo la cabecera que contenga una autenticacion
    if (!bearer) return res.status(401).send({ auth: false, message: 'Token no proporcionado.' });

    const token = bearer.split(" ")[1] // Obtengo unicamente el token que viene en formato: bearer <token>, usando split -> ["bearer", "<token>"]
    jwt.verify(token, key, (error, decodedToken) => {
        if(error){
            res.send("Acceso denegado")
        } else {
            const currentDate = Math.floor(Date.now() / 1000); // Fecha actual en segundos
            if (decodedToken.exp <= currentDate) {
                res.status(401).send("El token ha expirado");
            }

            next();
        }
    })
}