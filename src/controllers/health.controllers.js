import { testConnection } from "../db/connection.js";

export const getHealth = async(req, res) => {
    const message = await testConnection();
    res.status(200).json({ message: message})
}