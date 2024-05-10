import express from 'express'
import cors from 'cors'

import userRoutes from './routes/user.routes.js'
import moviesRoutes from './routes/movies.routes.js'
import healthRoutes from './routes/health.routes.js'
import loginRoutes from './routes/login.routes.js'


const app = express()
app.use(cors())
app.use(express.json())
app.use(userRoutes)
app.use(moviesRoutes)
app.use(healthRoutes)
app.use(loginRoutes)

export default app