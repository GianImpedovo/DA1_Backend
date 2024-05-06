import { Router } from "express";
import { postLogin, putLogin, deleteLogin } from '../controllers/login.controllers.js'

const router = Router();

router.post("/login", postLogin)

router.put("/login", putLogin)

router.delete("/login", deleteLogin)

export default router