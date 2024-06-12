import axios from 'axios';
import dotenv from 'dotenv';
import { getConnection } from '../db/connection.js';
import sql from 'mssql';
import { MovieModel } from '../models/movie.js';
import { InteractionMovieModel } from '../models/interactionMovie.js';

dotenv.config();

const discover = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false'

const accessToken = process.env.ACCESS_TOKEN;
const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${accessToken}`
};

export const getSignInMovies = async (req, res) => {
    const url = 'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1'

    try {
        let resPeliculas = Array();
        const response = await axios.get(url, { headers });
        const peliculas = response.data.results.slice(0, 3)
        for (let i = 0; i < peliculas.length; i++) {
            resPeliculas.push({
                "id": peliculas[i].id,
                "title": peliculas[i].title,
                "image": 'https://image.tmdb.org/t/p/original' + peliculas[i].poster_path})
        }
        res.send(resPeliculas)
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

function busquedaHeuristica(busqueda){
    const palabrasComunes = ["el", "la", "los", "las", "un", "una", "unos", "unas", "al", "en", "the", "a", "an", "of", "on", "at", "by", "with", "from", "to", "into", "within", "out", "up", "down", "over", "under", "between", "among"];
    const titulo = busqueda.toLowerCase().split(" ")
    for (let i = 0; i < titulo.length; i++) {
        if(palabrasComunes.includes(titulo[i])) return true
    }
    return false;
}

async function obtenerPeliculas(url){
    try {
        let resPeliculas = Array();
        const response = await axios.get(url, { headers });
        const peliculas = response.data.results
        if(peliculas){
            peliculas.sort((a, b) => b.popularity - a.popularity);
            for (let i = 0; i < peliculas.length; i++) {
                resPeliculas.push({
                    "id": peliculas[i].id,
                    "title": peliculas[i].title,
                    "popularity": peliculas[i].popularity,
                    "release_date": peliculas[i].release_date,
                    "vote_average": peliculas[i].vote_average,
                    "image": 'https://image.tmdb.org/t/p/original' + peliculas[i].poster_path})
            }
        }
        return resPeliculas

    } catch (error) {
        console.error('Error:', error);
    }
}

async function obtenerPeliculasPorBuscador(busqueda, language, page){
    const url = `https://api.themoviedb.org/3/search/movie?query=${busqueda}&language=${language}&page=${page}`
    const respuesta = await obtenerPeliculas(url)
    return respuesta;
}

async function obtenerActoresPorBuscador(busqueda){
    const url = `https://api.themoviedb.org/3/search/person?query=${busqueda}`
    try {
        let resActores = Array();
        const response = await axios.get(url, { headers });
        let actores = response.data.results
        actores = actores.filter(actor => actor.known_for_department == "Acting")
        actores.sort((a, b) => b.popularity - a.popularity);
        for (let i = 0; i < actores.length; i++) {
            resActores.push({
                "id": actores[i].id,
                "name": actores[i].name,
                "popularity": actores[i].popularity,
                "img": 'https://image.tmdb.org/t/p/original' + actores[i].profile_path
            })
        }
        return resActores

    } catch (error) {}
}

async function obtenerPeliculasActor(actorId){
    const url = `https://api.themoviedb.org/3/person/${actorId}/movie_credits`
    let resPeliculas = Array();
    try {
        const response = await axios.get(url, { headers });
        const peliculas = response.data.cast
        if(peliculas){
            peliculas.sort((a, b) => b.popularity - a.popularity);
            for (let i = 0; i < peliculas.length; i++) {
                resPeliculas.push({
                    "id": peliculas[i].id,
                    "title": peliculas[i].title,
                    "popularity": peliculas[i].popularity,
                    "release_date": peliculas[i].release_date,
                    "vote_average": peliculas[i].vote_average,
                    "image": 'https://image.tmdb.org/t/p/original' + peliculas[i].poster_path})
            }
        }
        return resPeliculas
    } catch (error) {}
    return resPeliculas;
}

