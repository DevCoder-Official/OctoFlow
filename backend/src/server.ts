import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/octoflow');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// WebSocket Events
io.on('connection', (socket) => {
  console.log('✨ New user connected:', socket.id);

  socket.on('join_channel', (channelId: string) => {
    socket.join(`channel_${channelId}`);
    console.log(`👤 User joined channel: ${channelId}`);
  });

  socket.on('send_message', (data) => {
    io.to(`channel_${data.channelId}`).emit('message', data);
    console.log('💬 Message sent:', data);
  });

  socket.on('user_typing', (data) => {
    socket.broadcast.to(`channel_${data.channelId}`).emit('user_typing', {
      userId: data.userId,
      username: data.username,
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: '✅ OctoFlow API is running!' });
});

// Initialize
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌐 WebSocket server ready for real-time communication`);
  });
});

export { app, io };
