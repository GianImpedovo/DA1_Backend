import axios from 'axios';
import dotenv from 'dotenv';
import { getConnection } from '../db/connection.js';
import { existePelicula, guardarPelicula, existeRegistro } from './users.controllers.js';
import sql from 'mssql';
import nlp from 'compromise';
dotenv.config();

const discover = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false'

// PARA VALIDACIONES PUEDO USAR 'ZOD' 

const accessToken = process.env.ACCESS_TOKEN;

export const getSignInMovies = async (req, res) => {
    const url = 'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1'
    const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };

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

function busquedaTituloActor( search, orderBy ) {
    // Primero puedo usar compromise para saber si hay nombre o no, en caso que no haya nombre voy directo a buscar
    // por titulo, si hay nombre comparo que tiene mas resultado si la busqueda de actores o la busqueda de peliculas.
    // buscar en ambos endpoint y obtener la popularidad
    const doc = nlp(search)
    const personas = doc.people().out('array')
    console.log(personas)
    let url = ''
    console.log("buscar pelicula por titulo o actor")
    let orderValues = orderBy.split(',').map(pair => { return pair.split(':')[1] }) // orderValues: [valor: release_date, valor: raiting]
    const orderReleaseDate = orderValues[0];
    const orderRaiting = orderValues[1];
    return url
}

