import { getConnection } from "../db/connection.js";
import sql from 'mssql';

export class InteractionMovieModel {

    static async getFavorite(userId){
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('usuario_id', sql.VarChar, userId)
                .query('SELECT pelicula_id as movieId, rating FROM Interaccion_pelicula WHERE usuario_id = @usuario_id AND favorito = 1');
            if (result.rowsAffected[0] === 0) {
                return { message: 'Registro no encontrado' };
            }
            const favoritos = result.recordset
            console.log(favoritos);
            return favoritos
        } catch (error) {
            
        }
    }

    static async getRating(userId, movieId){
        try {
            const pool = await getConnection();
            const rating = await pool.request()
                .input('usuario_id', sql.VarChar, userId)
                .input('pelicula_id', sql.Int, movieId)
                .query('SELECT rating FROM Interaccion_pelicula WHERE usuario_id = @usuario_id AND pelicula_id = @pelicula_id;')
            return rating.recordset[0].rating
        } catch (error) {
            
        }
    }

    static async exist(userId, movieId){
        try {
            const pool = await getConnection();
            const registro = await pool.request()
                .input('usuario_id', sql.VarChar, userId)
                .input('pelicula_id', sql.Int, movieId)
                .query('SELECT COUNT(*) AS count FROM interaccion_pelicula WHERE usuario_id = @usuario_id AND pelicula_id = @pelicula_id')
            return registro.recordset[0].count === 1
        } catch (error) {
            
        }
    }

    static async updateRating(rating, userId, movieId){
        try {
            const pool = await getConnection();
            await pool.request()
                .input('usuario_id', sql.VarChar, userId)
                .input('pelicula_id', sql.Int, movieId)
                .input('rating', sql.Int, rating)
                .query("UPDATE Interaccion_pelicula SET rating = @rating WHERE usuario_id = @usuario_id AND pelicula_id = @pelicula_id; ");

        } catch (error) {
            
        }
    }

    static async insertInteraction(userId, movieId, rating, favorite){
        try {
            const pool = await getConnection();
            await pool.request()
                .input('usuario_id', sql.VarChar, userId)
                .input('pelicula_id', sql.Int, movieId)
                .input('rating', sql.Int, rating)
                .input('favorito', sql.Int, favorite)
                .query('INSERT INTO Interaccion_pelicula ( usuario_id, pelicula_id, rating, favorito) VALUES (@usuario_id, @pelicula_id, @rating, @favorito);')
        } catch (error) {
            
        }
        
    }

    static async getRegistro(userId, movieId){
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('pelicula_id', sql.Int, movieId)
                .input('usuario_id', sql.VarChar, userId)
                .query('SELECT usuario_id, rating, favorito FROM Interaccion_pelicula where pelicula_id = @pelicula_id and usuario_id = @usuario_id;')
            const ratingFavorito = {
                userId: userId,
                movieId: movieId,
                rating: result.recordset[0].rating,
                favorite: result.recordset[0].favorito
            }
            return ratingFavorito
        } catch (error) {
            
        }
    }


}