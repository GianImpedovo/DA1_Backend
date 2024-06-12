import { Router } from "express";
import { postLogin, putLogin, deleteLogin, postLoginToken } from '../controllers/login.controllers.js'
import { validateToken } from "../middleware/jwtMiddleware.js";

const loginRouter = Router();

loginRouter.post('/login', postLogin);
loginRouter.post('/login/token', postLoginToken);
loginRouter.put('/login', validateToken, putLogin)
loginRouter.delete('/login', validateToken, deleteLogin)

export default loginRouter