import { getConnection } from "../db/connection.js";
import sql from 'mssql';

export class MovieModel {

    static async postMovie( bodyMovie ){
        try {
            await pool.request()
            .input('id', sql.Int, movieId)
            .input('cantidad_votos', sql.Int, cantidad_votos)
            .input('suma_votos', sql.Int, suma_votos)
            .query('INSERT INTO Pelicula (id, cantidad_votos, suma_votos) VALUES (@id, @cantidad_votos, @suma_votos);');
        } catch (error) {
            
        }
    }
}