import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createToken, validateToken } from '../middleware/jwtMiddleware.js';
import { UserModel } from '../models/user.js';
dotenv.config();

export const postLogin = async (req, res) => {  // CREO TOKEN
    const { googleId } = req.body;
    try {
        const user = await UserModel.getUser(googleId)
        if(user){
            const accessToken = createToken(user);
            const decodeToken = jwt.decode(accessToken)
            res.header('authorization', accessToken).json({
                message: "Usuario correcto",
                token: accessToken,
                expiresIn: decodeToken.exp,
                user: {
                    id: user.google_id,
                    name: user.nombre,
                    lastname: user.apellido,
                    nickname: user.nickname,
                    email: user.correo_electronico,
                    photo: user.foto_perfil
                }
            });
        } else {
            
            const newUser = await UserModel.postUser(req.body)
            const accessToken = createToken(newUser);
            const decodeToken = jwt.decode(accessToken)
            res.header('authorization', accessToken).json({
                message: "Usuario creado y autenticado",
                token: accessToken,
                expiresIn: decodeToken.exp,
                user: {
                    id: newUser.google_id,
                    name: newUser.nombre,
                    lastname: newUser.apellido,
                    nickname: newUser.nickname,
                    email: newUser.correo_electronico,
                    photo: newUser.foto_perfil
                }
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al autenticar usuario.' });
    }
}

export const putLogin = async (req, res) => {  // RENOVAR TOKEN
    const { user } = req.body
    const accessToken = createToken(user);
    const decodeToken = jwt.decode(accessToken)
    res.header('authorization', accessToken).json({
        message: "Token renovado", 
        token: accessToken,
        expiresIn: decodeToken.exp
    });
}

export const deleteLogin = async (req, res) => { // Debatir con las chicas porque podes simplemente eliminar el token desde el cliente
    res.json({message: "delete login"})
}