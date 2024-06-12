import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createToken } from '../middleware/jwtMiddleware.js';
import { UserModel } from '../models/user.js';
dotenv.config();

const key = process.env.SECRET_KEY

const loginToken = async (token) => {
    const tokenInfo = jwt.verify(token, key)
    try {
        const user = await UserModel.getUser(tokenInfo.id)
        return user.google_id
    } catch (error) {}
}

export const postLoginToken = async (req, res) => {
    
    try {
        const googleId = await loginToken(req.body.token)
        const user = await UserModel.getUser(googleId)
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
    } catch (error) {
        
    }
}

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
            console.log(newUser)
            res.header('authorization', accessToken).json({
                message: "Usuario creado y autenticado",
                token: accessToken,
                expiresIn: decodeToken.exp,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    lastname: newUser.lastname,
                    nickname: newUser.nickname,
                    email: newUser.email,
                    photo: newUser.photo
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