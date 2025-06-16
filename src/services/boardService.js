import { boardModel } from "~/models/boardModel";
import { slugify } from "~/utils/formatters";

const createNew = async (reqBody) => {
  try {
    // Control a logic of data depends on the project
    const newBoard = { ...reqBody, slug: slugify(reqBody.title) };
    const createdBoard = await boardModel.createNew(newBoard);

    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId);

    //return value in Service (always has return)
    return getNewBoard;
  } catch (error) {
    throw error;
  }
};

export const boardService = {
  createNew,
};
