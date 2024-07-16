import { getConnection } from "../db/connection.js";
import sql from 'mssql';

export class MovieModel {

    static async existMovie(movieId){
        try {
            const pool = await getConnection();
            const pelicula = await pool.request()
            .input('id', sql.Int, movieId)
            .query('SELECT * FROM Pelicula WHERE id = @id')
            return pelicula.recordset.length != 0
        } catch (error) {
            return false
        }
    }

    static async postMovie( movieId, cantidad_votos, suma_votos ){
        try {
            const pool = await getConnection();
            await pool.request()
            .input('id', sql.Int, movieId)
            .input('cantidad_votos', sql.Int, cantidad_votos)
            .input('suma_votos', sql.Int, suma_votos)
            .query('INSERT INTO Pelicula (id, cantidad_votos, suma_votos) VALUES (@id, @cantidad_votos, @suma_votos);');
        } catch (error) {
            
        }
    }

    static async getSumaVotos(id){
        try {
            const pool = await getConnection();
            const result = await pool.request()
            .input('pelicula_id', sql.Int, id)
            .query('SELECT suma_votos From Pelicula where id = @pelicula_id;')
            const sumaVotos = result.recordset[0].suma_votos;
            return sumaVotos; 
        } catch (error) {
            
        }
    }

    static async getCantidadVotos(id){
        try {
            const pool = await getConnection();
            const result = await pool.request()
            .input('pelicula_id', sql.Int, id)
            .query('SELECT cantidad_votos From Pelicula where id = @pelicula_id;')
            const cantidadVotos = result.recordset[0].cantidad_votos;
            return cantidadVotos; 
        } catch (error) {
            
        }
    }

    static async sumarRating(rating, movieId){
        try {
            const pool = await getConnection();
            await pool.request()
            .input('pelicula_id', sql.Int, movieId)
            .input('rating', sql.Int, rating)
            .query('UPDATE Pelicula SET suma_votos = suma_votos + @rating WHERE id = @pelicula_id;')
        } catch (error) {
            
        }
    }

    static async restarRating(rating, movieId){
        try {
            const pool = await getConnection();
            await pool.request()
            .input('pelicula_id', sql.Int, movieId)
            .input('rating', sql.Int, rating)
            .query('UPDATE Pelicula SET suma_votos = suma_votos - @rating WHERE id = @pelicula_id;')
        } catch (error) {
            
        }
    }

    static async updateCantidadVotos(rating, movieId){
        try {
            const pool = await getConnection();
            const result = await pool.request()
            .input('pelicula_id', sql.Int, movieId)
            .query('SELECT * FROM Pelicula where id = @pelicula_id;')
            console.log(result);
            await pool.request()
            .input('pelicula_id', sql.Int, movieId)
            .input('rating', sql.Int, rating)
            .query('UPDATE Pelicula SET cantidad_votos = cantidad_votos + 1, suma_votos = suma_votos + @rating WHERE id = @pelicula_id;')
        } catch (error) {
            
        }
    }
}