export const getMovies = async (req, res) => {
    const { search, orderBy, genre, limit,language } = req.query;
    const page = 1;
    let url = `https://api.themoviedb.org/3/movie/now_playing?language=${language}&page=${page}`;
    if(search){
        // Lo primero es fijarme si es un actor o un titulo de pelicula
        url = busquedaTituloActor(search, orderBy)
    } else {
        if(genre){
            // A TENER EN CUENTA, EL GENERO SE PASA POR NUMERO DE ID DEL GENERO QUE USA TMDB
            url = url + `&sort_by=popularity.desc&with_genres=${genre}`;
    }}
    // ESTO HAY QUE SACARLO CUANDO RESUELVA EL TEMA DE BUSQUEDA !!!!
    url = `https://api.themoviedb.org/3/movie/now_playing?language=${language}&page=${page}`;
    const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };

    try {
        let resMovies = Array();
        const response = await axios.get(url, { headers });
        const peliculas = response.data.results
        for (let i = 0; i < peliculas.length; i++) {
            resMovies.push({
                "id": peliculas[i].id,
                "title": peliculas[i].title,
                "image": 'https://image.tmdb.org/t/p/original' + peliculas[i].poster_path})
        }
        res.send(resMovies)
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

async function sumaVotosPelicula(id) {
    const pool = await getConnection();
    try {
        const result = await pool.request()
        .input('pelicula_id', sql.Int, id)
        .query('SELECT suma_votos From Pelicula where id = @pelicula_id;')
        const sumaVotos = result.recordset[0].suma_votos;
        return sumaVotos; 
    } catch (error) {
        console.error(error);
        return 0;
    }
}

async function obtenerCantidadVotos(peliculaId) {
    const pool = await getConnection();
    try {
        const result = await pool.request()
        .input('pelicula_id', sql.Int, peliculaId)
        .query('SELECT cantidad_votos From Pelicula where id = @pelicula_id;')
        const cantidadVotos = result.recordset[0].cantidad_votos;
        return cantidadVotos; 
    } catch (error) {
        console.error(error);
        return 0;
    }
}

async function obtenerRatingFavorito(peliculaId, usuarioId) {
    const pool = await getConnection();
    try {
        const result = await pool.request()
        .input('pelicula_id', sql.Int, peliculaId)
        .input('usuario_id', sql.Int, usuarioId)
        .query('SELECT usuario_id, rating, favorito FROM Interaccion_pelicula where pelicula_id = @pelicula_id and usuario_id = @usuario_id;')
        const ratingFavorito = [result.recordset[0].rating, result.recordset[0].favorito]
        return ratingFavorito
    } catch (error) {
        console.error(error);
        return 0;
    }
}

export const getMovie = async (req, res) => {
    const { id } = req.params;
    const { language } = req.query;
    const { usuarioId } = req.body;

    const urlMovie = `https://api.themoviedb.org/3/movie/${id}?language=${language}`;
    const urlCredits = `https://api.themoviedb.org/3/movie/${id}/credits?language=${language}`;
    const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };

    try {
        const responseMovie = await axios.get(urlMovie, { headers });
        const responsCredits = await axios.get(urlCredits, { headers });
        const movieData = responseMovie.data;
        const credtisData = responsCredits.data;

        // Datos de la db:
        const cantidadVotos = await obtenerCantidadVotos(id);
        const sumaVotos = await sumaVotosPelicula(id);
        const promedioVotos = (sumaVotos / cantidadVotos).toFixed(1);

        const ratingFavorito = await obtenerRatingFavorito(id, usuarioId);
        const userRating = ratingFavorito[0];
        const favorito = ratingFavorito[1];

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

const restarAntiguoRating = async (rating, movieId, pool) => {
    try {
        await pool.request()
        .input('pelicula_id', sql.Int, movieId)
        .input('rating', sql.Int, rating)
        .query('UPDATE Pelicula SET suma_votos = suma_votos - @rating WHERE id = @pelicula_id;')
    } catch (error) {
        console.error(error);
    }
}

const sumarNuevoRating = async (rating, movieId, pool) => {
    try {
        await pool.request()
        .input('pelicula_id', sql.Int, movieId)
        .input('rating', sql.Int, rating)
        .query('UPDATE Pelicula SET suma_votos = suma_votos + @rating WHERE id = @pelicula_id;')

    } catch (error) {
        console.error(error);
    }
}

const actualizarRegistroPelicula = async (rating, userId, movieId, pool) => {
    try {
        let ratingViejo = await pool.request()
        .input('usuario_id', sql.Int, userId)
        .input('pelicula_id', sql.Int, movieId)
        .query('SELECT rating FROM Interaccion_pelicula WHERE usuario_id = @usuario_id AND pelicula_id = @pelicula_id;')
        ratingViejo = ratingViejo.recordset[0].rating
        await restarAntiguoRating(ratingViejo, movieId, pool)
        await sumarNuevoRating(rating, movieId, pool)
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
        const pool = await getConnection();
        let result;
        const estaPelicula = await existePelicula( movieId, pool )
        if(!estaPelicula){
            await guardarPelicula(movieId, 1, rating, pool)
        }
        const estaRegistro = await existeRegistro( userId, movieId, pool)
        if(estaRegistro){ // si esta el registro solo actualizo el campo del rating que pone el usuario
            await actualizarRegistroPelicula(rating, userId, movieId, pool)
            result = await pool.request()
            .input('usuario_id', sql.Int, userId)
            .input('pelicula_id', sql.Int, movieId)
            .input('rating', sql.Int, rating)
            .query("UPDATE Interaccion_pelicula SET rating = @rating WHERE usuario_id = @usuario_id AND pelicula_id = @pelicula_id; ");
        } else { // Si no esta el registro creo uno nuevo con toda la info 
            result = await pool.request()
            .input('usuario_id', sql.Int, userId)
            .input('pelicula_id', sql.Int, movieId)
            .input('rating', sql.Int, rating)
            .input('favorito', sql.Int, 0)
            .query('INSERT INTO Interaccion_pelicula ( usuario_id, pelicula_id, rating, favorito) VALUES (@usuario_id, @pelicula_id, @rating, @favorito);'
                +  'UPDATE Pelicula SET cantidad_votos = cantidad_votos + 1, suma_votos = suma_votos + @rating WHERE id = @pelicula_id;')
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
    const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };

    try {
        const genres = await axios.get(url, { headers });
        res.json(genres.data)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}  