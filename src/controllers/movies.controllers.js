import axios from 'axios';
import dotenv from 'dotenv';
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

export const getMovies = async (req, res) => {
    const { search, orderBy, genre, limit,language } = req.query;
    const page = 1;
    let url = `https://api.themoviedb.org/3/movie/now_playing?language=${language}&page=${page}`;
    if(search){
        console.log("buscar pelicula por titulo o actor")
        let orderValues = orderBy.split(',').map(pair => { return pair.split(':')[1] }) // orderValues: [valor: release_date, valor: raiting]
        const orderReleaseDate = orderValues[0];
        const orderRaiting = orderValues[1];
        url = discover + `&language=${language}&page=${page}&sort_by=primary_release_date.${orderReleaseDate}`;

    } else {
        if(genre){
            console.log("hay genero")
            // A TENER EN CUENTA, EL GENERO SE PASA POR NUMERO DE ID DEL GENERO QUE USA TMDB
            url = url + `&sort_by=popularity.desc&with_genres=${genre}`;
    }}

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