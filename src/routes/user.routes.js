import { Router } from "express";
import { getUser, postUser, putUser, deleteUser, getFavorites, putFavorite, deleteFavorite } from "../controllers/users.controllers.js";

const router = Router()

router.get('/users/:id', getUser)

router.post('/users', postUser)

router.put('/users/:id', putUser)

router.delete('/users/:id', deleteUser)

router.get("/users/:id/favorites", getFavorites)

router.put("/users/:id/favorites/:movieId", putFavorite) // Esto en realidad seria un put porque actualiza o crea el registro en caso que no exista.

router.delete("/users/:id/favorites/:movieId", deleteFavorite)



export default router