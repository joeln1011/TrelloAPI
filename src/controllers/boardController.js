import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import { boardService } from "~/services/boardService";

const createNew = async (req, res, next) => {
  try {
    //
    const createdBoard = await boardService.createNew(req.body);

    res.status(StatusCodes.CREATED).json({ message: createdBoard });
    // throw new ApiError(StatusCodes.BAD_GATEWAY, "Error Testing....");
  } catch (error) {
    next(error);
  }
};

export const boardController = { createNew };
