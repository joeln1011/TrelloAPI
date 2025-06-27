import express from "express";
import { StatusCodes } from "http-status-codes";

import { boardRoute } from "~/routes/v1/boardRoute";
import { columnRoute } from "~/routes/v1/columnRoute";
import { cardRoute } from "~/routes/v1/cardRoute";
import { userRoute } from "~/routes/v1/userRoute";

const Router = express.Router();

//Check APIs v1/status
Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({
    message: "API is running smoothly!",
  });
});

// BOARD APIs
Router.use("/boards", boardRoute);

// COLUMN APIs
Router.use("/columns", columnRoute);

// CARD APIs
Router.use("/cards", cardRoute);

// USER APIs
Router.use("/users", userRoute);

export const APIs_V1 = Router;
