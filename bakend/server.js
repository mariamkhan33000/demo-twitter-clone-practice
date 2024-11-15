import express from 'express'
import color from 'color'
import colors from 'colors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import User from './models/userModel.js'
import connectedDb from './config/db.js'
import authRoutes from './routes/authRoutes.js'
dotenv.config()
connectedDb()
const PORT = process.env.PORT || 4000

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(cookieParser());

app.use('/api/v1/auth', authRoutes)

app.listen(PORT, () => {
    console.log(`The Server is running on this ${PORT}`.bgCyan)
})