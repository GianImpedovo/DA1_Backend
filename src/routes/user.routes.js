import { Router } from "express";
import { getUsers, getUser, postUser, putUser, deleteUser, getFavorites, postFavorite, deleteFavorite } from "../controllers/users.controllers.js";

const router = Router()

router.get('/users', getUsers)

router.get('/users/:id', getUser)

router.post('/users', postUser)

router.put('/users/:id', putUser)

router.delete('/users/:id', deleteUser)

router.get("/users/:id/favorites", getFavorites)

router.post("/users/:id/favorites/:movieId", postFavorite)

router.delete("/users/:id/favorites/:movieId", deleteFavorite)



export default router