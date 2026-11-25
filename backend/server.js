import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { pathToFileURL } from 'node:url'
import { connectDatabase } from './config/database.js'
import authRoutes from './routes/authRoutes.js'
import shipmentRoutes from './routes/shipmentRoutes.js'
import { AppError } from './utils/AppError.js'

const app = express()
const allowedOrigins = (process.env.FRONTEND_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new AppError('This origin is not allowed.', 403))
  },
}))
app.use(express.json({ limit: '32kb' }))
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})
app.use('/api/auth', authRoutes)
app.use('/api/shipments', shipmentRoutes)

app.use((_req, _res, next) => {
  next(new AppError('The requested endpoint was not found.', 404))
})

app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'The request body contains invalid JSON.' })
    return
  }
  if (error?.type === 'entity.too.large') {
    res.status(413).json({ message: 'The request body is too large.' })
    return
  }
  if (error?.code === '23505') {
    res.status(409).json({ message: 'A record with the same unique value already exists.' })
    return
  }
  if (error?.code === '22P02') {
    res.status(400).json({ message: 'The submitted identifier or value is invalid.' })
    return
  }

  const statusCode = error instanceof AppError ? error.statusCode : 500
  if (statusCode >= 500) console.error(error)
  res.status(statusCode).json({
    message: statusCode >= 500 ? 'An unexpected server error occurred.' : error.message,
    ...(error instanceof AppError && error.details ? { details: error.details } : {}),
  })
})

async function startServer() {
  if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
    throw new Error('Set JWT_SECRET to a random secret of at least 32 characters.')
  }
  await connectDatabase()
  const port = Number(process.env.PORT) || 5000
  app.listen(port, () => {
    console.info(`CARGONEX API listening on port ${port}.`)
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch((error) => {
    console.error('Unable to start CARGONEX API:', error.message)
    process.exitCode = 1
  })
}

export default app
