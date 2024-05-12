import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();


// PARA VALIDACIONES PUEDO USAR 'ZOD'
// PROBLEMA DE CORS SOLUCIONAR EN HEADER Y AGREGAR LA URL'S PERMITIDAS
// 

const accessToken = process.env.ACCESS_TOKEN;

export const getMovies = async (req, res) => {
    const lang = req.query.language;
    const url = `https://api.themoviedb.org/3/movie/now_playing?language=${lang}&page=1`;
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

export const getMovie = async (req, res) => {
    const { id } = req.params;
    const { language } = req.query
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
            "rating": 0,
            "numRating": 0,
            "favorire": true,
            "director": director,
            "cast": cast
        }
        res.json(movie);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

export const clasifiedMovie = async (req, res) => {
    const { movieId, userId} = req.params;
    const { rating } = req.query;
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Calificación inválida' });
    }
    // Guardar en la base de datos

    res.status(201).json({ message: `Pelicula: ${movieId}  / Usuario: ${userId}  / Rating: ${rating}` });
}

export const getGenre = async  (req, res) => {
    console.log("Llamada a la ruta /movies/generos recibida."); 
    res.status(200).json({ message: "Éxito" });
}  