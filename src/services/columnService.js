import ApiError from "~/utils/ApiError";
import { columnModel } from "~/models/columnModel";
import { boardModel } from "~/models/boardModel";
import { cardModel } from "~/models/cardModel";
import { StatusCodes } from "http-status-codes";
const createNew = async (reqBody) => {
  try {
    const newColumn = { ...reqBody };
    const createdColumn = await columnModel.createNew(newColumn);
    const getNewColumn = await columnModel.findOneById(
      createdColumn.insertedId
    );

    if (getNewColumn) {
      getNewColumn.cards = [];

      // Update cardOrderIds to be an empty array if it is undefined
      await boardModel.pushColumnOrderIds(getNewColumn);
    }

    return getNewColumn;
  } catch (error) {
    throw error;
  }
};

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now(),
    };
    const updatedColumn = await columnModel.update(columnId, updateData);

    return updatedColumn;
  } catch (error) {
    throw error;
  }
};

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId);
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Column not found!");
    }
    //Delete column
    await columnModel.deleteOneById(columnId);
    //Delete all cards in the column
    await cardModel.deleteManyByColumnId(columnId);

    //Remove columnId from board's columnOrderIds
    await boardModel.pullColumnOrderIds(targetColumn);

    return { deleteResult: "Column and its cards deleted successfully" };
  } catch (error) {
    throw error;
  }
};
export const columnService = {
  createNew,
  update,
  deleteItem,
};
