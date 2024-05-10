import { getConnection } from "../db/connection.js";
import sql from 'mssql';

export const getUsers = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * FROM usuarios");
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios.' });
    }
};

export const getUser = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query("SELECT * FROM usuarios WHERE user_id = @id");
        if (!result.recordset.length) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuario.' });
    }
};

export const postUser = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('Name', sql.NVarChar, req.body.Name)
            .input('Nickname', sql.NVarChar, req.body.Nickname)
            .input('Email', sql.NVarChar, req.body.Email)
            .query("INSERT INTO usuarios (nombre, nickname, correo_electronico) VALUES (@Name, @Nickname, @Email); SELECT SCOPE_IDENTITY() AS id;");
        res.json({
            id: result.recordset[0].id,
            name: req.body.Name,
            nickname: req.body.Nickname,
            email: req.body.Email
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear usuario.' });
    }
};

export const putUser = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('Name', sql.NVarChar, req.body.Name)
            .input('Nickname', sql.NVarChar, req.body.Nickname)
            .input('Email', sql.NVarChar, req.body.Email)
            .query("UPDATE usuarios SET nombre = @Name, nickname = @Nickname, correo_electronico = @Email WHERE user_id = @id");
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.send("Usuario actualizado");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar usuario.' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query("DELETE FROM usuarios WHERE user_id = @id");
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.send('Usuario eliminado');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar usuario.' });
    }
};



export const getFavorites = async (req, res) => {

}

export const postFavorite = async (req, res) => {

}

export const deleteFavorite = async (req, res) => {

}