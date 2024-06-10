import sql from 'mssql'

const dbSettings = {
    user: 'prueba',  //'admin'
    password: 'prueba',  //'da1_uade_pass'
    server: 'localhost', // db-da1-uade.chi2ucssol16.us-east-2.rds.amazonaws.com
    database: 'DA1',
    //port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
}

export const getConnection = async () => {
    try {
        const pool = await sql.connect(dbSettings)
        return pool
    } catch (error) {
        console.error('Error conectando a la base de datos:', error);
    }
};


export async function testConnection() {
    try {
        const pool = await sql.connect(dbSettings);
        console.log('Conectado a la base de datos');
        
        // Aquí puedes realizar consultas a la base de datos, por ejemplo:
        const result = await pool.request().query('SELECT 1 AS number');
        console.log(result);
        // Recuerda cerrar la conexión cuando ya no la necesites
        await pool.close();

        return 'Successful connection'
    } catch (err) {
        return 'Error conectando a la base de datos:', err;
    }
}