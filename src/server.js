/* eslint-disable quotes */
import express from 'express';
import cors from 'cors';
import exitHook from 'async-exit-hook';
import { corsOptions } from './config/cors';
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb';
import { env } from '~/config/environment';
import { APIs_V1 } from '~/routes/v1'; // Importing routes to ensure they are registered
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware';
import cookieParser from 'cookie-parser';

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

  //env production
  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(
        `Production: Hello ${env.AUTHOR}, Back-end is running successfully at port: ${process.env.PORT}`
      );
    });
  } else {
    //env local development
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      // eslint-disable-next-line no-console
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
