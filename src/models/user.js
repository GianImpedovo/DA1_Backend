import { deleteUser } from "../controllers/users.controllers.js";
import { getConnection } from "../db/connection.js";
import sql from 'mssql';

export class UserModel {

    static async getUser(googleId) {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('google_id', sql.NVarChar, googleId)
                .query("SELECT * FROM usuarios WHERE google_id = @google_id");
            return result.recordset[0]
        } catch (error) {
            return {
                error: error,
                message: "Fallo al obtener usuario"
            }
        }

    }


    static async postUser( body ){
        const { Name, Nickname, Email, GoogleId, fotoPerfil } = body
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('Name', sql.NVarChar, Name)
                .input('Nickname', sql.NVarChar, Nickname)
                .input('Email', sql.NVarChar, Email)
                .input('GoogleId', sql.NVarChar, GoogleId)
                .input('fotoPerfil', sql.NVarChar, fotoPerfil)
                .query("INSERT INTO usuarios (nombre, nickname, correo_electronico, google_id, foto_perfil, fecha_registro) VALUES (@Name, @Nickname, @Email, @GoogleId, @fotoPerfil, GETDATE()); SELECT SCOPE_IDENTITY() AS id;");
    
            return {
                Name: Name,
                Nickname: Nickname, 
                Email: Email,
                GoogleId: GoogleId,
                fotoPerfil: fotoPerfil
            }
        } catch (error) {
            return {
                error: error,
                message: "Fallo al crear usuario"
            }
        }

    }

    static async putUser( id, body ) {
        const GoogleId = id
        const { Name, Nickname, Email } = body
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('id', sql.Int, GoogleId)
                .input('Name', sql.NVarChar, Name)
                .input('Nickname', sql.NVarChar, Nickname)
                .input('Email', sql.NVarChar, Email)
                .query("UPDATE usuarios SET nombre = @Name, nickname = @Nickname, correo_electronico = @Email WHERE google_id = @id");
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
                .input('google_id', sql.NVarChar, GoogleId)
                .query("DELETE FROM usuarios WHERE google_id = @google_id");
            if (result.recordset[0] === 0) {
                return { message: 'Usuario no encontrado.' }
            }
            return { message: 'Usuario no encontrado.' }
        } catch (error) {
            
        }
    }

}