import { getConnection } from "../db/connection.js";
import sql from 'mssql';

export class UserModel {

    static async getUser(googleId) {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('google_id', sql.BigInt, BigInt(googleId))
                .query("SELECT * FROM Usuario WHERE google_id = @google_id");
            const userData = result.recordset[0]
            return userData
        } catch (error) {
            return {
                error: error,
                message: "Fallo al obtener usuario"
            }
        }
    }

    static async postUser( body ){
        const { name, lastname, nickname, email, googleId, fotoPerfil } = body
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('nickname', sql.NVarChar, nickname)
                .input('lastname', sql.NVarChar, lastname)
                .input('email', sql.NVarChar, email)
                .input('googleId', sql.BigInt, BigInt(googleId))
                .input('fotoPerfil', sql.NVarChar, fotoPerfil)
                .query("INSERT INTO Usuario (nombre, nickname, correo_electronico, google_id, foto_perfil, fecha_registro, apellido) VALUES (@name, @nickname, @email, @googleId, @fotoPerfil, GETDATE(), @lastname); SELECT SCOPE_IDENTITY() AS id;");
            
            return {
                id: googleId,
                name: name,
                lastname: lastname,
                nickname: nickname,
                email: email,
                photo: fotoPerfil
            }
        } catch (error) {
            return {
                error: error,
                message: "Fallo al crear usuario"
            }
        }

    }

    static async putUser( id, body ) {
        const googleId = id
        const { name, nickname, email, lastname } = body
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('id', sql.BigInt, BigInt(googleId))
                .input('name', sql.NVarChar, name)
                .input('nickname', sql.NVarChar, nickname)
                .input('lastname', sql.NVarChar, lastname)
                .input('email', sql.NVarChar, email)
                .query("UPDATE Usuario SET nombre = @name, nickname = @nickname, correo_electronico = @email, apellido = @lastname WHERE google_id = @id");
            if (result.rowsAffected[0] === 0) {
                return ({ message: 'Usuario no encontrado.' });
            }
            return ({ message: "Usuario actualizado"});
        } catch (error) {
            return {
                error: error,
                message: "Fallo al actualizar usuario"
            }
        }
    }


    static async deleteUser(google_id){
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('google_id', sql.BigInt, BigInt(google_id))
                .query("DELETE FROM Usuario WHERE google_id = @google_id");
            if (result.recordset[0] === 0) {
                return { message: 'Usuario no encontrado.' }
            }
            return { message: 'Usuario no encontrado.' }
        } catch (error) {
            
        }
    }

}