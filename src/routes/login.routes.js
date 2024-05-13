import { Router } from "express";
import { postLogin, putLogin, deleteLogin } from '../controllers/login.controllers.js'
import { validateToken } from "../middleware/jwtMiddleware.js";

const loginRouter = Router();

loginRouter.post('/login', postLogin);
loginRouter.put('/login', validateToken, putLogin)

export default loginRouter