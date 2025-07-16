import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { db } from './db'

dotenv.config()
const app = express()
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true
    }
))
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Figuro Backend is running')
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})
