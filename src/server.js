/* eslint-disable quotes */
import { corsOptions } from './config/cors';
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb';
import { env } from '~/config/environment';
import { APIs_V1 } from '~/routes/v1'; // Importing routes to ensure they are registered
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware';
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket';

import express from 'express';
import cors from 'cors';
import exitHook from 'async-exit-hook';
import cookieParser from 'cookie-parser';
import socketIo from 'socket.io';
import http from 'http';

const START_SERVER = () => {
  const app = express();

  // Fix Cache from disk of ExpressJS
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  // Set up Cookie Parser
  app.use(cookieParser());

  // Handle CORS
  app.use(cors(corsOptions));

  // Enable req.body json data
  app.use(express.json());

  // Use APIs V1
  app.use('/v1', APIs_V1);

  // Middleware control error
  app.use(errorHandlingMiddleware);

  // Create HTTP server covering Express app to do real-time with socket io
  const server = http.createServer(app);
  // Create Socket.IO server and cors
  const io = socketIo(server, { cors: corsOptions });

  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket);
  });

  //env production
  if (env.BUILD_MODE === 'production') {
    //using server.listen instead app.listen because already covered express and config socket io
    server.listen(process.env.PORT, () => {
      console.log(
        `Production: Hello ${env.AUTHOR}, Back-end is running successfully at port: ${process.env.PORT}`
      );
    });
  } else {
    //env local development
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(
        `Local Dev: Hello ${env.AUTHOR}, Back-end is running successfully at port: http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}`
      );
    });
  }
  exitHook(() => {
    CLOSE_DB();
  });
};

// Only connect to MongoDB successfully then Start Server will run
CONNECT_DB()
  .then(() => console.log('Connected to MongoDB successfully!'))
  .then(() => START_SERVER())
  .catch((error) => {
    console.log(error);
    process.exit(0);
  });
