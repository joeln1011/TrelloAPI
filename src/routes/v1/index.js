import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardRoute } from "~/routes/v1/boardRoute";
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

// USER APIs
Router.use("/users", userRoute);

export const APIs_V1 = Router;
