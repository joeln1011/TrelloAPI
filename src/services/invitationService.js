import { StatusCodes } from 'http-status-codes';
import { invitationModel } from '~/models/invitationModel';
import { userModel } from '~/models/userModel';
import { boardModel } from '~/models/boardModel';
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants';
import { pickUser } from '~/utils/formatters';
import ApiError from '~/utils/ApiError';

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    console.log('service');
    const inviter = await userModel.findOneById(inviterId);
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail);
    const board = await boardModel.findOneById(reqBody.boardId);

    console.log({ inviter, invitee, board });

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
        status: BOARD_INVITATION_STATUS.PENDING,
      },
    };

    // Call the model to create a new invitation to database
    const createdInvitation = await invitationModel.createNewBoardInvitation(
      newInvitationData
    );
    const getInvitation = await invitationModel.findOneById(
      createdInvitation.insertedId.toString()
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

export const invitationService = { createNewBoardInvitation };
