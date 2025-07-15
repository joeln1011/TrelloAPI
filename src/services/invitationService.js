import { StatusCodes } from 'http-status-codes';
import { invitationModel } from '~/models/invitationModel';
import { userModel } from '~/models/userModel';
import { boardModel } from '~/models/boardModel';
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants';
import { pickUser } from '~/utils/formatters';
import ApiError from '~/utils/ApiError';

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    const inviter = await userModel.findOneById(inviterId);
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail);
    const board = await boardModel.findOneById(reqBody.boardId);

    if (!invitee || !board || !inviter) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Invitee, inviter or board not found!'
      );
    }

    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING, // default status is PENDING
      },
    };

    // Call the model to create a new invitation to database
    const createdInvitation = await invitationModel.createNewBoardInvitation(
      newInvitationData
    );
    const getInvitation = await invitationModel.findOneById(
      createdInvitation.insertedId
    );

    // return the info of board, inviter and invitee for FE
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee),
    };
    return resInvitation;
  } catch (error) {
    throw error;
  }
};

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId);
    // Converted inviter, invitee and board from Array to Json object before tranfer for FE
    const resInvitations = getInvitations.map((i) => ({
      ...i,
      inviter: i.inviter[0] || {},
      invitee: i.invitee[0] || {},
      board: i.board[0] || {},
    }));
    return resInvitations;
  } catch (error) {
    throw error;
  }
};

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // Find the invitation in Model
    const getInvitation = await invitationModel.findOneById(invitationId);
    if (!getInvitation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!');
    }
    // After getInvitation, get all data of board
    const boardId = getInvitation.boardInvitation.boardId;
    const getBoard = await boardModel.findOneById(boardId);
    if (!getBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!');
    }

    const boardOwnerAndMemberIds = [
      ...getBoard.ownerIds,
      ...getBoard.memberIds,
    ].toString();
    // If status is ACCEPTED, check if userId is owner or member of board
    if (
      status === BOARD_INVITATION_STATUS.ACCEPTED &&
      boardOwnerAndMemberIds.includes(userId)
    ) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'You are already a member of this board!'
      );
    }
    //Create data to update invitation
    const updateData = {
      boardInvitation: { ...getInvitation.boardInvitation, status: status },
    };
    // Update status of invitation
    const updatedInvitation = await invitationModel.update(
      invitationId,
      updateData
    );

    if (
      updatedInvitation.boardInvitation.status ===
      BOARD_INVITATION_STATUS.ACCEPTED
    ) {
      await boardModel.pushMemberIds(boardId, userId);
    }
    return updatedInvitation;
  } catch (error) {
    throw error;
  }
};

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation,
};
