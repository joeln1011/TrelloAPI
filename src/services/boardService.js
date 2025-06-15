import { slugify } from "~/utils/formatters";

const createNew = async (reqBody) => {
  try {
    // Control a logic of data depends on the project
    const newBoard = { ...reqBody, slug: slugify(reqBody.title) };
    //return value in Service (always has return)
    return newBoard;
  } catch (error) {
    throw error;
  }
};

export const boardService = {
  createNew,
};
