import 'dotenv/config'
import express from 'express'
import { createServer } from 'node:http'
import connectDB from './db'
import globalRouter from './routes/global-router'
import { logger } from './logger'
import cors from 'cors'
import { Server as SocketServer} from 'socket.io';

connectDB()

const app = express()

app.use(express.json())
app.use(logger)
app.use(cors())
app.use('/api', globalRouter)

const server = createServer(app)

const io = new SocketServer(server, {
  cors: {
    origin: 'https://spotify-frontend-swart.vercel.app',
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
}); 

io.on('connection', (socket) => {
  console.log('New client connected');
  

  socket.on('updateTrack', (data) => {
    io.emit('trackUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000/api/v5')
})
