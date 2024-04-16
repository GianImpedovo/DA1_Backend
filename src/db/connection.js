import sql from 'mssql'

const dbSettings = {
    user: 'prueba', 
    password: 'prueba',
    server: 'localhost',
    database: 'DA1',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
}

export const getConnection = async () => {
    try {
        const pool = await sql.connect(dbSettings)
        return pool;
    } catch (error) {
        console.error(error);
    }
};