async function ordenarListados(peliculas, actores){ 
    if(actores.length != 0 && peliculas.length != 0){
        if( peliculas[0].popularity > actores[0].popularity ){
            for (let i = 0; i < actores.length; i++) {
                let peliculasActor = await obtenerPeliculasActor(actores[i].id)
                if(peliculasActor){
                    peliculasActor.sort((a, b) => b.popularity - a.popularity)
                    for (let i = 0; i < peliculasActor.length; i++) {
                        if(!peliculas.includes(peliculasActor[i])) peliculas.push(peliculasActor[i])
                    }
                }
            }
            return peliculas
        } else {
            let peliculasActor = await obtenerPeliculasActor(actores[0].id)
            peliculasActor.sort((a, b) => b.popularity - a.popularity)
            for (let i = 0; i < peliculas.length; i++) {
                peliculasActor.push(peliculas[i])
            }
            return peliculasActor
        }
    }
    return peliculas
}

async function busquedaTituloActor( search , language, page) {
    let posiblePelicula = busquedaHeuristica(search)
    let peliculas = await obtenerPeliculasPorBuscador(search, language, page)
    if(!posiblePelicula){ // Es un simple chequeo si es una posible pelicula entonces solo busco en peliculas
        const actores = await obtenerActoresPorBuscador(search)
        peliculas = await ordenarListados(peliculas, actores)
    }
    return peliculas
}

async function busquedaGenero(language, genre, page){
    const url = `https://api.themoviedb.org/3/discover/movie?language=${language}&page=${page}&sort_by=popularity.desc&with_genres=${genre}`;
    const respuesta = await obtenerPeliculas(url);
    return respuesta;
}

async function busquedaMasPopular(language, page){
    const url = `https://api.themoviedb.org/3/movie/now_playing?language=${language}&page=${page}`;
    const respuesta = await obtenerPeliculas(url)
    return respuesta;
}

//e. El resultado de una búsqueda se podrá ordenar por fecha de publicación y/o calificación.
function ordenarRespuestaPeliculas(orderBy, respuesta){
    let orderValues = orderBy.split(',').map(pair => { let[key,value] = pair.split(':');
        return {key, value};
     });
    
     respuesta.sort((a, b) => {
        for (let order of orderValues) {
            if (order.key === 'release_date') {
                let dateA = new Date(a.release_date);
                let dateB = new Date(b.release_date);
                if (order.value === 'asc') {
                    if (dateA < dateB) return -1;
                    if (dateA > dateB) return 1;
                } else {
                    if (dateA > dateB) return -1;
                    if (dateA < dateB) return 1;
                }
            } else if (order.key === 'vote_average') {
                if (order.value === 'asc') {
                    if (a.vote_average < b.vote_average) return -1;
                    if (a.vote_average > b.vote_average) return 1;
                } else {
                    if (a.vote_average > b.vote_average) return -1;
                    if (a.vote_average < b.vote_average) return 1;
                }
            }
        }
        return 0;
    });
    return respuesta;
}

export const getMovies = async (req, res) => {
    const { search, orderBy, genre, limit,language, page } = req.query;
    let respuesta = []
    if(search){
        respuesta = await busquedaTituloActor(search, language, page)
    } else if (genre) {
        // A TENER EN CUENTA, EL GENERO SE PASA POR NUMERO: 28=Action DE ID DEL GENERO QUE USA TMDB
        respuesta = await busquedaGenero(language, genre, page)
    } else {
        respuesta = await busquedaMasPopular(language, page)
    }

    if(orderBy){
        respuesta = ordenarRespuestaPeliculas(orderBy, respuesta)
    }

    res.send(respuesta)

}

async function sumaVotosPelicula(id) {
    const pool = await getConnection();
    try {
        const result = await MovieModel.getSumaVotos(id)
        return result; 
    } catch (error) {
        console.error(error);
        return 0;
    }
}

async function obtenerCantidadVotos(peliculaId) {
    try {
        const result = await MovieModel.getCantidadVotos(peliculaId)
        return result; 
    } catch (error) {
        console.error(error);
        return 0;
    }
}

