import express from "express";
import { StatusCodes } from "http-status-codes";

const Router = express.Router();

Router.route("/")
  .get((req, res) => {
    res.status(StatusCodes.OK).json({
      message: "GET: User API ",
    });
  })
  .post((req, res) => {
    res.status(StatusCodes.CREATED).json({
      message: "POST: User API",
    });
  });
export const userRoute = Router;
