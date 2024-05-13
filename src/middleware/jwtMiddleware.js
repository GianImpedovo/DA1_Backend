import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.SECRET_KEY

export function createToken(user){
    return jwt.sign({ id:  user.id }, key, {
        expiresIn: 86400 // Expira en 24 horas
    })
}

export function validateToken(req, res, next){
    const bearer = req.headers['authorization']; // Chequeo la cabecera que contenga una autenticacion
    if (!bearer) return res.status(401).send({ auth: false, message: 'Token no proporcionado.' });

    const token = bearer.split(" ")[1] // Obtengo unicamente el token que viene en formato: bearer <token>, usando split -> ["bearer", "<token>"]
    jwt.verify(token, key, (error, user) => {
        if(error){
            res.send("Acceso denegado")
        } else {
            next()
        }
    })
}