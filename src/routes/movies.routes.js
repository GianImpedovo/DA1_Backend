import { Router } from "express";
import { getMovies, getMovie, clasifiedMovie } from "../controllers/movies.controllers.js";

const router = Router();

router.get("/movies", getMovies)

router.get("/movies/:id", getMovie)

router.post("/movies/:movieId/:userId", clasifiedMovie)

export default router