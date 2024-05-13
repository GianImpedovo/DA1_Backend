import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createToken, validateToken } from '../middleware/jwtMiddleware.js';
dotenv.config();

const key = process.env.SECRET_KEY
const user = {
    id: 1,
    name: "Pepe",
    nickName: "Pepito",
    email: "pepe@example.com",
    imgUser: "/img.com",
    accessToken: "",
    googleId: "string",
    expiresIn: 0
};

export const postLogin = async (req, res) => {
    // Aquí verificarías las credenciales del usuario, y si son válidas, generarías un token JWT
    const { googleToken } = req.body;
    if(googleToken === user.googleId ){
        const accessToken = createToken(user);
        res.header('authorization', accessToken).json({
            message: "Usuario correcto", 
            token: accessToken
        });
    } else {
        res.status(401).send({ error: " No se encontro el usuario "})
    }
}

export const putLogin = async (req, res) => {
    const { expiresIn } = req.body
    const accessToken = createToken(user);
    const expireDate = new Date(expiresIn)
    if( expireDate < Date.now()){
        // Renovar token
        res.header('authorization', accessToken).json({
            message: "Token renovado", 
            token: accessToken
        });
    } else {
        res.send("Token expirado")
    }
    
}

export const deleteLogin = async (req, res) => {
    res.json({message: "delete login"})
}