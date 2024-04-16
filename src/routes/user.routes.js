import { Router } from "express";
import { getUsers, getUser, postUser, putUser, deleteUser } from "../controllers/users.controllers.js";

const router = Router()

router.get('/users', getUsers)

router.get('/users/:id', getUser)

router.post('/users', postUser)

router.put('/users/:id', putUser)

router.delete('/users/:id', deleteUser)



export default router