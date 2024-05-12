import { Router } from "express";
import { getMovies, getMovie, clasifiedMovie, getGenre } from "../controllers/movies.controllers.js";

const movieRouter = Router();

movieRouter.get("/movies/generos", getGenre) 

movieRouter.get("/movies", getMovies)

movieRouter.get("/movies/:id", getMovie)

movieRouter.post("/movies/:movieId/:userId", clasifiedMovie)



export default movieRouter