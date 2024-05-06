import express from 'express'

import userRoutes from './routes/user.routes.js'
import userMovies from './routes/movies.routes.js'


const app = express()
app.use(express.json())
app.use(userRoutes)
app.use(userMovies)

export default app