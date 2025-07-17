import { cardModel } from '~/models/cardModel.js';
import { columnModel } from '~/models/columnModel';
import { CloudinaryProvider } from '~/providers/CloudinaryProvider';

const createNew = async (reqBody) => {
  try {
    const newCard = { ...reqBody };
    const createdCard = await cardModel.createNew(newCard);
    const getNewCard = await cardModel.findOneById(createdCard.insertedId);

    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard);
    }
    return getNewCard;
  } catch (error) {
    throw error;
  }
};
const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = { ...reqBody, updatedAt: new Date() };

    let updatedCard = {};
    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(
        cardCoverFile.buffer,
        'card-covers'
      );
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url,
      });
    } else if (updateData.commentToAdd) {
      // Create comment data in Database and add needed fields
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email,
      };
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData);
    } else if (updateData.incomingMemberInfo) {
      // Handle adding/removing card members
      updatedCard = await cardModel.updateMembers(
        cardId,
        updateData.incomingMemberInfo
      );
    } else {
      updatedCard = await cardModel.update(cardId, updateData);
    }
    return updatedCard;
  } catch (error) {
    throw error;
  }
};
export const cardService = {
  createNew,
  update,
};
