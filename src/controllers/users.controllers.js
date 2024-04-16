import { getConnection } from "../db/connection.js"
import sql from 'mssql';


export const getUsers = async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM Usuarios")
    res.json(result.recordset);
}

export const getUser = async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
    .input('id', sql.Int, req.params.id)
    .query("SELECT * FROM Usuarios where UserId = @id")
    console.log(result)
    if( result.rowsAffected[0] === 0 ){
        return res.status(404).json({message : 'Usuario no encontrado.'})
    }
    return res.json(result.recordset[0])
}

export const postUser = async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
    .input('Name', sql.VarChar, req.body.Name)
    .input('Nickname', sql.VarChar, req.body.Nickname)
    .input('Email', sql.VarChar, req.body.Email)
    .query("INSERT INTO Usuarios(Nombre, Nickname, Email) values (@Name, @Nickname, @Email); select scope_identity() as id;");

    console.log(result)
    res.json({
            id: result.recordset[0].id,
            name: req.body.Name,
            nickname: req.body.Nickname,
            email: req.body.Email,
        }
    )
}

export const putUser = async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
    .input('id', sql.Int, req.params.id)
    .input('Name', sql.VarChar, req.body.Name)
    .input('Nickname', sql.VarChar, req.body.Nickname)
    .input('email', sql.VarChar, req.body.Email)
    .query("UPDATE Usuarios SET Nombre = @Name, Nickname = @Nickname, Email = @email WHERE UserID = @id ");

    if(result.rowsAffected[0] === 0){
        return res.status(404).json({message : 'Usuario no encontrado.'})
    }

    res.send("Usuario actualizado")

}

export const deleteUser = async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
    .input('id', sql.Int, req.params.id)
    .query("DELETE FROM Usuarios WHERE UserID = @id ");

    if(result.rowsAffected[0] === 0){
        return res.status(404).json({message : 'Usuario no encontrado.'})
    }
    res.send('Usuario eliminado')
}