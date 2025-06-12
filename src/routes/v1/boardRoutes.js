import express from "express";
import { StatusCodes } from "http-status-codes";

const Router = express.Router();

Router.route("/")
  .get((req, res) => {
    res.status(StatusCodes.OK).json({
      message: "GET: Board API ",
    });
  })
  .post((req, res) => {
    res.status(StatusCodes.CREATED).json({
      message: "POST: Board API",
    });
  });
export const boardRoutes = Router;
