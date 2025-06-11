import express from "express";
import exitHook from "async-exit-hook";
import { CONNECT_DB, CLOSE_DB } from "~/config/mongodb";
import { env } from "~/config/environment";

const START_SERVER = () => {
  const app = express();

  app.get("/", async (req, res) => {
    res.end("<h1>Hello World!</h1><hr>");
  });

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Hello ${env.AUTHOR}, I am running at Host: ${env.APP_HOST} and Port: ${env.APP_PORT}`
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
