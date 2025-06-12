import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardRoutes } from "~/routes/v1/boardRoutes";
import { userRoutes } from "~/routes/v1/userRoutes";
const Router = express.Router();

//Check APIs v1/status
Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({
    message: "API is running smoothly!",
  });
});

// BOARD APIs
Router.use("/boards", boardRoutes);

// USER APIs
Router.use("/users", userRoutes);

export const APIs_V1 = Router;
