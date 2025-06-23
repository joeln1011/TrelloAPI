import { StatusCodes } from "http-status-codes";
import { boardModel } from "~/models/boardModel";
import { columnModel } from "~/models/columnModel";
import { cardModel } from "~/models/cardModel";

import ApiError from "~/utils/ApiError";
import { slugify } from "~/utils/formatters";
import { cloneDeep } from "lodash";

const createNew = async (reqBody) => {
  try {
    const newBoard = { ...reqBody, slug: slugify(reqBody.title) };
    const createdBoard = await boardModel.createNew(newBoard);

    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId);

    //return value in Service (always has return)
    return getNewBoard;
  } catch (error) {
    throw error;
  }
};

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId);
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Board Is Not Found!");
    }

    const resBoard = cloneDeep(board);

    resBoard.columns.forEach((column) => {
      //convert ObjectId to string of method toString() of JavaScript
      column.cards = resBoard.cards.filter(
        (card) => card.columnId.toString() === column._id.toString()
      );
    });

    delete resBoard.cards;

    return resBoard;
  } catch (error) {
    throw error;
  }
};

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now(),
    };
    const updatedBoard = await boardModel.update(boardId, updateData);

    return updatedBoard;
  } catch (error) {
    throw error;
  }
};

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now(),
    });

    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now(),
    });

    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
    });

    return { updatedResult: "Successfully Updated!" };
  } catch (error) {
    throw error;
  }
};

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
};