async function obtenerRatingFavorito(movieId, userId) {
    try {
        const result = await InteractionMovieModel.getRegistro(userId, movieId)
        return result
    } catch (error) {
        console.error(error);
        return {};
    }
}

export const getMovie = async (req, res) => {
    const { id } = req.params;
    const { language } = req.query;
    const { userId } = req.body;

    const urlMovie = `https://api.themoviedb.org/3/movie/${id}?language=${language}`;
    const urlCredits = `https://api.themoviedb.org/3/movie/${id}/credits?language=${language}`;

    try {
        const responseMovie = await axios.get(urlMovie, { headers });
        const responsCredits = await axios.get(urlCredits, { headers });
        const movieData = responseMovie.data;
        const credtisData = responsCredits.data;

        // Datos de la db:
        const cantidadVotos = await obtenerCantidadVotos(id);
        const sumaVotos = await sumaVotosPelicula(id);
        const promedioVotos = (sumaVotos / cantidadVotos).toFixed(1);

        const ratingFavorito = await obtenerRatingFavorito(id, userId);
        const userRating = ratingFavorito.rating;
        const favorito = ratingFavorito.favorite;

        const directorInfo = credtisData.crew.find(director => director.job === "Director");
        const director = {
            name: directorInfo.name,
            img: 'https://image.tmdb.org/t/p/original' + directorInfo.profile_path
        };
        const cast = credtisData.cast.filter(actor => actor.known_for_department === "Acting").map(actor => ({
            name: actor.name,
            img: 'https://image.tmdb.org/t/p/original' + actor.profile_path})).slice(0,5)

        const movie = {
            "id": movieData.id,
            "title": movieData.title,
            "synopsis": movieData.overview,
            "genres": movieData.genres.map(genre => genre.name),
            "releaseDate": movieData.release_date,
            "duration": movieData.runtime,
            "userRating": userRating,
            "movieRating": promedioVotos,
            "numRating": cantidadVotos,
            "favorite": favorito,
            "director": director,
            "cast": cast
        }
        res.json(movie);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

const restarAntiguoRating = async (rating, movieId) => {
    try {
        await MovieModel.restarRating(rating, movieId)
    } catch (error) {
        console.error(error);
    }
}

const sumarNuevoRating = async (rating, movieId) => {
    try {
        await MovieModel.sumarRating(rating, movieId)
    } catch (error) {
        console.error(error);
    }
}

const actualizarRegistroPelicula = async (rating, userId, movieId) => {
    try {
        let ratingViejo = await InteractionMovieModel.getRating(userId, movieId)
        await restarAntiguoRating(ratingViejo, movieId)
        await sumarNuevoRating(rating, movieId)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al buscar registro' });
    }
    
}

export const clasifiedMovie = async (req, res) => {
    const { movieId, userId} = req.params;
    const { rating } = req.query;
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Calificación inválida' });
    }

    try {
        let result;
        const estaPelicula = await MovieModel.existMovie(movieId)
        if(!estaPelicula){
            await MovieModel.postMovie(movieId, 1, rating)
        }
        const estaRegistro = await InteractionMovieModel.exist(userId, movieId)
        if(estaRegistro){ // si esta el registro solo actualizo el campo del rating que pone el usuario
            await actualizarRegistroPelicula(rating, userId, movieId)
            await InteractionMovieModel.updateRating(rating, userId, movieId)
        } else { // Si no esta el registro creo uno nuevo con toda la info 
            await InteractionMovieModel.insertInteraction(userId, movieId, rating, 0)
            await MovieModel.updateCantidadVotos(rating, movieId)
        }

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Dato no encontrado' });
        }
        res.send(`se clasifico la pelicula ${rating}`);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al insertar rating de pelicula' });
    }
}

export const getGenre = async  (req, res) => {
    const { language } = req.query;
    const url = `https://api.themoviedb.org/3/genre/movie/list?language=${language}`;

    try {
        const genres = await axios.get(url, { headers });
        res.json(genres.data)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}  