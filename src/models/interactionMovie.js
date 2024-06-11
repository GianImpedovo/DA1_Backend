import { getConnection } from "../db/connection.js";
import sql from 'mssql';

export class InteractionMovieModel {

    static async getFavorite(userId){
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('usuario_id', sql.Int, userId)
                .query('SELECT * FROM Interaccion_pelicula WHERE usuario_id = @usuario_id AND favorito = 1');
            if (result.rowsAffected[0] === 0) {
                return { message: 'Registro no encontrado' };
            }
            const favoritos = result.recordset
            return favoritos
        } catch (error) {
            
        }
    }

    static async getRating(userId, movieId){
        try {
            const pool = await getConnection();
            const rating = await pool.request()
                .input('usuario_id', sql.Int, userId)
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
                .input('usuario_id', sql.Int, userId)
                .input('pelicula_id', sql.Int, movieId)
                .query('SELECT COUNT(*) AS count FROM interaccion_pelicula WHERE usuario_id = @usuario_id AND pelicula_id = @pelicula_id')
            return registro.recordset[0].count === 1
        } catch (error) {
            
        }
    }


}