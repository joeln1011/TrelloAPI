import Joi from 'joi';
import { GET_DB } from '~/config/mongodb';
import { BOARD_TYPES } from '~/utils/constants';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import { columnModel } from './columnModel';
import { cardModel } from './cardModel';
import { userModel } from './userModel';
import { ObjectId } from 'mongodb';
import { pagingSkipValue } from '~/utils/algorithms';
// Define Collection (name & schema)
const BOARD_COLLECTION_NAME = 'boards';
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),

  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  ownerIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
});

const createNew = async (userId, newBoard) => {
  try {
    const validData = await validateBeforeCreate(newBoard);
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(`${userId}`)],
    };
    const createdBoard = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(newBoardToAdd);
    return createdBoard;
  } catch (error) {
    throw new Error(error);
  }
};

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt'];

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};
const findOneById = async (boardId) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(`${boardId}`),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getDetails = async (userId, boardId) => {
  try {
    const queryConditions = [
      { _id: new ObjectId(`${boardId}`) },
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(`${userId}`)] } },
          { memberIds: { $all: [new ObjectId(`${userId}`)] } },
        ],
      },
    ];
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: { $and: queryConditions },
        },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'columns',
          },
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards',
          },
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'ownerIds',
            foreignField: '_id',
            as: 'owners',
            // pipeline in lookup is used to project only necessary fields
            // $project is used to remove sensitive fields like password and verityToken
            pipeline: [{ $project: { password: 0, verityToken: 0 } }],
          },
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'memberIds',
            foreignField: '_id',
            as: 'members',
            pipeline: [{ $project: { password: 0, verityToken: 0 } }],
          },
        },
      ])
      .toArray();
    return result[0] || null;
  } catch (error) {
    throw new Error(error);
  }
};

// Push columnId to columnOrderIds at the end of the board
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(`${column.boardId}`) },
        { $push: { columnOrderIds: new ObjectId(`${column._id}`) } },
        { returnDocument: 'after' }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// Pull columnId from columnOrderIds at the end of the board
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(`${column.boardId}`) },
        { $pull: { columnOrderIds: new ObjectId(`${column._id}`) } },
        { returnDocument: 'after' }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// Update board details
const update = async (boardId, updateData) => {
  try {
    // Validate the update data against the schema
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });

    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map((_id) => {
        return new ObjectId(`${_id}`);
      });
    }
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(`${boardId}`) },
        { $set: { ...updateData } },
        { returnDocument: 'after' }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(`${userId}`)] } },
          { memberIds: { $all: [new ObjectId(`${userId}`)] } },
        ],
      },
    ];
    const query = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate(
        [
          { $match: { $and: queryConditions } },
          { $sort: { title: 1 } },
          {
            $facet: {
              queryBoards: [
                { $skip: pagingSkipValue(page, itemsPerPage) }, // Use parsed numbers
                { $limit: itemsPerPage },
              ],
              queryTotalBoards: [{ $count: 'countedAllBoards' }],
            },
          },
        ],
        { collation: { locale: 'en', numericOrdering: true } }
      )
      .toArray();
    const res = query[0];
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0,
    };
  } catch (error) {
    throw new Error(error);
  }
};

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  getDetails,
  getBoards,
  findOneById,
  pushColumnOrderIds,
  pullColumnOrderIds,
  update,
};
