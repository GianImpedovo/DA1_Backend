import { getConnection } from "../db/connection.js";
import sql from 'mssql';
import { UserModel } from "../models/user.js";
import { MovieModel } from "../models/movie.js";
import { InteractionMovieModel } from "../models/interactionMovie.js";
import { obtenerPeliculasPorId } from "../controllers/movies.controllers.js"

export const getUser = async (req, res) => {
    const GoogleId = req.params.id
    try {
        const result = await UserModel.getUser(GoogleId)
        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuario.' });
    }
};

export const postUser = async (req, res) => {
    try {
        const result = await UserModel.postUser(req.body)
        res.status(200).json({
            googleId: result.googleId,
            name: result.name,
            lastname: result.lastname,
            nickname: result.nickname,
            email: result.email
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear usuario.' });
    }
};

export const putUser = async (req, res) => {
    try {
        const result = await UserModel.putUser(req.params.id, req.body)
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar usuario.' });
    }
};

export const deleteUser = async (req, res) => {
    const {id} = req.params
    try {
        let pelicula_id;
        let rating;
        // 1 tengo que actualizar todas las peliculas:
        const interaccion = await InteractionMovieModel.getRegistros(id)
        for (let i = 0; i < interaccion.length; i++) {
            pelicula_id = interaccion[i].pelicula_id
            rating = interaccion[i].rating
            await MovieModel.restarRating(rating, pelicula_id)
            if(rating !== 0){ // Solo resto cantidad de votos si el usuario puso votos
                await MovieModel.restarCantidadVotos(pelicula_id)
            }
        }
        
        // 2 Tengo que borrar todas la interacciones entre la pelicula y el usuario
        await InteractionMovieModel.deleteUserInteractions(id)

        // 3 Borro el usuario
        const result = await UserModel.deleteUser(id)
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar usuario.' });
    }
};

export const getFavorites = async (req, res) => {
    const { id } = req.params
    try {
        const result = await InteractionMovieModel.getFavorite(id)
        const peliculas = await obtenerPeliculasPorId(result)
        res.send(peliculas); 

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener favoritos' });
    }
}

export const putFavorite = async (req, res) => {
    const { id, movieId } = req.params
    let result;
    try {
        const pool = await getConnection();
        const estaPelicula = await MovieModel.existMovie(movieId)
        if(!estaPelicula){
            await MovieModel.postMovie(movieId, 0, 0)
        }

        const estaRegistro = await InteractionMovieModel.exist(id, movieId) 

        if(estaRegistro){
            result = await pool.request()
            .input('id', sql.VarChar, id)
            .input('pelicula_id', sql.Int, movieId)
            .query("UPDATE Interaccion_pelicula SET favorito = 1 WHERE usuario_id = @id AND pelicula_id = @pelicula_id");
        } else {
            result = await pool.request()
            .input('id', sql.VarChar, id)
            .input('pelicula_id', sql.Int, movieId)
            .input('rating', sql.Int, 0)
            .input('favorito', sql.Int, 1)
            .query('INSERT INTO Interaccion_pelicula ( usuario_id, pelicula_id, rating, favorito) VALUES (@id, @pelicula_id, @rating, @favorito);')
        }

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Dato no encontrado' });
        }
        res.send("Registro insertado/actualizado");

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al insertar pelicula favorita' });
    }
}

export const deleteFavorite = async (req, res) => {
    const { id, movieId } = req.params
    try {
        const pool = await getConnection();
        const result = await pool.request()
        .input('id', sql.VarChar, id)
        .input('pelicula_id', sql.Int, movieId)
        .query("UPDATE Interaccion_pelicula SET favorito = 0 WHERE usuario_id = @id AND pelicula_id = @pelicula_id");
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Dato no encontrado' });
        }
        res.send("Pelicula eliminada de favoritos");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar pelicula de favoritos' });
    }
}