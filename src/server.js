/* eslint-disable quotes */
import express from "express";
import exitHook from "async-exit-hook";
import { CONNECT_DB, CLOSE_DB } from "~/config/mongodb";
import { env } from "~/config/environment";
import { APIs_V1 } from "~/routes/v1"; // Importing routes to ensure they are registered

const START_SERVER = () => {
  const app = express();

  app.use("/v1", APIs_V1);

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Hello ${env.AUTHOR}, I am running at Host: http://${env.APP_HOST}:${env.APP_PORT}`
    );
  });
  exitHook(() => {
    CLOSE_DB();
  });
};

// Only connect to MongoDB successfully then Start Server will run
CONNECT_DB()
  .then(() => console.log("Connected to MongoDB successfully!"))
  .then(() => START_SERVER())
  .catch((error) => {
    console.log(error);
    process.exit(0);
  });
