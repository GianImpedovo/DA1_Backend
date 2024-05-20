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
        if (result.recordset[0] === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.send('Usuario eliminado');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar usuario.' });
    }
};



export const getFavorites = async (req, res) => {
    const { id } = req.params
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('usuario_id', sql.Int, id)
            .query('SELECT * FROM Interaccion_pelicula WHERE usuario_id = @usuario_id AND favorito = 1');
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }
        const favoritos = result.recordset
        res.send(favoritos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener favoritos' });
    }
}

export const guardarPelicula = async (movieId, cantidad_votos = 0, suma_votos = 0, pool) => {
    const pelicula = await pool.request()
        .input('id', sql.Int, movieId)
        .input('cantidad_votos', sql.Int, cantidad_votos)
        .input('suma_votos', sql.Int, suma_votos)
        .query('INSERT INTO Pelicula (id, cantidad_votos, suma_votos) VALUES (@id, @cantidad_votos, @suma_votos);');
    // console.log(pelicula) -> Esto me trae peliculas.rowsAffected cuando ingreso la nuevo pelicula
}

export const existePelicula = async ( movieId, pool ) => {
    try {
        const pelicula = await pool.request()
        .input('id', sql.Int, movieId)
        .query('SELECT * FROM Pelicula WHERE id = @id')
        return pelicula.recordset.length != 0
    } catch (error) {
        return false
    }
}

export const existeRegistro = async (id, movieId, pool) => {
    // query : SELECT COUNT(*) AS count FROM interaccion_pelicula WHERE user_id = ? AND pelicula_id = ?
    const registro = await pool.request()
    .input('usuario_id', sql.Int, id)
    .input('pelicula_id', sql.Int, movieId)
    .query('SELECT COUNT(*) AS count FROM interaccion_pelicula WHERE usuario_id = @usuario_id AND pelicula_id = @pelicula_id')
    return registro.recordset[0].count === 1
}

export const putFavorite = async (req, res) => {
    const { id, movieId } = req.params
    let result;
    try {
        const pool = await getConnection();
        const estaPelicula = await existePelicula( movieId, pool )
        if(!estaPelicula){
            await guardarPelicula(movieId, 0, 0, pool)
        }

        const estaRegistro = await existeRegistro(id, movieId, pool)

        if(estaRegistro){
            result = await pool.request()
            .input('id', sql.Int, id)
            .input('pelicula_id', sql.Int, movieId)
            .query("UPDATE Interaccion_pelicula SET favorito = 1 WHERE usuario_id = @id AND pelicula_id = @pelicula_id");
        } else {
            result = await pool.request()
            .input('id', sql.Int, id)
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
        .input('id', sql.Int, id)
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