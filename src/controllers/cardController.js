import { StatusCodes } from "http-status-codes";
import { cardService } from "~/services/cardService";

const createNew = async (req, res, next) => {
  try {
    const createdcard = await cardService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createdcard);
  } catch (error) {
    next(error);
  }
};

export const cardController = { createNew };
